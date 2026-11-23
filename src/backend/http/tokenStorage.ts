import type { AuthTokenResponse } from '../types'

/**
 * Token storage for the two mutually exclusive session kinds.
 *
 * - Access token: kept IN MEMORY (auditor). Lost on reload; restored through the refresh token.
 * - Refresh token (auditor): `sessionStorage` (cleared when the tab closes).
 * - SuperAdmin: the API issues no refresh token, so its short-lived access token is also kept in
 *   `sessionStorage` to survive a reload within the tab.
 *
 * Setting a session of one kind always wipes the other kind (they are mutually exclusive).
 */

export type SessionKind = 'auditor' | 'superadmin'

const KIND_KEY = 'usbid.session.kind'
const REFRESH_KEY = 'usbid.session.refresh'
const SA_ACCESS_KEY = 'usbid.session.sa-access'

let accessToken: string | null = null
let expiresAtUtc: string | null = null
const listeners = new Set<() => void>()

function safeStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

function notify(): void {
  listeners.forEach((l) => l())
}

/** Which kind of session is active ('auditor' | 'superadmin'), or null when signed out. */
export function getSessionKind(): SessionKind | null {
  const v = safeStorage()?.getItem(KIND_KEY)
  return v === 'auditor' || v === 'superadmin' ? v : null
}

/** Current access token (memory first, then SuperAdmin's persisted copy). */
export function getAccessToken(): string | null {
  if (accessToken) return accessToken
  if (getSessionKind() === 'superadmin') {
    return safeStorage()?.getItem(SA_ACCESS_KEY) ?? null
  }
  return null
}

/** Auditor refresh token from sessionStorage (null for SuperAdmin / signed out). */
export function getRefreshToken(): string | null {
  return safeStorage()?.getItem(REFRESH_KEY) || null
}

/** ISO expiry timestamp of the current access token, if known. */
export function getExpiresAtUtc(): string | null {
  return expiresAtUtc
}

/** Whether any session material exists (access token or a refresh token that can mint one). */
export function hasSession(): boolean {
  return getSessionKind() !== null && (getAccessToken() !== null || getRefreshToken() !== null)
}

/**
 * Persist a freshly issued token pair for the given session kind, clearing the other kind.
 * SuperAdmin refreshToken is empty and is therefore never stored.
 */
export function setSession(kind: SessionKind, tokens: AuthTokenResponse): void {
  const store = safeStorage()
  accessToken = tokens.accessToken
  expiresAtUtc = tokens.expiresAtUtc
  store?.setItem(KIND_KEY, kind)
  if (kind === 'auditor') {
    store?.removeItem(SA_ACCESS_KEY)
    if (tokens.refreshToken) store?.setItem(REFRESH_KEY, tokens.refreshToken)
  } else {
    store?.removeItem(REFRESH_KEY)
    store?.setItem(SA_ACCESS_KEY, tokens.accessToken)
  }
  notify()
}

/** Rotate tokens after a refresh while keeping the session kind. */
export function updateAuditorTokens(tokens: AuthTokenResponse): void {
  setSession('auditor', tokens)
}

/** Wipe every token and the session kind (logout / auth failure). */
export function clearSession(): void {
  accessToken = null
  expiresAtUtc = null
  const store = safeStorage()
  store?.removeItem(KIND_KEY)
  store?.removeItem(REFRESH_KEY)
  store?.removeItem(SA_ACCESS_KEY)
  notify()
}

/** Subscribe to token changes. Returns an unsubscribe function. */
export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

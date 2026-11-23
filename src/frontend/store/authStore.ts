import { create } from 'zustand'
import { decodeJwt } from '@/backend/http/jwt'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getSessionKind,
  subscribeToSession,
  type SessionKind,
} from '@/backend/http/tokenStorage'
import { refreshAuditorToken } from '@/backend/http/axiosClient'
import { logout as logoutService } from '@/backend/services/authService'
import type { RoleName } from '@/backend/types'

/**
 * Auth state mirrored from the backend token storage.
 *
 * Tokens themselves live in `backend/http/tokenStorage`; this store only exposes decoded, UI-relevant
 * claims (role, org, corp code) and a bootstrap status so guards can wait for session restoration.
 */
interface AuthState {
  /** 'loading' until the initial session restore (refresh after reload) has finished. */
  status: 'loading' | 'authenticated' | 'unauthenticated'
  kind: SessionKind | null
  role: RoleName | null
  organizationId: string | null
  corpCode: string | null
  auditorId: string | null
  username: string | null
  /** Re-read tokens and decode claims into the store. */
  syncFromTokens: () => void
  /** Restore a session after a page reload (auditor: use refresh token; SuperAdmin: persisted access token). */
  bootstrap: () => Promise<void>
  /** Sign out of whichever session is active and reset state. */
  signOut: () => Promise<void>
}

const signedOut = {
  kind: null,
  role: null,
  organizationId: null,
  corpCode: null,
  auditorId: null,
  username: null,
} as const

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  ...signedOut,

  syncFromTokens: () => {
    const kind = getSessionKind()
    const token = getAccessToken()
    const claims = token ? decodeJwt(token) : null
    if (!kind || !claims) {
      // Keep 'loading' while bootstrap is still running; otherwise we are signed out.
      set({ ...signedOut, status: get().status === 'loading' ? 'loading' : 'unauthenticated' })
      return
    }
    set({
      status: 'authenticated',
      kind,
      role: claims.role,
      organizationId: claims.organizationId,
      corpCode: claims.corpCode,
      auditorId: claims.auditorId,
      username: claims.username,
    })
  },

  bootstrap: async () => {
    const kind = getSessionKind()
    try {
      if (kind === 'auditor' && !getAccessToken() && getRefreshToken()) {
        await refreshAuditorToken()
      }
    } catch {
      clearSession()
    }
    // Resolve 'loading' definitively.
    const token = getAccessToken()
    const claims = token ? decodeJwt(token) : null
    if (getSessionKind() && claims) {
      set({
        status: 'authenticated',
        kind: getSessionKind(),
        role: claims.role,
        organizationId: claims.organizationId,
        corpCode: claims.corpCode,
        auditorId: claims.auditorId,
        username: claims.username,
      })
    } else {
      set({ ...signedOut, status: 'unauthenticated' })
    }
  },

  signOut: async () => {
    await logoutService()
    set({ ...signedOut, status: 'unauthenticated' })
  },
}))

// Any token change (login, refresh, clear) re-syncs the decoded claims.
subscribeToSession(() => useAuthStore.getState().syncFromTokens())

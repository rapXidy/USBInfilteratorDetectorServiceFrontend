import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokenResponse } from '../types'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getSessionKind,
  updateAuditorTokens,
  type SessionKind,
} from './tokenStorage'

/** API base URL from `VITE_API_BASE_URL` (no trailing slash). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'https://localhost:44357'

/** Shared Axios instance for every API call. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

/** Separate bare instance for the refresh call so it never re-enters the interceptors. */
const refreshClient = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' }, timeout: 30_000 })

type AuthFailureHandler = (kind: SessionKind) => void
let authFailureHandler: AuthFailureHandler | null = null

/**
 * Register the callback fired when a session can no longer be recovered (refresh failed / SuperAdmin 401).
 * The frontend wires this to "clear store + navigate to the right login".
 */
export function setAuthFailureHandler(handler: AuthFailureHandler | null): void {
  authFailureHandler = handler
}

/** Auth endpoints where a 401 means "bad credentials", not "expired session". */
function isCredentialEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')
}

/** Single in-flight refresh shared by all queued 401 requests. */
let refreshInFlight: Promise<string> | null = null

/**
 * POST /api/auth/refresh with the stored refresh token and rotate the stored pair.
 * Concurrent callers share one network call (request queueing).
 */
export function refreshAuditorToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.reject(new Error('No refresh token'))

  refreshInFlight = refreshClient
    .post<AuthTokenResponse>('/api/auth/refresh', { refreshToken })
    .then((res) => {
      updateAuditorTokens(res.data)
      return res.data.accessToken
    })
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

// Attach the Bearer token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

// On 401: auditors try one refresh then replay; SuperAdmin has no refresh so it goes straight to failure.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || isCredentialEndpoint(original.url)) {
      return Promise.reject(error)
    }

    const kind = getSessionKind()
    if (kind === 'superadmin') {
      clearSession()
      authFailureHandler?.('superadmin')
      return Promise.reject(error)
    }

    if (kind === 'auditor' && !original._retried && getRefreshToken()) {
      original._retried = true
      try {
        const newToken = await refreshAuditorToken()
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch {
        clearSession()
        authFailureHandler?.('auditor')
        return Promise.reject(error)
      }
    }

    // No usable session at all.
    clearSession()
    authFailureHandler?.(kind ?? 'auditor')
    return Promise.reject(error)
  },
)

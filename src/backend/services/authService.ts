import { apiClient, refreshAuditorToken } from '../http/axiosClient'
import { clearSession, getRefreshToken, setSession } from '../http/tokenStorage'
import type { AuthTokenResponse, LoginRequest, SuperAdminLoginRequest } from '../types'

/** POST /api/auth/login — exchange CorpCode credentials for a JWT pair and store it (auditor session). */
export async function login(body: LoginRequest): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<AuthTokenResponse>('/api/auth/login', body)
  setSession('auditor', data)
  return data
}

/** POST /api/superadmin/auth/login — platform login; stores the access token only (refreshToken is empty). */
export async function superAdminLogin(body: SuperAdminLoginRequest): Promise<AuthTokenResponse> {
  const { data } = await apiClient.post<AuthTokenResponse>('/api/superadmin/auth/login', body)
  setSession('superadmin', data)
  return data
}

/** POST /api/auth/refresh — rotate the auditor token pair using the stored refresh token. Returns the new access token. */
export async function refreshSession(): Promise<string> {
  return refreshAuditorToken()
}

/**
 * POST /api/auth/logout — revoke the refresh token server-side (best effort), then clear local tokens.
 * SuperAdmin has no server-side session, so it only clears local state.
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (refreshToken) {
      await apiClient.post('/api/auth/logout', { refreshToken })
    }
  } catch {
    // Revocation failure must never block sign-out locally.
  } finally {
    clearSession()
  }
}

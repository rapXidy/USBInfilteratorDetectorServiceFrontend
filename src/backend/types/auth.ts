/** Auth DTOs — mirror `AuthDtos.cs` (camelCase over the wire). */

/** POST /api/auth/login body. */
export interface LoginRequest {
  corpCode: string
  username: string
  password: string
}

/** POST /api/auth/refresh and /api/auth/logout body. */
export interface RefreshRequest {
  refreshToken: string
}

/** POST /api/superadmin/auth/login body. */
export interface SuperAdminLoginRequest {
  username: string
  password: string
}

/** Token pair returned by both login endpoints. SuperAdmin `refreshToken` is an empty string. */
export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
  /** ISO-8601 UTC timestamp of access-token expiry. */
  expiresAtUtc: string
}

/** Standard API error envelope: `{ error: string }`. */
export interface ApiErrorBody {
  error: string
}

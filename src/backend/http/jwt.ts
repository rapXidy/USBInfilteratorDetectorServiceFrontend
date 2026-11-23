import type { RoleName } from '../types'

/** Claims we care about, normalized from the API's JWT. */
export interface JwtClaims {
  role: RoleName | null
  organizationId: string | null
  corpCode: string | null
  auditorId: string | null
  username: string | null
  /** Expiry as epoch milliseconds, if present. */
  expiresAt: number | null
}

const ROLE_URI = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const NAME_URI = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'

function pickString(payload: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = payload[k]
    if (typeof v === 'string' && v) return v
    // Multiple roles would come as an array — take the first.
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  }
  return null
}

/**
 * Decode (NOT verify) a JWT payload to read role/org claims for UI purposes.
 * The API remains the authority — this is only used to shape navigation.
 */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    const payload = JSON.parse(json) as Record<string, unknown>
    const role = pickString(payload, 'role', ROLE_URI) as RoleName | null
    return {
      role,
      organizationId: pickString(payload, 'organizationId'),
      corpCode: pickString(payload, 'corpCode'),
      auditorId: pickString(payload, 'auditorId'),
      username: pickString(payload, 'unique_name', 'name', NAME_URI, 'sub'),
      expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : null,
    }
  } catch {
    return null
  }
}

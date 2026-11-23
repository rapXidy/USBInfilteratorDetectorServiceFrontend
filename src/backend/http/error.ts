import axios from 'axios'

/** Normalized error shape used by the UI. */
export interface ParsedApiError {
  message: string
  status: number | null
  /** Per-field messages when the API returned ASP.NET validation problem details. */
  fieldErrors?: Record<string, string[]>
}

/**
 * Parse any thrown value into `{ message, status }`.
 * Understands the API's `{ error: string }` envelope, ASP.NET ProblemDetails, rate limiting and network failures.
 */
export function parseApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): ParsedApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? null
    const data = err.response?.data as
      | { error?: unknown; title?: unknown; detail?: unknown; errors?: Record<string, string[]> }
      | undefined

    if (!err.response) {
      return { message: 'Cannot reach the server. Check your connection and the API URL.', status: null }
    }
    if (data && typeof data.error === 'string' && data.error) {
      return { message: data.error, status }
    }
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors).flat()[0]
      return { message: first ?? (typeof data.title === 'string' ? data.title : fallback), status, fieldErrors: data.errors }
    }
    if (data && typeof data.detail === 'string') return { message: data.detail, status }
    if (data && typeof data.title === 'string') return { message: data.title, status }
    if (status === 429) return { message: 'Too many attempts. Please wait a minute and try again.', status }
    if (status === 401) return { message: 'Your session is not authorized. Please sign in again.', status }
    if (status === 403) return { message: 'You do not have permission to do that.', status }
    if (status === 404) return { message: 'The requested item was not found.', status }
    return { message: fallback, status }
  }
  if (err instanceof Error && err.message) return { message: err.message, status: null }
  return { message: fallback, status: null }
}

/** Convenience wrapper returning only the message string (toast / inline error text). */
export function getErrorMessage(err: unknown, fallback?: string): string {
  return parseApiError(err, fallback).message
}

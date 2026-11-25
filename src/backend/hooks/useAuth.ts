import { useMutation } from '@tanstack/react-query'
import { changePassword, forgotPassword, login, logout, superAdminLogin } from '../services/authService'
import type {
  AuthTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  SuperAdminLoginRequest,
} from '../types'

/** Mutation wrapper for POST /api/auth/login (auditor sign-in; tokens are stored by the service). */
export function useLoginMutation() {
  return useMutation<AuthTokenResponse, unknown, LoginRequest>({ mutationFn: login })
}

/** Mutation wrapper for POST /api/superadmin/auth/login (platform sign-in). */
export function useSuperAdminLoginMutation() {
  return useMutation<AuthTokenResponse, unknown, SuperAdminLoginRequest>({ mutationFn: superAdminLogin })
}

/** Mutation wrapper for POST /api/auth/forgot-password. */
export function useForgotPasswordMutation() {
  return useMutation<ForgotPasswordResponse, unknown, ForgotPasswordRequest>({ mutationFn: forgotPassword })
}

/** Mutation wrapper for POST /api/auth/change-password. */
export function useChangePasswordMutation() {
  return useMutation<void, unknown, ChangePasswordRequest>({ mutationFn: changePassword })
}

/** Mutation wrapper for POST /api/auth/logout — revokes the refresh token and clears local session. */
export function useLogoutMutation() {
  return useMutation<void, unknown, void>({ mutationFn: logout })
}

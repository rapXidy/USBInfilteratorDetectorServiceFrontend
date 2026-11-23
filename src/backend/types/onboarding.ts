import type { OnboardingStatus, SubscriptionPlan } from './enums'

/** Onboarding DTOs — mirror `OnboardingDtos.cs`. */

/** POST /api/onboarding/organization body (org + first Admin). */
export interface StartOnboardingRequest {
  name: string
  email: string
  phone?: string | null
  officeAddress?: string | null
  sector?: string | null
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
}

/** PUT /api/onboarding/organization/{id} body. */
export interface UpdateOnboardingRequest {
  name: string
  email: string
  phone?: string | null
  officeAddress?: string | null
  sector?: string | null
}

/** Response for start / update / get-status. `corpCode` is only populated once onboarding is completed. */
export interface OnboardingStatusResponse {
  organizationId: string
  name: string
  email: string
  status: OnboardingStatus
  isActive: boolean
  corpCode: string | null
}

/** Response of POST .../{id}/complete. `apiKey` is returned ONCE and never again. */
export interface CompleteOnboardingResponse {
  organizationId: string
  corpCode: string
  apiKey: string
  apiKeyPrefix: string
  adminUsername: string
  subscriptionPlan: SubscriptionPlan
}

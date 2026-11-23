import { apiClient } from '../http/axiosClient'
import type {
  CompleteOnboardingResponse,
  OnboardingStatusResponse,
  StartOnboardingRequest,
  UpdateOnboardingRequest,
} from '../types'

/** POST /api/onboarding/organization — create a Draft organization and its first Admin auditor (public). */
export async function startOnboarding(body: StartOnboardingRequest): Promise<OnboardingStatusResponse> {
  const { data } = await apiClient.post<OnboardingStatusResponse>('/api/onboarding/organization', body)
  return data
}

/** PUT /api/onboarding/organization/{id} — update a Draft organization's profile (public). */
export async function updateOnboarding(id: string, body: UpdateOnboardingRequest): Promise<OnboardingStatusResponse> {
  const { data } = await apiClient.put<OnboardingStatusResponse>(`/api/onboarding/organization/${id}`, body)
  return data
}

/** GET /api/onboarding/organization/{id} — read onboarding status (used to resume a draft). */
export async function getOnboardingStatus(id: string): Promise<OnboardingStatusResponse> {
  const { data } = await apiClient.get<OnboardingStatusResponse>(`/api/onboarding/organization/${id}`)
  return data
}

/** POST /api/onboarding/organization/{id}/complete — finish onboarding; returns CorpCode + Worker API key ONCE. */
export async function completeOnboarding(id: string): Promise<CompleteOnboardingResponse> {
  const { data } = await apiClient.post<CompleteOnboardingResponse>(`/api/onboarding/organization/${id}/complete`)
  return data
}

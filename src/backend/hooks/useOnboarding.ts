import { useMutation, useQuery } from '@tanstack/react-query'
import {
  completeOnboarding,
  getOnboardingStatus,
  startOnboarding,
  updateOnboarding,
} from '../services/onboardingService'
import { queryKeys } from '../queryKeys'
import type {
  CompleteOnboardingResponse,
  OnboardingStatusResponse,
  StartOnboardingRequest,
  UpdateOnboardingRequest,
} from '../types'

/** Mutation for POST /api/onboarding/organization — creates the Draft org and first Admin. */
export function useStartOnboarding() {
  return useMutation<OnboardingStatusResponse, unknown, StartOnboardingRequest>({ mutationFn: startOnboarding })
}

/** Mutation for PUT /api/onboarding/organization/{id} — updates the Draft profile. */
export function useUpdateOnboarding(id: string) {
  return useMutation<OnboardingStatusResponse, unknown, UpdateOnboardingRequest>({
    mutationFn: (body) => updateOnboarding(id, body),
  })
}

/** Query for GET /api/onboarding/organization/{id} — onboarding status (resume draft). */
export function useOnboardingStatus(id: string | undefined) {
  return useQuery<OnboardingStatusResponse>({
    queryKey: queryKeys.onboarding.status(id ?? ''),
    queryFn: () => getOnboardingStatus(id as string),
    enabled: !!id,
    retry: false,
  })
}

/** Mutation for POST /api/onboarding/organization/{id}/complete — returns CorpCode + API key once. */
export function useCompleteOnboarding(id: string) {
  return useMutation<CompleteOnboardingResponse, unknown, void>({ mutationFn: () => completeOnboarding(id) })
}

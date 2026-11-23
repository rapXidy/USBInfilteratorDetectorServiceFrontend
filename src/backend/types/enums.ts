/**
 * Enum mirrors of the API domain enums.
 *
 * The .NET API serializes enums as NUMBERS (no JsonStringEnumConverter), so every enum here is a numeric
 * const object. The only exception is the dashboard summary, whose plan/status fields are plain strings.
 */

/** AuditorRole — values match the C# enum. */
export const AuditorRole = { Admin: 0, Auditor: 1, Viewer: 2 } as const
export type AuditorRole = (typeof AuditorRole)[keyof typeof AuditorRole]

/** OnboardingStatus — Draft until `/complete` is called. */
export const OnboardingStatus = { Draft: 0, Completed: 1 } as const
export type OnboardingStatus = (typeof OnboardingStatus)[keyof typeof OnboardingStatus]

/** SubscriptionPlan — values match the C# enum. */
export const SubscriptionPlan = { FreeTrial: 0, Pro: 1, Enterprise: 2 } as const
export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan]

/** SubscriptionStatus — values match the C# enum. */
export const SubscriptionStatus = { Active: 0, Expired: 1, Cancelled: 2 } as const
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus]

/** HrStaffStatus — computed on the API from resignation/exit dates. */
export const HrStaffStatus = { Active: 0, Resigning: 1, Exited: 2 } as const
export type HrStaffStatus = (typeof HrStaffStatus)[keyof typeof HrStaffStatus]

/** Role names as they appear in the JWT `role` claim. */
export type RoleName = 'Admin' | 'Auditor' | 'Viewer' | 'SuperAdmin'

/** UI labels for numeric enums. */
export const auditorRoleLabel: Record<AuditorRole, string> = { 0: 'Admin', 1: 'Auditor', 2: 'Viewer' }
export const onboardingStatusLabel: Record<OnboardingStatus, string> = { 0: 'Draft', 1: 'Completed' }
export const subscriptionPlanLabel: Record<SubscriptionPlan, string> = { 0: 'Free trial', 1: 'Pro', 2: 'Enterprise' }
export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = { 0: 'Active', 1: 'Expired', 2: 'Cancelled' }
export const hrStaffStatusLabel: Record<HrStaffStatus, string> = { 0: 'Active', 1: 'Resigning', 2: 'Exited' }

/** Convert the numeric AuditorRole to the string role name used by JWT claims / guards. */
export function auditorRoleToName(role: AuditorRole): Exclude<RoleName, 'SuperAdmin'> {
  return auditorRoleLabel[role] as Exclude<RoleName, 'SuperAdmin'>
}

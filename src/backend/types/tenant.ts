import type { AuditorRole, HrStaffStatus, OnboardingStatus, SubscriptionPlan, SubscriptionStatus } from './enums'

/** Tenant-side DTOs (dashboard, devices, auditor users, subscription, organization). */

/** GET /api/dashboard/summary — NOTE plan/status are STRINGS here (unlike the subscription endpoint). */
export interface DashboardSummary {
  hostCount: number
  sessionCount: number
  highRiskSessionCount: number
  allowedDeviceCount: number
  subscriptionPlan: string
  subscriptionStatus: string
}

/** Allowed device (whitelist entry). */
export interface AllowedDevice {
  id: string
  deviceSerial: string
  vendor: string | null
  model: string | null
  description: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateAllowedDeviceRequest {
  deviceSerial: string
  vendor?: string | null
  model?: string | null
  description?: string | null
}

export interface UpdateAllowedDeviceRequest {
  vendor?: string | null
  model?: string | null
  description?: string | null
  isActive: boolean
}

/** Auditor user (never contains a password or hash). */
export interface AuditorUser {
  id: string
  username: string
  displayName: string
  role: AuditorRole
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface CreateAuditorUserRequest {
  username: string
  password: string
  displayName: string
  role: AuditorRole
}

export interface UpdateAuditorUserRequest {
  displayName: string
  role: AuditorRole
  isActive: boolean
  /** Optional password reset; omit/null to keep the current one. */
  password?: string | null
}

/** GET /api/subscription — enums are numeric here. */
export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startsAt: string
  endsAt: string
  maxHosts: number
  webhooksEnabled: boolean
}

/** GET /api/organizations/me. */
export interface OrganizationProfile {
  id: string
  corpCode: string | null
  name: string
  email: string
  phone: string | null
  officeAddress: string | null
  sector: string | null
  isActive: boolean
  onboardingStatus: OnboardingStatus
  /** Only the prefix of the Worker API key is ever exposed. */
  apiKeyPrefix: string | null
}

/** HR staff member (tenant-scoped). */
export interface HrStaff {
  id: string
  fullName: string
  department: string
  phoneNumber: string | null
  email: string | null
  jobTitle: string | null
  employeeNumber: string | null
  windowsUsername: string | null
  deviceId: string | null
  dateEmployed: string
  dateOfResignation: string | null
  dateOfExit: string | null
  isActive: boolean
  notes: string | null
  status: HrStaffStatus
  createdAt: string
  updatedAt: string | null
}

export interface CreateHrStaffRequest {
  fullName: string
  department: string
  phoneNumber?: string | null
  email?: string | null
  jobTitle?: string | null
  employeeNumber?: string | null
  windowsUsername?: string | null
  deviceId?: string | null
  dateEmployed: string
  dateOfResignation?: string | null
  dateOfExit?: string | null
  notes?: string | null
}

export interface UpdateHrStaffRequest {
  fullName: string
  department: string
  phoneNumber?: string | null
  email?: string | null
  jobTitle?: string | null
  employeeNumber?: string | null
  windowsUsername?: string | null
  deviceId?: string | null
  dateEmployed: string
  dateOfResignation?: string | null
  dateOfExit?: string | null
  isActive: boolean
  notes?: string | null
}

export interface HrStaffListQuery {
  department?: string
  resigningOnly?: boolean
  isActive?: boolean
}

export interface HrStaffLeaverSession {
  staffId: string
  staffFullName: string
  department: string
  staffStatus: HrStaffStatus
  sessionId: string
  usbSessionId: string
  hostName: string
  loggedInUser: string | null
  hostDeviceId: string
  deviceSerial: string
  connectedAt: string
  disconnectedAt: string | null
  totalBytesWritten: number
  riskScore: number
  detectionComplete: boolean
}

export interface HrStaffSummary {
  resigningCount: number
  recentLeaverSessionCount: number
}

/** SuperAdmin view of an organization. */
export interface SuperAdminOrganization {
  id: string
  corpCode: string | null
  name: string
  email: string
  isActive: boolean
  onboardingStatus: OnboardingStatus
  createdAt: string
  onboardingCompletedAt: string | null
  apiKeyPrefix: string | null
}

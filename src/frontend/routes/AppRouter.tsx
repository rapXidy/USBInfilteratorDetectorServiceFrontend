import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setAuthFailureHandler } from '@/backend/http/axiosClient'
import { LoadingScreen } from '@/frontend/components/LoadingScreen'
import { AppShell } from '@/frontend/layouts/AppShell'
import { AuthLayout } from '@/frontend/layouts/AuthLayout'
import { SuperAdminShell } from '@/frontend/layouts/SuperAdminShell'
import { useAuthStore } from '@/frontend/store/authStore'
import { AuthGuard } from './AuthGuard'
import { RoleGuard } from './RoleGuard'
import { SuperAdminGuard } from './SuperAdminGuard'

// Route-level pages are code-split.
const LoginPage = lazy(() => import('@/frontend/pages/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/frontend/pages/ForgotPasswordPage'))
const SuperAdminLoginPage = lazy(() => import('@/frontend/pages/SuperAdminLoginPage'))
const OnboardingPage = lazy(() => import('@/frontend/pages/OnboardingPage'))
const DashboardPage = lazy(() => import('@/frontend/pages/DashboardPage'))
const SessionsPage = lazy(() => import('@/frontend/pages/SessionsPage'))
const SessionDetailPage = lazy(() => import('@/frontend/pages/SessionDetailPage'))
const DevicesPage = lazy(() => import('@/frontend/pages/DevicesPage'))
const AuditorsPage = lazy(() => import('@/frontend/pages/AuditorsPage'))
const HrStaffPage = lazy(() => import('@/frontend/pages/HrStaffPage'))
const SubscriptionPage = lazy(() => import('@/frontend/pages/SubscriptionPage'))
const OrganizationPage = lazy(() => import('@/frontend/pages/OrganizationPage'))
const ChangePasswordPage = lazy(() => import('@/frontend/pages/ChangePasswordPage'))
const SuperAdminOrganizationsPage = lazy(() => import('@/frontend/pages/SuperAdminOrganizationsPage'))
const SuperAdminOrganizationDetailPage = lazy(() => import('@/frontend/pages/SuperAdminOrganizationDetailPage'))
const NotFoundPage = lazy(() => import('@/frontend/pages/NotFoundPage'))

/**
 * Wires the Axios "session unrecoverable" callback to the router:
 * clears cached data, tells the user, and sends them to the matching login page.
 */
function AuthFailureBridge() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  useEffect(() => {
    setAuthFailureHandler((kind) => {
      qc.clear()
      toast.error('Your session has expired. Please sign in again.')
      navigate(kind === 'superadmin' ? '/superadmin/login' : '/login', { replace: true })
    })
    return () => setAuthFailureHandler(null)
  }, [navigate, qc])
  return null
}

/** "/" → role-appropriate home. */
function HomeRedirect() {
  const kind = useAuthStore((s) => s.kind)
  return <Navigate to={kind === 'superadmin' ? '/superadmin/organizations' : '/dashboard'} replace />
}

/** Application route table (see plan: public / auditor / admin / SuperAdmin areas). */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthFailureBridge />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          {/* Public — login uses a dedicated split layout (hero + form) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/onboarding/:id" element={<OnboardingPage />} />
          </Route>

          {/* Tenant (auditor JWT) */}
          <Route element={<AuthGuard />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/sessions/:id" element={<SessionDetailPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/organization" element={<OrganizationPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route element={<RoleGuard allow={['Admin', 'Auditor']} />}>
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/hr-staff" element={<HrStaffPage />} />
              </Route>
              <Route element={<RoleGuard allow={['Admin']} />}>
                <Route path="/auditors" element={<AuditorsPage />} />
              </Route>
            </Route>
          </Route>

          {/* SuperAdmin */}
          <Route element={<SuperAdminGuard />}>
            <Route element={<SuperAdminShell />}>
              <Route path="/superadmin" element={<Navigate to="/superadmin/organizations" replace />} />
              <Route path="/superadmin/organizations" element={<SuperAdminOrganizationsPage />} />
              <Route path="/superadmin/organizations/:id" element={<SuperAdminOrganizationDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

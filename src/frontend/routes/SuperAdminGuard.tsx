import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/frontend/components/LoadingScreen'
import { useAuthStore } from '@/frontend/store/authStore'

/** Guards /superadmin/* routes: requires a SuperAdmin session, otherwise redirects to /superadmin/login. */
export function SuperAdminGuard() {
  const status = useAuthStore((s) => s.status)
  const kind = useAuthStore((s) => s.kind)
  const role = useAuthStore((s) => s.role)
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Restoring session…" />
  if (status !== 'authenticated' || kind !== 'superadmin' || role !== 'SuperAdmin') {
    return <Navigate to="/superadmin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

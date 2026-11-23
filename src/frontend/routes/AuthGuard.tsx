import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/frontend/components/LoadingScreen'
import { useAuthStore } from '@/frontend/store/authStore'

/** Guards tenant (auditor) routes: waits for session restore, then redirects to /login when not signed in as an auditor. */
export function AuthGuard() {
  const status = useAuthStore((s) => s.status)
  const kind = useAuthStore((s) => s.kind)
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Restoring session…" />
  if (status !== 'authenticated' || kind !== 'auditor') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

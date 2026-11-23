import { Navigate } from 'react-router-dom'
import { SuperAdminLoginForm } from '@/frontend/features/auth/SuperAdminLoginForm'
import { useAuthStore } from '@/frontend/store/authStore'

/** /superadmin/login — platform sign-in. Already-signed-in SuperAdmins go to the organizations list. */
export default function SuperAdminLoginPage() {
  const status = useAuthStore((s) => s.status)
  const kind = useAuthStore((s) => s.kind)
  if (status === 'authenticated' && kind === 'superadmin') return <Navigate to="/superadmin/organizations" replace />
  return <SuperAdminLoginForm />
}

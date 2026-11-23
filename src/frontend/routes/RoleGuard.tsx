import { Link, Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/frontend/components/ui/button'
import { useAuthStore } from '@/frontend/store/authStore'
import type { RoleName } from '@/backend/types'

interface RoleGuardProps {
  /** Roles allowed to see the nested routes. */
  allow: RoleName[]
}

/** Renders nested routes only for the allowed roles (e.g. Admin, or Admin+Auditor); otherwise a 403 panel. */
export function RoleGuard({ allow }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role)
  if (role && allow.includes(role)) return <Outlet />
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center" role="alert">
      <ShieldAlert className="h-10 w-10 text-warning" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Access restricted</h1>
      <p className="text-sm text-muted-foreground">
        Your role ({role ?? 'unknown'}) does not have permission to view this page. Ask an organization Admin if you need
        access.
      </p>
      <Button asChild variant="outline">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  )
}

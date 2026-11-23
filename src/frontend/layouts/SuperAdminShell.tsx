import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Building2, LogOut, ShieldHalf } from 'lucide-react'
import { Button } from '@/frontend/components/ui/button'
import { cn } from '@/frontend/lib/utils'
import { useAuthStore } from '@/frontend/store/authStore'

/** Platform console layout for SuperAdmin: top bar with nav + sign-out. */
export function SuperAdminShell() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const username = useAuthStore((s) => s.username)
  const signOut = useAuthStore((s) => s.signOut)

  async function handleSignOut() {
    await signOut()
    qc.clear()
    navigate('/superadmin/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b bg-slate-900 text-slate-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldHalf className="h-5 w-5 text-sky-400" aria-hidden="true" />
              <span className="hidden sm:inline">Platform console</span>
            </span>
            <nav aria-label="SuperAdmin">
              <NavLink
                to="/superadmin/organizations"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium',
                    isActive ? 'bg-slate-700' : 'text-slate-300 hover:bg-slate-800',
                  )
                }
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Organizations
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-300 sm:inline">{username}</span>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

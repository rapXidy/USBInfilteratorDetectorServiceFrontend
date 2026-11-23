import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  Usb,
  Users,
} from 'lucide-react'
import { useMyOrganization } from '@/backend/hooks/useTenant'
import { Button } from '@/frontend/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/frontend/components/ui/dialog'
import { Skeleton } from '@/frontend/components/ui/skeleton'
import { cn } from '@/frontend/lib/utils'
import { useAuthStore } from '@/frontend/store/authStore'
import type { RoleName } from '@/backend/types'
import { useQueryClient } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Roles that can see the item; omitted = every auditor-kind role. */
  roles?: RoleName[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sessions', label: 'Sessions', icon: ListChecks },
  { to: '/devices', label: 'Allowed devices', icon: Usb, roles: ['Admin', 'Auditor'] },
  { to: '/hr-staff', label: 'HR Staff', icon: Briefcase, roles: ['Admin', 'Auditor'] },
  { to: '/auditors', label: 'Auditor users', icon: Users, roles: ['Admin'] },
  { to: '/subscription', label: 'Subscription', icon: CreditCard },
  { to: '/organization', label: 'Organization', icon: Building2 },
]

/** Sidebar link list, filtered by the signed-in role. */
function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((s) => s.role)
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV_ITEMS.filter((i) => !i.roles || (role && i.roles.includes(role))).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

/** Brand + organization name (from GET /organizations/me). */
function SidebarHeader() {
  const { data, isLoading } = useMyOrganization()
  return (
    <div className="mb-6 flex items-center gap-3 px-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">USB Infilterator</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-3 w-24" />
        ) : (
          <p className="truncate text-xs text-muted-foreground" title={data?.name}>
            {data?.name ?? 'Organization'}
          </p>
        )}
      </div>
    </div>
  )
}

/** Tenant layout: persistent sidebar on desktop, off-canvas drawer on mobile, top bar with user + sign-out. */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const username = useAuthStore((s) => s.username)
  const role = useAuthStore((s) => s.role)
  const corpCode = useAuthStore((s) => s.corpCode)
  const signOut = useAuthStore((s) => s.signOut)

  async function handleSignOut() {
    await signOut()
    qc.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <aside className="hidden border-r bg-card p-4 lg:block">
        <div className="sticky top-4">
          <SidebarHeader />
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-card/95 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
            {corpCode && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                CorpCode <span className="font-mono font-semibold text-foreground">{corpCode}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs leading-tight">
              <p className="font-medium">{username}</p>
              <p className="text-muted-foreground">{role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
              <span className="sr-only sm:hidden">Sign out</span>
            </Button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          hideClose
          className="left-0 top-0 h-full max-h-full w-72 max-w-xs translate-x-0 translate-y-0 content-start rounded-none p-4 lg:hidden"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <DialogDescription className="sr-only">Main navigation links</DialogDescription>
          <SidebarHeader />
          <SidebarNav onNavigate={() => setDrawerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

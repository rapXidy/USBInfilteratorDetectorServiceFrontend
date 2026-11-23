import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

/** Centered, branded layout for public pages (login, SuperAdmin login, onboarding). */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-10">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        USB Infilterator Detector
      </div>
      <main id="main-content" className="w-full max-w-lg">
        <Outlet />
      </main>
      <p className="mt-8 text-xs text-muted-foreground">Detect, explain and audit USB data exfiltration.</p>
    </div>
  )
}

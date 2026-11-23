import { Navigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { LoginForm } from '@/frontend/features/auth/LoginForm'
import { LoginHeroPanel } from '@/frontend/features/auth/LoginHeroPanel'
import { useAuthStore } from '@/frontend/store/authStore'

/** /login — auditor sign-in over a full-bleed hero background. */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status)
  const kind = useAuthStore((s) => s.kind)
  if (status === 'authenticated' && kind === 'auditor') return <Navigate to="/dashboard" replace />

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 md:justify-end md:px-12 lg:px-20">
      <LoginHeroPanel />

      <div className="relative z-10 w-full max-w-md md:mr-[4vw]">
        <div className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-white drop-shadow">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#031e37] text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          USB Infilterator Detector
        </div>

        <main id="main-content" className="relative rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <LoginForm />
        </main>

        <p className="mt-8 text-center text-xs text-white/80 drop-shadow">
          Detect, explain and audit USB data exfiltration.
        </p>
      </div>
    </div>
  )
}

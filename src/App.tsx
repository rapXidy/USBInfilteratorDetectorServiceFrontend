import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/frontend/components/ErrorBoundary'
import { AppRouter } from '@/frontend/routes/AppRouter'
import { useAuthStore } from '@/frontend/store/authStore'

/** Shared TanStack Query client: no retry on 4xx, modest staleness for dashboard-style data. */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

/** Root component: providers, session bootstrap and the router. */
export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  // Restore an existing session (refresh-token flow) once on startup.
  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster richColors closeButton position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

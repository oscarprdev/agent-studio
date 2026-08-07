"use client"

import RetryErrorState from "@/components/errors/retry-error-state"

// Manual testing checklist (AGE-24):
// 1. Introduce a controlled throw in app/page.tsx — confirm boundary shows with retry button
// 2. Click retry — confirm segment re-fetches (no full page reload)
// 3. Visit a route that calls notFound() — confirm 404 still works (no error UI)
// 4. Visit a route that calls redirect() — confirm navigation works (no error UI)
// 5. Verify no stack traces, digests, or secrets appear in error message
// 6. Test mobile viewport (Chrome DevTools responsive mode)
// 7. Tab to retry button — confirm keyboard activation (Tab → Enter)

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <RetryErrorState
      error={error}
      onRetry={retry}
      title="Application Error"
    />
  )
}
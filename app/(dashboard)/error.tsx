"use client"

import RetryErrorState from "@/components/errors/retry-error-state"

export default function DashboardError({
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
      title="Dashboard Error"
    />
  )
}
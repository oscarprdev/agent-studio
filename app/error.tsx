"use client"

import RetryErrorState from "@/components/errors/retry-error-state"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <RetryErrorState error={error} onRetry={retry} title="Application Error" />
  )
}
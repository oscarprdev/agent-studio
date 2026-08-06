"use client"

import { catchError, type ErrorInfo } from "next/error"

import RetryErrorState from "./retry-error-state"

interface FallbackProps {
  title?: string
}

function ErrorFallback(
  props: FallbackProps,
  { error, retry }: ErrorInfo,
) {
  return <RetryErrorState error={error} onRetry={retry} title={props.title} />
}

const CatchErrorBoundary = catchError<FallbackProps>(ErrorFallback)

export default CatchErrorBoundary

export type { ErrorInfo, FallbackProps }
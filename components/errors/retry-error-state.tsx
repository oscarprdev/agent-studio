"use client"

import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RetryErrorStateProps {
  error: Error | unknown
  onRetry: () => void
  title?: string
}

function RetryErrorState({ error, onRetry, title }: RetryErrorStateProps) {
  if (typeof window !== "undefined" && process.env?.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error("Error captured by RetryErrorState:", error)
  }

  const heading = title ?? "Something went wrong"

  return (
    <Card
      role="alert"
      aria-live="assertive"
      className="mx-auto max-w-md"
    >
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <h2 className="font-heading text-base leading-snug font-medium text-center">
          {heading}
        </h2>
        <p className="text-sm text-muted-foreground">
          Try again
        </p>
        <Button onClick={onRetry}>
          <RefreshCwIcon data-icon="inline-start" />
          Try again
        </Button>
      </CardContent>
    </Card>
  )
}

export default RetryErrorState
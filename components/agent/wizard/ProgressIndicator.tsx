"use client"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Check } from "lucide-react"

const DEFAULT_STEPS = ["Goal", "Tools", "Skills", "Context", "Generate"]

interface ProgressIndicatorProps {
  steps?: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function ProgressIndicator({
  steps = DEFAULT_STEPS,
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  const isCompleted = (index: number) => index < currentStep
  const isActive = (index: number) => index === currentStep
  const isClickable = (index: number) => isCompleted(index) && !!onStepClick

  return (
    <div className="flex w-full items-center justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex min-w-0 shrink-0 items-center">
          <div className="flex w-20 flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!isClickable(index)}
              aria-label={`Step ${index + 1}: ${step}${isCompleted(index) ? " (completed)" : ""}`}
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                isCompleted(index) && "border-primary bg-primary/15 text-primary",
                isActive(index) && "border-primary bg-primary text-primary-foreground",
                !isCompleted(index) && !isActive(index) && "border-muted-foreground/30 text-muted-foreground",
                isClickable(index) && "cursor-pointer hover:bg-primary/90",
                !isClickable(index) && "cursor-default"
              )}
            >
              {isCompleted(index) ? (
                <Check className="size-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </button>
            <span className={cn(
              "text-xs font-medium hidden sm:block",
              isActive(index) ? "text-foreground" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <Separator className="mx-2 w-8 sm:w-16" />
          )}
        </div>
      ))}
    </div>
  )
}
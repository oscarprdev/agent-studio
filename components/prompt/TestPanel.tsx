"use client"

import { useState } from "react"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { executeMockTest } from "@/lib/prompts/test-provider"
import type { TestResult } from "@/lib/prompts/types"

interface TestPanelProps {
  isOpen: boolean
  onClose: () => void
  currentMarkdown: string
}

export function TestPanel({ isOpen, onClose, currentMarkdown }: TestPanelProps) {
  const [userMessage, setUserMessage] = useState("")
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleRunTest() {
    setValidationError(null)

    if (userMessage.trim().length === 0) {
      setValidationError("User message is required")
      return
    }

    setIsRunning(true)
    setTestResult(null)

    try {
      const result = executeMockTest(currentMarkdown, userMessage.trim())
      setTestResult(result)
    } catch {
      setTestResult({
        input: userMessage.trim(),
        output: "Mock execution failed",
        createdAt: new Date().toISOString(),
        status: "error",
      })
    } finally {
      setIsRunning(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose()
    }
  }

  const isSuccess = testResult?.status === "success"
  const isError = testResult?.status === "error"

  const formattedDate = testResult
    ? new Date(testResult.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : ""

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Test Prompt</SheetTitle>
          <SheetDescription>
            Run a mock test against the current prompt draft.
          </SheetDescription>
        </SheetHeader>

        {/* Prompt preview */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Prompt (read-only)
          </label>
          <Textarea
            readOnly
            value={currentMarkdown}
            className="min-h-[120px] resize-none bg-muted font-mono text-sm"
          />
        </div>

        {/* User message input */}
        <FieldGroup>
          <Field data-invalid={!!validationError}>
            <FieldLabel htmlFor="test-user-message">User message</FieldLabel>
            <Input
              id="test-user-message"
              value={userMessage}
              onChange={(e) => {
                setUserMessage(e.target.value)
                setValidationError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleRunTest()
                }
              }}
              placeholder="Enter a sample user message..."
              aria-invalid={!!validationError}
              disabled={isRunning}
            />
            {validationError && (
              <FieldDescription>{validationError}</FieldDescription>
            )}
          </Field>
        </FieldGroup>

        {/* Run button */}
        <Button
          onClick={handleRunTest}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <Spinner data-icon="inline-start" />
              Running...
            </>
          ) : (
            "Run Test"
          )}
        </Button>

        {/* Result */}
        {testResult && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant={isSuccess ? "default" : "destructive"}>
                {isSuccess ? "Success" : "Error"}
              </Badge>
              {formattedDate && (
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                </span>
              )}
            </div>

            <label className="text-sm font-medium text-muted-foreground">
              Result
            </label>
            <Textarea
              readOnly
              value={testResult.output}
              className="min-h-[80px] resize-none bg-muted font-mono text-sm"
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
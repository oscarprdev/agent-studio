"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { AgentOutput } from "@/components/agent/AgentOutput"
import type { WizardState, AgentDefinition } from "@/lib/agents/types"

interface GenerateStepProps {
  wizardState: WizardState
  onGenerate: () => void
  isGenerating: boolean
  generatedAgent?: AgentDefinition
}

export function GenerateStep({
  wizardState,
  onGenerate,
  isGenerating,
  generatedAgent,
}: GenerateStepProps) {
  const [copied, setCopied] = useState(false)

  const goalFirstLine = wizardState.goal.split("\n")[0] || wizardState.goal
  const contextFirstLine = wizardState.context
    ? wizardState.context.split("\n")[0]
    : null

  const handleCopy = async () => {
    if (!generatedAgent) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedAgent, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available or denied
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Goal
            </span>
            <p className="text-sm">{goalFirstLine}</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tools
            </span>
            <p className="text-sm">
              {wizardState.selectedTools.length} selected
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Skills
            </span>
            <p className="text-sm">{wizardState.skills.length} added</p>
          </div>
          {contextFirstLine && (
            <>
              <Separator />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Context
                </span>
                <p className="text-sm truncate">{contextFirstLine}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!generatedAgent && (
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
        >
          {isGenerating && <Spinner />}
          {isGenerating ? "Generating..." : "Generate Agent"}
        </Button>
      )}

      {generatedAgent && (
        <>
          <AgentOutput agent={generatedAgent} />
          <div className="flex flex-col gap-3">
            <Button onClick={onGenerate} size="lg">
              Save Agent
            </Button>
            <Button variant="outline" size="lg" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

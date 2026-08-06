"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AgentWizard } from "@/components/agent/AgentWizard"
import { TopBar } from "@/components/layout/top-bar"
import * as promptsStore from "@/lib/prompts/store"
import type { WizardState } from "@/lib/agents/types"

function AgentWizardPage() {
  const searchParams = useSearchParams()
  const promptId = searchParams.get("promptId")
  const promptContent = searchParams.get("promptContent")

  let initialState: Partial<WizardState> | undefined

  if (promptId) {
    const prompt = promptsStore.getById(promptId)
    if (prompt) {
      initialState = {
        goal: prompt.input,
        context: `${prompt.content?.role ?? ""}\n\n${prompt.content?.objective ?? ""}`,
      }
    }
  } else if (promptContent) {
    initialState = {
      goal: promptContent,
    }
  }

  return <AgentWizard initialState={initialState} />
}

export default function CreateAgentPage() {
  return (
    <>
      <TopBar title="Create Agent" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense fallback={null}>
          <AgentWizardPage />
        </Suspense>
      </div>
    </>
  )
}
"use client"

import { AgentWizard } from "@/components/agent/AgentWizard"
import { TopBar } from "@/components/layout/top-bar"

export default function CreateAgentPage() {
  return (
    <>
      <TopBar title="Create Agent" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AgentWizard />
      </div>
    </>
  )
}
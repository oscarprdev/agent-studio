"use client"

import { useRouter } from "next/navigation"
import { AgentWizard } from "@/components/agent/AgentWizard"
import { TopBar } from "@/components/layout/top-bar"

export default function CreateAgentPage() {
  const router = useRouter()

  function handleSave() {
    router.push("/agents")
  }

  return (
    <>
      <TopBar title="Create Agent" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AgentWizard onSave={handleSave} />
      </div>
    </>
  )
}
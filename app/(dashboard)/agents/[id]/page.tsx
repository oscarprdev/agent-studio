"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getById } from "@/lib/agents/store"
import type { Agent } from "@/lib/agents/types"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/layout/top-bar"
import { AgentDetailTabs } from "./_components/agent-detail-tabs"

export default function AgentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [agent, setAgent] = useState<Agent | null>(() => getById(id))

  if (!agent) {
    return (
      <>
        <TopBar title="Agent Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">Agent not found</p>
          <Button render={<Link href="/agents" />} nativeButton={false}>
            Back to Agents
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar title={agent.name} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AgentDetailTabs key={agent.updatedAt} agent={agent} />
      </div>
    </>
  )
}
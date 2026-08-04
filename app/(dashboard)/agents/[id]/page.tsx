"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getById } from "@/lib/agents/store"
import type { Agent } from "@/lib/agents/types"
import { AgentEditor } from "@/components/agent/AgentEditor"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/layout/top-bar"

export default function AgentDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const found = getById(id)
    setAgent(found)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <>
        <TopBar title="Agent" />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </>
    )
  }

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
        <AgentEditor agent={agent} onSave={setAgent} />
      </div>
    </>
  )
}
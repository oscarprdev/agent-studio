"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAll, remove } from "@/lib/agents/store"
import type { Agent } from "@/lib/agents/types"
import { AgentCard } from "@/components/agent/AgentCard"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { TopBar } from "@/components/layout/top-bar"

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(() => getAll())

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setAgents(getAll())
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  function handleDelete(id: string) {
    const agent = agents.find((a) => a.id === id)
    try {
      const removed = remove(id)
      if (removed) {
        setAgents(getAll())
        toast.add({ title: `Deleted "${agent?.name ?? "agent"}"`, type: "success" })
      } else {
        toast.add({ title: "Failed to delete agent", type: "error" })
      }
    } catch {
      toast.add({ title: "Failed to delete agent", type: "error" })
    }
  }

  return (
    <>
      <TopBar title="Agents" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My Agents</h1>
          <Button render={<Link href="/agents/new" />} nativeButton={false}>
            Create Agent
          </Button>
        </div>

        {agents.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No agents yet</EmptyTitle>
              <EmptyDescription>
                Create your first agent to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/agents/new" />} nativeButton={false}>
                Create Agent
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
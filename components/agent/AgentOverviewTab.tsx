"use client"

import { Badge } from "@/components/ui/badge"
import type { Agent, AgentDefinition } from "@/lib/agents/types"

const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("en-US", dateOptions)
}

export function AgentOverviewTab({
  agent,
  draft,
}: {
  agent: Agent
  draft: AgentDefinition
}) {
  const skillsCount = draft.skills?.length ?? 0
  const toolsCount = draft.tools?.length ?? 0
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-heading text-lg">{agent.name}</h3>
      </div>

      {agent.description && (
        <p className="text-sm text-muted-foreground">{agent.description}</p>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Model
          </span>
          <Badge variant="secondary" className="w-fit">{agent.model}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Version
          </span>
          <Badge variant="secondary">{agent.version}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Created
          </span>
          <span className="text-sm">{formatDate(agent.createdAt)}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Updated
          </span>
          <span className="text-sm">{formatDate(agent.updatedAt)}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Skills
          </span>
          <Badge variant="secondary" className="w-fit">{skillsCount}</Badge>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tools
          </span>
          <span className="text-sm">{toolsCount}</span>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useMemo } from "react"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TOOL_CANDIDATES } from "@/lib/agents/tools"
import type { Agent, AgentDefinition } from "@/lib/agents/types"

const CATEGORY_COLORS: Record<string, string> = {
  development: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  cloud: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "project-management": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  communication: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  design: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
}

interface AgentToolsTabProps {
  agent: Agent
  draft: AgentDefinition
  onChange: (draft: AgentDefinition) => void
}

export function AgentToolsTab({
  agent,
  draft,
  onChange,
}: AgentToolsTabProps) {
  const draftTools = draft.tools ?? []

  const draftToolIds = useMemo(
    () => new Set(draftTools.map((t) => t.id)),
    [draftTools],
  )

  function handleToggleTool(toolId: string) {
    if (draftToolIds.has(toolId)) {
      onChange({
        ...draft,
        tools: draftTools.filter((t) => t.id !== toolId),
      })
      return
    }

    const catalogTool = TOOL_CANDIDATES.find((t) => t.id === toolId)
    if (catalogTool) {
      onChange({ ...draft, tools: [...draftTools, catalogTool] })
    }
  }

  function handleRemoveTool(toolId: string) {
    onChange({
      ...draft,
      tools: draftTools.filter((t) => t.id !== toolId),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Assigned tools section */}
      <div>
        <h3 className="font-heading text-base">
          Assigned tools
        </h3>
        <p className="text-sm text-muted-foreground">
          {draftTools.length} tool{draftTools.length !== 1 ? "s" : ""} in draft
        </p>
      </div>

      {draftTools.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No tools assigned. Select tools from the catalog below.
        </p>
      )}

      {draftTools.length > 0 && (
        <div className="flex flex-col gap-2">
          {draftTools.map((tool) => (
            <Card key={tool.id} size="sm">
              <CardHeader>
                <CardTitle className="text-sm">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {tool.description}
                </CardDescription>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${tool.name}`}
                    onClick={() => handleRemoveTool(tool.id)}
                  >
                    <Trash2Icon data-icon="inline-end" />
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Tool catalog grid */}
      <div>
        <h3 className="font-heading text-base">
          Tool catalog
        </h3>
        <p className="text-sm text-muted-foreground">
          {TOOL_CANDIDATES.length} tools available
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOOL_CANDIDATES.map((tool) => {
          const isSelected = draftToolIds.has(tool.id)
          const categoryColor = CATEGORY_COLORS[tool.category] ?? ""

          return (
            <Card
              key={tool.id}
              size="sm"
              className={
                isSelected
                  ? "ring-2 ring-primary"
                  : undefined
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm">
                    {tool.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={categoryColor}
                  >
                    {tool.category}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-(--card-spacing) pt-0">
                <Button
                  variant={isSelected ? "secondary" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToggleTool(tool.id)}
                >
                  {isSelected ? "Assigned" : "Add"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
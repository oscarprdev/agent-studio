"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { AgentDefinition } from "@/lib/agents/types"

interface AgentOutputProps {
  agent: AgentDefinition
  className?: string
}

export function AgentOutput({ agent, className }: AgentOutputProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  const truncatedPrompt =
    agent.system_prompt.length > 300 && !showFullPrompt
      ? agent.system_prompt.slice(0, 300) + "..."
      : agent.system_prompt

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{agent.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Model
          </span>
          <Badge variant="secondary">{agent.model}</Badge>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            System Prompt
          </span>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
            {truncatedPrompt}
          </pre>
          {agent.system_prompt.length > 300 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullPrompt(!showFullPrompt)}
            >
              {showFullPrompt ? "Show less" : "Show more"}
            </Button>
          )}
        </div>

        <Separator />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tools
          </span>
          {agent.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((tool) => (
                <Badge key={tool.id} variant="outline">
                  {tool.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None</p>
          )}
        </div>

        <Separator />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Skills
          </span>
          {agent.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

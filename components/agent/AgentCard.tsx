"use client"

import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Agent } from "@/lib/agents/types"

interface AgentCardProps {
  agent: Agent
  onDelete?: (id: string) => void
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "…"
}

function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const skillCount = Array.isArray(agent.skills) ? agent.skills.length : 0
  const toolCount = Array.isArray(agent.tools) ? agent.tools.length : 0
  const formattedDate = formatDate(agent.createdAt)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate" title={agent.name}>
          {truncate(agent.name, 60)}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          {agent.model}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-2 text-muted-foreground">
          {truncate(agent.description, 120)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="text-xs">
            {skillCount} skill{skillCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {toolCount} tool{toolCount !== 1 ? "s" : ""}
          </Badge>
          <span>{formattedDate}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/agents/${agent.id}`} />}
          nativeButton={false}
        >
          View
        </Button>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" size="sm" />
              }
            >
              Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete agent</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{agent.name}&quot;? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDelete(agent.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  )
}

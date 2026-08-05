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

export function AgentCard({ agent, onDelete }: AgentCardProps) {
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

      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          {truncate(agent.description, 120)}
        </p>
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

"use client"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Prompt } from "@/lib/prompts/types"

interface PromptCardProps {
  prompt: Prompt
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate" title={prompt.title}>
          {prompt.title}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          {formatDate(prompt.createdAt)}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          Prompt content preview
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(prompt.id)}>
            Edit
          </Button>
        )}
        {onDelete && (
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-8 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              if (confirm(`Delete "${prompt.title}"?`)) {
                onDelete(prompt.id)
              }
            }}
          >
            Delete
          </button>
        )}
      </CardFooter>
    </Card>
  )
}

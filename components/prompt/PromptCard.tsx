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
import type { Prompt } from "@/lib/prompts/types"

interface PromptCardProps {
  prompt: Prompt
  onDelete?: (id: string) => void
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "…"
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PromptCard({ prompt, onDelete }: PromptCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate" title={prompt.title}>
          {truncate(prompt.title, 60)}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          {formatDate(prompt.createdAt)}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          {truncate(prompt.input, 120)}
        </p>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/prompts/${prompt.id}`} />} nativeButton={false}>
          View
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(prompt.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

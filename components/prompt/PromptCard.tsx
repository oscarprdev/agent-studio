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
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="w-fit text-xs">
            {formatDate(prompt.createdAt)}
          </Badge>
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
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
                <AlertDialogTitle>Delete prompt</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{prompt.title}&quot;? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => onDelete(prompt.id)}
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

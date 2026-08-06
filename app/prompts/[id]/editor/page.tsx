"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getById } from "@/lib/prompts/store"
import { PromptEditor } from "@/components/prompt/PromptEditor"

function MissingPromptState() {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 py-20">
      <p className="text-muted-foreground">Prompt not found</p>
      <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
        Back to Prompts
      </Button>
    </div>
  )
}

export default function EditorPage() {
  const params = useParams<{ id: string }>()
  const prompt = getById(params.id)

  return (
    <div className="flex min-h-screen flex-col">
      {prompt ? (
        <PromptEditor prompt={prompt} />
      ) : (
        <MissingPromptState />
      )}
    </div>
  )
}
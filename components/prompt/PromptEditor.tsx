"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { PromptOutput } from "@/components/prompt/PromptOutput"
import * as store from "@/lib/prompts/store"
import type { Prompt } from "@/lib/prompts/types"

interface PromptEditorProps {
  prompt: Prompt | null
  onSave?: (prompt: Prompt) => void
}

export function PromptEditor({ prompt, onSave }: PromptEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(prompt?.title ?? "")

  function handleSave() {
    if (!prompt) return

    try {
      const updated = store.update(prompt.id, { title })
      if (updated) {
        toast.add({ title: "Prompt saved", type: "success" })
        onSave?.(updated)
      } else {
        toast.add({ title: "Failed to save", type: "error" })
      }
    } catch {
      toast.add({ title: "Failed to save", type: "error" })
    }
  }

  function handleCreateAgent() {
    if (!prompt) return
    router.push(`/agents/new?promptId=${prompt.id}`)
  }

  function handleCreateSkill() {
    if (!prompt) return
    router.push(`/skills/new?promptId=${prompt.id}`)
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">Prompt not found</p>
        <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
          Back to List
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="prompt-title">Title</FieldLabel>
          <Input
            id="prompt-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
      </FieldGroup>

      <PromptOutput content={prompt.content} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleSave}>Save Changes</Button>
        <Button variant="outline" onClick={handleCreateAgent}>Create Agent</Button>
        <Button variant="outline" onClick={handleCreateSkill}>Create Skill</Button>
        <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
          Back to List
        </Button>
      </div>
    </div>
  )
}

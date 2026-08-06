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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CopyIcon, EditIcon, Trash2Icon } from "lucide-react"

interface PromptEditorProps {
  prompt: Prompt | null
  onSave?: (prompt: Prompt) => void
  isEditing?: boolean
  onCopy?: (sections: Prompt["content"]) => void
  onEditToggle?: () => void
  onDelete?: (id: string) => void
  onSaveTitle?: (id: string, title: string) => void
}

export function PromptEditor({
  prompt,
  onSave,
  isEditing,
  onCopy,
  onEditToggle,
  onDelete,
  onSaveTitle,
}: PromptEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(prompt?.title ?? "")
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSave() {
    if (!prompt) return

    if (onSaveTitle) {
      onSaveTitle(prompt.id, title)
      return
    }

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

  function handleCopy() {
    if (!prompt || !onCopy) return
    onCopy(prompt.content)
  }

  function handleDelete() {
    if (!prompt || !onDelete) return
    setConfirmDelete(false)
    onDelete(prompt.id)
  }

  function handleCreateAgent() {
    if (!prompt) return
    const params = new URLSearchParams()
    params.set("promptId", prompt.id)
    router.push(`/agents/new?${params.toString()}`)
  }

  function handleCreateSkill() {
    if (!prompt) return
    const params = new URLSearchParams()
    params.set("promptId", prompt.id)
    router.push(`/skills/new?${params.toString()}`)
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
      {onEditToggle && (
        <div className="flex items-center justify-between">
          <h3>
            {isEditing ? "Edit" : prompt.title}
          </h3>
          <Button variant="outline" size="sm" onClick={onEditToggle}>
            <EditIcon className="size-4" data-icon="inline-start" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      )}

      {isEditing ? (
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
      ) : (
        <PromptOutput content={prompt.content} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {onEditToggle ? (
          <>
            <Button onClick={handleSave}>Save Title</Button>
            {onCopy && <Button variant="outline" onClick={handleCopy}>
              <CopyIcon className="size-4" data-icon="inline-start" />
              Copy
            </Button>}
            {onDelete && (
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2Icon className="size-4" data-icon="inline-start" />
                Delete
              </Button>
            )}
          </>
        ) : (
          <Button onClick={handleSave}>Save Changes</Button>
        )}
        <Button variant="outline" onClick={handleCreateAgent}>Create Agent</Button>
        <Button variant="outline" onClick={handleCreateSkill}>Create Skill</Button>
        <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
          Back to List
        </Button>
      </div>

      {onDelete && (
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{prompt.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

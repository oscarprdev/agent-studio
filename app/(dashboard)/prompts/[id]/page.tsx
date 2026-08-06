"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { getById } from "@/lib/prompts/store"
import { remove } from "@/lib/prompts/store"
import { update } from "@/lib/prompts/store"
import { toast } from "@/components/ui/toast"
import type { Prompt } from "@/lib/prompts/types"
import { PromptEditor } from "@/components/prompt/PromptEditor"
import { TopBar } from "@/components/layout/top-bar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [prompt, setPrompt] = useState<Prompt | null>(() => getById(params.id))
  const [isEditing, setIsEditing] = useState(false)

  function handleCopy(sections: Prompt["content"]): void {
    const formatted = [
      `ROLE\n${sections.role}`,
      `\nOBJECTIVE\n${sections.objective}`,
      `\nTOOLS\n${sections.tools.join(", ")}`,
      `\nWORKFLOW\n${sections.workflow.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
      `\nRULES\n${sections.rules}`,
      `\nOUTPUT\n${sections.output}`,
    ].join("\n")

    navigator.clipboard.writeText(formatted).then(() => {
      toast.add({ title: "Copied to clipboard", type: "success" })
    }).catch(() => {
      toast.add({ title: "Failed to copy", type: "error" })
    })
  }

  function handleDelete(id: string): void {
    remove(id)
    toast.add({ title: "Prompt deleted", type: "success" })
    router.push("/prompts")
  }

  function handleEditToggle(): void {
    setIsEditing((v) => !v)
  }

  function handleSaveTitle(id: string, title: string): void {
    const updated = update(id, { title })
    if (updated) {
      setPrompt(updated)
      setIsEditing(false)
      toast.add({ title: "Prompt saved", type: "success" })
    } else {
      toast.add({ title: "Failed to save", type: "error" })
    }
  }

  return (
    <>
      <TopBar title={prompt?.title ?? "Prompt not found"} />
      {!prompt ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 sm:px-6 lg:px-8">
          <h6>Prompt not found</h6>
          <p className="text-muted-foreground">
            The prompt you&apos;re looking for doesn&apos;t exist or was deleted.
          </p>
          <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
            Back to List
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">
            <PromptEditor
              prompt={prompt}
              isEditing={isEditing}
              onCopy={handleCopy}
              onEditToggle={handleEditToggle}
              onDelete={handleDelete}
              onSaveTitle={handleSaveTitle}
            />
          </div>
          <Separator className="mt-8 w-full max-w-3xl" />
        </div>
      )}
    </>
  )
}

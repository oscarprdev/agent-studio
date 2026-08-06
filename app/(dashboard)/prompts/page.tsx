"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAll, remove } from "@/lib/prompts/store"
import type { Prompt } from "@/lib/prompts/types"
import { PromptCard } from "@/components/prompt/PromptCard"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { WandSparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { TopBar } from "@/components/layout/top-bar"

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(() => getAll() ?? [])
  const router = useRouter()

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setPrompts(getAll() ?? [])
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  function handleDelete(id: string) {
    const prompt = prompts.find((p) => p.id === id)
    try {
      const removed = remove(id)
      if (removed) {
        setPrompts(getAll())
        toast.add({ title: `Deleted "${prompt?.title ?? "prompt"}"`, type: "success" })
      } else {
        toast.add({ title: "Failed to delete prompt", type: "error" })
      }
    } catch {
      toast.add({ title: "Failed to delete prompt", type: "error" })
    }
  }

  function handleNewPrompt() {
    const now = new Date().toISOString()
    const newPrompt = {
      id: crypto.randomUUID(),
      title: "Untitled Prompt",
      version: 0,
      tags: [],
      input: "",
      content: {
        role: "",
        objective: "",
        tools: [],
        workflow: [],
        rules: "",
        output: "",
      },
      createdAt: now,
      updatedAt: now,
    }

    try {
      const prompts = getAll()
      prompts.push(newPrompt)
      localStorage.setItem("agentstudio:prompts", JSON.stringify(prompts))
      setPrompts(getAll())
      router.push(`/prompts/${newPrompt.id}/editor`)
    } catch {
      toast.add({ title: "Failed to create prompt", type: "error" })
    }
  }

  function handleEdit(id: string) {
    router.push(`/prompts/${id}/editor`)
  }

  return (
    <>
      <TopBar title="Prompts" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My Prompts</h1>
          <Button onClick={handleNewPrompt} nativeButton={false}>
            <WandSparklesIcon className="size-4" data-icon="inline-start" />
            New Prompt
          </Button>
        </div>

        {prompts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No prompts yet</EmptyTitle>
              <EmptyDescription>
                Create your first prompt to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={handleNewPrompt} nativeButton={false}>
                New Prompt
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

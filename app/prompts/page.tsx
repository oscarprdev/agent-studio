"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getAll } from "@/lib/prompts/store"
import type { Prompt } from "@/lib/prompts/types"
import { PromptCard } from "@/components/prompt/PromptCard"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])

  useEffect(() => {
    setPrompts(getAll() ?? [])
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Prompts</h1>
        <Button render={<Link href="/prompts/new" />}>New Prompt</Button>
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
            <Button render={<Link href="/prompts/new" />}>New Prompt</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  )
}

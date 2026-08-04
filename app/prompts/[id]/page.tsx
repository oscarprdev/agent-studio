"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getById } from "@/lib/prompts/store"
import type { Prompt } from "@/lib/prompts/types"
import { PromptEditor } from "@/components/prompt/PromptEditor"

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>()
  const [prompt, setPrompt] = useState<Prompt | null>(null)

  useEffect(() => {
    setPrompt(getById(params.id))
  }, [params.id])

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {prompt?.title ?? "Prompt Detail"}
        </h1>
        <PromptEditor prompt={prompt} />
      </div>
    </div>
  )
}

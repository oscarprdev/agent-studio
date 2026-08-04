"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { getById } from "@/lib/prompts/store"
import type { Prompt } from "@/lib/prompts/types"
import { PromptEditor } from "@/components/prompt/PromptEditor"
import { TopBar } from "@/components/layout/top-bar"

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>()
  const [prompt] = useState<Prompt | null>(() => getById(params.id))

  return (
    <>
      <TopBar title={prompt?.title ?? "Prompt Detail"} />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <PromptEditor prompt={prompt} />
        </div>
      </div>
    </>
  )
}

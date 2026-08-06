"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getById } from "@/lib/prompts/store"
import { getPromptVersions } from "@/lib/prompts/versions"
import type { PromptVersion } from "@/lib/prompts/types"
import { Badge } from "@/components/ui/badge"
import { PromptEditor } from "@/components/prompt/PromptEditor"
import { TopBar } from "@/components/layout/top-bar"
import { ArrowRight } from "lucide-react"

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>()
  const [prompt] = useState(() => getById(params.id))
  const [versions] = useState<PromptVersion[]>(() => {
    try {
      return getPromptVersions(params.id)
    } catch {
      return []
    }
  })

  const latestVersion = versions.length > 0 ? versions[0]?.version ?? null : null

  return (
    <>
      <TopBar
        title={prompt?.title ?? "Prompt Detail"}
        actions={
          <>
            {latestVersion !== null && (
              <Badge variant="secondary">v{latestVersion}</Badge>
            )}
            <Button variant="outline" size="xs" render={<Link href={`/prompts/${params.id}/editor`} />} nativeButton={false}>
              Edit
              <ArrowRight className="size-3" data-icon="inline-end" />
            </Button>
          </>
        }
      />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <PromptEditor prompt={prompt} />
        </div>
      </div>
    </>
  )
}
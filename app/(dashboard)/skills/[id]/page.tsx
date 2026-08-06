"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { getById } from "@/lib/skills/store"
import type { Skill } from "@/lib/skills/types"
import { SkillEditor } from "@/components/skill/SkillEditor"
import { TopBar } from "@/components/layout/top-bar"

export default function SkillDetailPage() {
  const params = useParams<{ id: string }>()
  const [skill] = useState<Skill | null>(() => getById(params.id))

  return (
    <>
      <TopBar title={skill?.name ?? "Skill Detail"} />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <SkillEditor skill={skill} />
        </div>
      </div>
    </>
  )
}

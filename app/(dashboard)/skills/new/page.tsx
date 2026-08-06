"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SkillGenerator } from "@/components/skill/SkillGenerator"
import { TopBar } from "@/components/layout/top-bar"
import * as promptsStore from "@/lib/prompts/store"

function SkillGeneratorPage() {
  const searchParams = useSearchParams()
  const promptId = searchParams.get("promptId")
  const promptContent = searchParams.get("promptContent")

  let initialInput: string | undefined

  if (promptId) {
    const prompt = promptsStore.getById(promptId)
    if (prompt) {
      initialInput = prompt.input
    }
  } else if (promptContent) {
    initialInput = promptContent
  }

  return <SkillGenerator initialInput={initialInput} />
}

export default function NewSkillPage() {
  return (
    <>
      <TopBar title="New Skill" />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <Suspense fallback={null}>
            <SkillGeneratorPage />
          </Suspense>
        </div>
      </div>
    </>
  )
}

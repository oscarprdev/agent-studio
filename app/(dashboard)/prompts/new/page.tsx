"use client"

import { PromptGenerator } from "@/components/prompt/PromptGenerator"
import { TopBar } from "@/components/layout/top-bar"

export default function NewPromptPage() {
  return (
    <>
      <TopBar title="New Prompt" />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <PromptGenerator />
        </div>
      </div>
    </>
  )
}

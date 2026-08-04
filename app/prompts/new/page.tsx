import type { Metadata } from "next"
import { PromptGenerator } from "@/components/prompt/PromptGenerator"

export const metadata: Metadata = {
  title: "New Prompt | AI Agent Studio",
  description:
    "Generate a structured AI prompt from a natural language description.",
}

export default function NewPromptPage() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <PromptGenerator />
      </div>
    </div>
  )
}

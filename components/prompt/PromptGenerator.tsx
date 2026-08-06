"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { PromptOutput } from "@/components/prompt/PromptOutput"
import { generatePrompt } from "@/lib/ai/generate-prompt"
import * as store from "@/lib/prompts/store"
import type { Prompt, PromptSections } from "@/lib/prompts/types"

interface PromptGeneratorProps {
  onGenerate?: (prompt: Prompt) => void
}

export function PromptGenerator({ onGenerate }: PromptGeneratorProps) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<PromptSections | null>(null)

  const trimmedInput = input.trim()
  const isInputEmpty = trimmedInput.length === 0

  function formatPrompt(sections: PromptSections): string {
    return [
      `ROLE\n${sections.role}`,
      `\nOBJECTIVE\n${sections.objective}`,
      `\nTOOLS\n${sections.tools.join(", ")}`,
      `\nWORKFLOW\n${sections.workflow.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
      `\nRULES\n${sections.rules}`,
      `\nOUTPUT\n${sections.output}`,
    ].join("\n")
  }

  async function handleGenerate() {
    if (isInputEmpty || isGenerating) return

    setIsGenerating(true)
    try {
      const sections = await generatePrompt(trimmedInput)
      setResult(sections)
      toast.add({ title: "Prompt generated", type: "success" })
    } catch {
      toast.add({ title: "Generation failed", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    if (!result) return

    try {
      await navigator.clipboard.writeText(formatPrompt(result))
      toast.add({ title: "Copied to clipboard", type: "success" })
    } catch {
      toast.add({ title: "Failed to copy", type: "error" })
    }
  }

  function handleSave() {
    if (!result) return

    try {
      const title = trimmedInput.slice(0, 60)
      const prompt = store.create({ title, input: trimmedInput, content: result })
      toast.add({ title: "Prompt saved", type: "success" })
      onGenerate?.(prompt)
      router.push("/prompts")
    } catch {
      toast.add({ title: "Failed to save", type: "error" })
    }
  }

  function navigateToBuilder(path: string) {
    if (!result) return
    const params = new URLSearchParams()
    params.set("promptContent", formatPrompt(result))
    router.push(`${path}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="prompt-input">
            Describe your prompt
          </FieldLabel>
          <Textarea
            id="prompt-input"
            placeholder="e.g. Create a senior code reviewer who analyzes pull requests for security vulnerabilities, performance issues, and adherence to coding standards..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
          />
        </Field>
      </FieldGroup>

      <Button
        onClick={handleGenerate}
        disabled={isInputEmpty || isGenerating}
      >
        {isGenerating && <Spinner data-icon="inline-start" />}
        Generate Prompt
      </Button>

      {result && (
        <>
          <PromptOutput content={result} />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button variant="outline" onClick={handleCopy}>
              Copy
            </Button>
            <Button onClick={handleSave}>
              Save Prompt
            </Button>
            <Button variant="outline" onClick={() => navigateToBuilder("/agents/new")}>
              Create Agent
            </Button>
            <Button variant="outline" onClick={() => navigateToBuilder("/skills/new")}>
              Create Skill
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
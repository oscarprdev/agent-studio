"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { SkillOutput } from "@/components/skill/SkillOutput"
import { generateSkill } from "@/lib/ai/generate-skill"
import * as store from "@/lib/skills/store"
import type { Skill, SkillContent } from "@/lib/skills/types"

interface SkillGeneratorProps {
  onGenerate?: (skill: Skill) => void
}

export function SkillGenerator({ onGenerate }: SkillGeneratorProps) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<SkillContent | null>(null)

  const trimmedInput = input.trim()
  const isInputEmpty = trimmedInput.length === 0

  async function handleGenerate() {
    if (isInputEmpty || isGenerating) return

    setIsGenerating(true)
    try {
      const content = await generateSkill({ description: trimmedInput })
      setResult(content)
      toast.add({ title: "Skill generated", type: "success" })
    } catch {
      toast.add({ title: "Generation failed", type: "error" })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    if (!result) return

    const formatted = [
      `NAME\n${result.name}`,
      `\nDESCRIPTION\n${result.description}`,
      `\nINSTRUCTIONS\n${result.instructions}`,
      `\nTRIGGERS\n${result.triggers.join(", ")}`,
      `\nTOOLS\n${result.tools.join(", ")}`,
      `\nEXPECTED_OUTPUT\n${result.expectedOutput}`,
      `\nRULES\n${result.rules}`,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(formatted)
      toast.add({ title: "Copied to clipboard", type: "success" })
    } catch {
      toast.add({ title: "Failed to copy", type: "error" })
    }
  }

  function handleSave() {
    if (!result) return

    try {
      const name = trimmedInput.slice(0, 60)
      const skill = store.create({ name, input: trimmedInput, content: result, tags: [] })
      toast.add({ title: "Skill saved", type: "success" })
      onGenerate?.(skill)
      router.push("/skills")
    } catch {
      toast.add({ title: "Failed to save", type: "error" })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="skill-input">
            Describe your skill
          </FieldLabel>
          <Textarea
            id="skill-input"
            placeholder="e.g. Create a skill that reviews code for security vulnerabilities..."
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
        Generate Skill
      </Button>

      {result && (
        <>
          <SkillOutput content={result} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleCopy}>
              Copy
            </Button>
            <Button onClick={handleSave}>
              Save Skill
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

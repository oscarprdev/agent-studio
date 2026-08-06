"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { generateSkill } from "@/lib/ai/generate-skill"
import * as store from "@/lib/skills/store"
import type { CreateSkillInput, Skill } from "@/lib/skills/types"

interface SkillGeneratorProps {
  onGenerate?: (skill: Skill) => void
  initialInput?: string
}

export function SkillGenerator({ onGenerate, initialInput }: SkillGeneratorProps) {
  const router = useRouter()
  const [input, setInput] = useState(() => initialInput ?? "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<Partial<CreateSkillInput> | null>(null)

  const trimmedInput = input.trim()
  const isInputEmpty = trimmedInput.length === 0

  async function handleGenerate() {
    if (isInputEmpty || isGenerating) return

    setIsGenerating(true)
    try {
      const generated = await generateSkill({ description: trimmedInput })
      setResult(generated)
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
      `NAME\n${result.name ?? ""}`,
      `\nDESCRIPTION\n${result.description ?? ""}`,
      `\nINSTRUCTIONS\n${result.instructions ?? ""}`,
      `\nTOOLS\n${(result.tools ?? []).join(", ")}`,
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
      const name = result.name ?? trimmedInput.slice(0, 60)
      const skill = store.create({
        name,
        description: result.description ?? "",
        instructions: result.instructions ?? "",
        tools: result.tools ?? [],
        created_by: "local-user",
      })
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
        <div className="rounded-md border p-4 flex flex-col gap-4">
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground">NAME</h4>
            <p>{result.name ?? "—"}</p>
          </section>
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground">DESCRIPTION</h4>
            <p>{result.description ?? "—"}</p>
          </section>
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground">INSTRUCTIONS</h4>
            <p className="whitespace-pre-wrap text-sm">{result.instructions ?? "—"}</p>
          </section>
          <section className="flex flex-col gap-1">
            <h4 className="text-sm font-medium text-muted-foreground">TOOLS</h4>
            <div className="flex flex-wrap gap-1">
              {(result.tools ?? []).map((tool) => (
                <span
                  key={tool}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleCopy}>
              Copy
            </Button>
            <Button onClick={handleSave}>
              Save Skill
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

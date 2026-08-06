"use client"

import { useState } from "react"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Agent, AgentDefinition, Skill } from "@/lib/agents/types"

interface AgentSkillsTabProps {
  agent: Agent
  draft: AgentDefinition
  onChange: (draft: AgentDefinition) => void
}

export function AgentSkillsTab({
  agent,
  draft,
  onChange,
}: AgentSkillsTabProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [instructions, setInstructions] = useState("")

  const draftSkills = draft.skills ?? []

  const canAdd =
    name.trim().length > 0 && description.trim().length > 0

  function handleAddSkill() {
    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    if (!trimmedName || !trimmedDescription) return

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: trimmedName,
      description: trimmedDescription,
      instructions: instructions.trim(),
      tools: [],
    }

    // Deduplicate by ID
    if (draftSkills.some((s) => s.id === newSkill.id)) return

    onChange({ ...draft, skills: [...draftSkills, newSkill] })

    setName("")
    setDescription("")
    setInstructions("")
  }

  function handleRemoveSkill(skillId: string) {
    const filtered = draftSkills.filter((s) => s.id !== skillId)
    onChange({ ...draft, skills: filtered })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Skills list */}
      <div>
        <h3 className="font-heading text-base">
          Embedded skills
        </h3>
        <p className="text-sm text-muted-foreground">
          {draftSkills.length} skill{draftSkills.length !== 1 ? "s" : ""} in draft
        </p>
      </div>

      {draftSkills.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No skills added yet. Add a skill to get started.
        </p>
      )}

      {draftSkills.length > 0 && (
        <div className="flex flex-col gap-2">
          {draftSkills.map((skill) => (
            <Card key={skill.id} size="sm">
              <CardHeader>
                <CardTitle className="text-sm">
                  {skill.name}
                </CardTitle>
                {skill.description && (
                  <CardDescription className="text-xs">
                    {skill.description}
                  </CardDescription>
                )}
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${skill.name}`}
                    onClick={() => handleRemoveSkill(skill.id)}
                  >
                    <Trash2Icon data-icon="inline-end" />
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add skill form */}
      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-base">
          Add skill
        </h3>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="skill-name">Name</FieldLabel>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Data Analysis"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="skill-description">
              Description
            </FieldLabel>
            <Textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this skill does..."
              className="min-h-16"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="skill-instructions">
              Instructions
            </FieldLabel>
            <Textarea
              id="skill-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Optional — behavior guidelines..."
              className="min-h-20"
            />
          </Field>
        </FieldGroup>
        <Button
          onClick={handleAddSkill}
          disabled={!canAdd}
        >
          Add Skill
        </Button>
      </div>
    </div>
  )
}
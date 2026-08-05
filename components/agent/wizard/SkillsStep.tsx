"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Plus, X } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import type { Skill } from "@/lib/agents/types"

interface SkillsStepProps {
  skills: Skill[]
  onAdd: (skill: Skill) => void
  onRemove: (skillId: string) => void
}

export function SkillsStep({ skills, onAdd, onRemove }: SkillsStepProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [instructions, setInstructions] = useState("")

  const isValid = name.trim().length > 0 && description.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      tools: [],
    })

    setName("")
    setDescription("")
    setInstructions("")
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {skills.map((skill) => (
        <Card key={skill.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <CardTitle>{skill.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {skill.description}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="icon-xs"
                onClick={() => onRemove(skill.id)}
                aria-label={`Remove ${skill.name}`}
              >
                <X data-icon="inline-start" />
              </Button>
            </div>
          </CardHeader>
          {skill.instructions && (
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {skill.instructions}
              </p>
            </CardContent>
          )}
        </Card>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="skill-name">Name</FieldLabel>
              <Input
                id="skill-name"
                placeholder="e.g. Code Review"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <FieldDescription>
                Give your skill a descriptive name.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="skill-description">Description</FieldLabel>
              <Textarea
                id="skill-description"
                placeholder="What this skill teaches the agent to do"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="skill-instructions">
                Instructions
              </FieldLabel>
              <Textarea
                id="skill-instructions"
                placeholder="Detailed instructions for the agent to follow (optional)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-24"
              />
            </Field>
          </FieldGroup>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!isValid}>
              <Plus data-icon="inline-start" />
              Add Skill
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setName("")
                setDescription("")
                setInstructions("")
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className={cn(skills.length === 0 && "border-dashed")}
        >
          <Plus data-icon="inline-start" />
          Add Skill
        </Button>
      )}
    </div>
  )
}

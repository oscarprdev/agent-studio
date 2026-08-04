"use client"

import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

interface ContextStepProps {
  value: string
  onChange: (value: string) => void
}

export function ContextStep({ value, onChange }: ContextStepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="agent-context">
          Additional context
        </FieldLabel>
        <Textarea
          id="agent-context"
          placeholder="Repository structure, architecture docs, coding conventions, dependencies..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-32"
        />
        <FieldDescription>
          Add repository structure, coding conventions, or domain-specific rules
          to improve the agent&apos;s output. This step is optional — without
          context the agent uses general knowledge.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}

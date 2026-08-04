"use client"

import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

interface GoalStepProps {
  value: string
  onChange: (value: string) => void
}

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="agent-goal">
          What should this agent do?
        </FieldLabel>
        <Textarea
          id="agent-goal"
          placeholder="Create an agent that reviews GitHub PRs, creates Linear tasks, updates documentation"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-32"
        />
        <FieldDescription>
          Describe the agent&apos;s purpose in natural language. The more
          specific you are, the better the generated agent will be.
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}

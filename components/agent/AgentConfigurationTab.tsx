"use client"

import { useState } from "react"
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Agent, AgentDefinition } from "@/lib/agents/types"

interface AgentConfigurationTabProps {
  agent: Agent
  onChange: (draft: AgentDefinition) => void
}

export function AgentConfigurationTab({ agent, onChange }: AgentConfigurationTabProps) {
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [model, setModel] = useState(agent.model)
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt)

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="config-name">Name</FieldLabel>
        <Input
          id="config-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="config-description">Description</FieldLabel>
        <Textarea
          id="config-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-20"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="config-model">Model</FieldLabel>
        <Input
          id="config-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="config-system-prompt">System Prompt</FieldLabel>
        <Textarea
          id="config-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="min-h-40 font-mono text-sm"
        />
      </Field>
    </FieldGroup>
  )
}
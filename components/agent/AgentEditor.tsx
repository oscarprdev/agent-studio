"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AgentOutput } from "@/components/agent/AgentOutput"
import * as store from "@/lib/agents/store"
import type { Agent } from "@/lib/agents/types"

interface AgentEditorProps {
  agent: Agent
  onSave: (agent: Agent) => void
}

export function AgentEditor({ agent, onSave }: AgentEditorProps) {
  const router = useRouter()
  const [name, setName] = useState(agent.name)
  const [description, setDescription] = useState(agent.description)
  const [systemPrompt, setSystemPrompt] = useState(agent.system_prompt)
  const [isPreview, setIsPreview] = useState(false)

  const isValid = name.trim().length > 0 && description.trim().length > 0

  function handleSave() {
    if (!isValid) return
    const updated = store.update(agent.id, {
      name: name.trim(),
      description: description.trim(),
      system_prompt: systemPrompt.trim(),
    })
    if (updated) {
      onSave(updated)
    }
  }

  function handleDuplicate() {
    store.create({
      name: `${agent.name} (Copy)`,
      description: agent.description,
      model: agent.model,
      system_prompt: agent.system_prompt,
      skills: agent.skills,
      tools: agent.tools,
    })
    router.push("/agents")
  }

  function handleExportMarkdown() {
    const md = [
      `# ${name}`,
      ``,
      `## Description`,
      ``,
      description,
      ``,
      `## Model`,
      ``,
      agent.model,
      ``,
      `## System Prompt`,
      ``,
      systemPrompt,
      ``,
      `## Tools`,
      ``,
      agent.tools.length > 0
        ? agent.tools.map((t) => `- ${t.id}: ${t.name} — ${t.description}`).join("\n")
        : "_None_",
      ``,
      `## Skills`,
      ``,
      agent.skills.length > 0
        ? agent.skills.map((s) => `- ${s.name}: ${s.description}`).join("\n")
        : "_None_",
      ``,
      `> Created: ${agent.createdAt}`,
    ].join("\n")

    const blob = new Blob([md], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant={!isPreview ? "default" : "outline"}
          onClick={() => setIsPreview(false)}
        >
          Edit
        </Button>
        <Button
          variant={isPreview ? "default" : "outline"}
          onClick={() => setIsPreview(true)}
        >
          Preview
        </Button>
      </div>

      {isPreview ? (
        <AgentOutput
          agent={{
            name: name.trim(),
            description: description.trim(),
            model: agent.model,
            system_prompt: systemPrompt.trim(),
            skills: agent.skills,
            tools: agent.tools,
          }}
        />
      ) : (
        <>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="agent-name">Name</FieldLabel>
              <Input
                id="agent-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agent-description">Description</FieldLabel>
              <Textarea
                id="agent-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="agent-system-prompt">
                System Prompt
              </FieldLabel>
              <Textarea
                id="agent-system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-40 font-mono text-sm"
              />
              <FieldDescription>
                The system prompt defines the agent&apos;s behavior and
                capabilities.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Separator />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Model
            </span>
            <Badge variant="secondary" className="w-fit">
              {agent.model}
            </Badge>
          </div>

          {agent.tools.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tools
              </span>
              <div className="flex flex-wrap gap-2">
                {agent.tools.map((tool) => (
                  <Badge key={tool.id} variant="outline">
                    {tool.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {agent.skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill) => (
                  <Badge key={skill.id} variant="outline">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={handleSave} disabled={!isValid} size="lg">
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleDuplicate} size="lg">
              Duplicate
            </Button>
            <Button variant="outline" onClick={handleExportMarkdown} size="lg">
              Export Markdown
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { getServerDefinition } from "@/lib/mcp/servers"

interface McpConfigFormProps {
  serverType: string
  onSubmit: (config: Record<string, string>) => void
  onBack: () => void
}

export function McpConfigForm({
  serverType,
  onSubmit,
  onBack,
}: McpConfigFormProps) {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const server = getServerDefinition(serverType)

  if (!server) {
    return (
      <div className="text-center text-muted-foreground">
        Server not found.
      </div>
    )
  }

  const isFormValid = server.credentials.every(
    (field) => config[field.key]?.trim() !== "",
  )

  function handleChange(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    try {
      onSubmit(config)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{server.name}</h2>
        <p className="text-sm text-muted-foreground">
          {server.description}
        </p>
      </div>

      <FieldGroup>
        {server.credentials.map((field) => (
          <Field key={field.key}>
            <FieldLabel htmlFor={field.key}>{field.label}</FieldLabel>
            <Input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={config[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </Field>
        ))}
      </FieldGroup>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting && <Spinner data-icon="inline-start" />}
          {isSubmitting ? "Connecting..." : "Connect"}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card"
import {
  FieldGroup,
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { McpStatusBadge } from "./McpStatusBadge"
import { getServerDefinition } from "@/lib/mcp/servers"
import { testConnection } from "@/lib/mcp/store"
import { toast } from "@/components/ui/toast"
import type { McpConnection } from "@/lib/mcp/types"

interface McpDetailProps {
  connection: McpConnection
  onSave: (config: Record<string, string>) => Promise<void>
  onDelete: () => Promise<void>
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function McpDetail({ connection, onSave, onDelete }: McpDetailProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    ...connection.config,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const server = getServerDefinition(connection.type)

  function handleChange(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await onSave(config)
      toast.add({ title: "Configuration saved", type: "success" })
    } catch {
      toast.add({ title: "Failed to save configuration", type: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTest() {
    setIsTesting(true)
    try {
      await testConnection(connection.id)
      toast.add({ title: "Connection successful", type: "success" })
    } catch {
      toast.add({ title: "Connection test failed", type: "error" })
    } finally {
      setIsTesting(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{connection.name}</CardTitle>
          <McpStatusBadge status={connection.status} />
        </div>
        <CardDescription>{connection.description}</CardDescription>
        <p className="text-xs text-muted-foreground">
          Last tested:{" "}
          {connection.lastTestedAt
            ? formatDate(connection.lastTestedAt)
            : "Never tested"}
        </p>
      </CardHeader>

      <CardContent>
        {server && (
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
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button onClick={handleSave} disabled={isSaving || isTesting}>
          {isSaving && <Spinner data-icon="inline-start" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          variant="outline"
          onClick={handleTest}
          disabled={isSaving || isTesting}
        >
          {isTesting && <Spinner data-icon="inline-start" />}
          {isTesting ? "Testing..." : "Test Connection"}
        </Button>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="destructive"
                disabled={isSaving || isTesting || isDeleting}
              />
            }
          >
            Disconnect
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect MCP Server</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect {connection.name}? This will
                remove the connection configuration.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Disconnecting..." : "Disconnect"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

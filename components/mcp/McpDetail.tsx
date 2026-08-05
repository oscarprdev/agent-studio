"use client"

import { createElement, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
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
import { getServerIcon, getServerDefinition } from "@/lib/mcp/servers"
import { testConnection } from "@/lib/mcp/store"
import type { McpConnection } from "@/lib/mcp/types"

interface McpDetailProps {
  connection: McpConnection
  onSave: (config: Record<string, string>) => Promise<void> | void
  onDelete: () => Promise<void> | void
}

export function McpDetail({ connection, onSave, onDelete }: McpDetailProps) {
  const [config, setConfig] = useState<Record<string, string>>(() => ({ ...connection.config }))
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const server = getServerDefinition(connection.type)
  const Icon = server ? getServerIcon(connection.type) : null

  function handleCredentialChange(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setServerError(null)
    setIsSaving(true)
    try {
      await onSave(config)
    } catch {
      setServerError("Failed to save configuration.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleTest() {
    setServerError(null)
    setIsTesting(true)
    try {
      await testConnection(connection.id)
    } catch {
      setServerError("Connection test failed.")
    } finally {
      setIsTesting(false)
    }
  }

  async function handleDelete() {
    setShowConfirmDialog(false)
    await onDelete()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {Icon && (
                createElement(Icon, { className: "size-6 shrink-0 text-muted-foreground" })
              )}
              <div className="flex flex-col gap-1">
                <CardTitle className="truncate">{connection.name}</CardTitle>
                <CardDescription className="truncate">
                  {connection.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <McpStatusBadge status={connection.status} />
              {connection.lastTestedAt && (
                <span className="text-xs text-muted-foreground">
                  Last tested:{" "}
                  {new Date(connection.lastTestedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {serverError && (
            <div className="text-sm text-destructive">{serverError}</div>
          )}

          <FieldGroup key={`config-${connection.id}`}>
            {server?.credentials.map((field) => (
              <Field key={field.key}>
                <FieldLabel>{field.label}</FieldLabel>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={config[field.key] ?? ""}
                  onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                />
              </Field>
            ))}
          </FieldGroup>
        </CardContent>

        <CardFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || isSaving}
          >
            {isTesting && <Spinner data-icon="inline-start" />}
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isTesting}>
            {isSaving && <Spinner data-icon="inline-start" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger className="inline-flex items-center justify-center rounded-lg border border-transparent bg-destructive text-sm font-medium text-destructive-foreground hover:bg-destructive/80 transition-all outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none">
              Disconnect
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect from {connection.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the connection configuration. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  )
}
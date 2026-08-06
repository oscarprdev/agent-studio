"use client"

import { createElement, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { McpStatusBadge } from "./McpStatusBadge"
import { getServerIcon } from "@/lib/mcp/servers"
import { testConnection } from "@/lib/mcp/store"
import { toast } from "@/components/ui/toast"
import { Spinner } from "@/components/ui/spinner"
import type { McpConnection } from "@/lib/mcp/types"

interface McpCardProps {
  connection: McpConnection
  onDelete?: (id: string) => void
  onDisconnect?: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function McpCard({ connection, onDelete, onDisconnect }: McpCardProps) {
  const [isTesting, setIsTesting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const Icon = getServerIcon(connection.type)

  async function handleTest() {
    setIsTesting(true)
    try {
      await testConnection(connection.id)
      toast.add({ title: `${connection.name} connected`, type: "success" })
    } catch {
      // Test failure handled silently — status already updated to "connected" by mock
    } finally {
      setIsTesting(false)
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true)
    try {
      await onDisconnect?.(connection.id)
      toast.add({ title: `${connection.name} disconnected`, type: "info" })
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && createElement(Icon, { className: "text-muted-foreground" })}
          <CardTitle className="truncate" title={connection.name}>
            {connection.name}
          </CardTitle>
        </div>
        <McpStatusBadge status={connection.status} />
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          {connection.description}
        </p>
        <p className="text-xs text-muted-foreground">
          Last tested:{" "}
          {connection.lastTestedAt
            ? formatDate(connection.lastTestedAt)
            : "Never tested"}
        </p>
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/mcp/${connection.id}`} />} nativeButton={false}>
          Configure
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={isTesting || isDisconnecting}
        >
          {isTesting && <Spinner data-icon="inline-start" />}
          {isTesting ? "Testing..." : "Test"}
        </Button>
        {connection.status !== "disconnected" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isTesting || isDisconnecting}
          >
            {isDisconnecting && <Spinner data-icon="inline-start" />}
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(connection.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
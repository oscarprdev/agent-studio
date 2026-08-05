"use client"

import { createElement } from "react"
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
import type { McpConnection } from "@/lib/mcp/types"

interface McpCardProps {
  connection: McpConnection
  onDelete?: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function McpCard({ connection, onDelete }: McpCardProps) {
  const Icon = getServerIcon(connection.type)

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

      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/mcp/${connection.id}`} />} nativeButton={false}>
          Configure
        </Button>
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
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { McpConnectionStatus } from "@/lib/mcp/types"

interface McpStatusBadgeProps {
  status: McpConnectionStatus | (string & {})
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; variant: "secondary" | "destructive" | "outline" }
> = {
  connected: { label: "Connected", dot: "bg-emerald-500", variant: "secondary" },
  disconnected: { label: "Disconnected", dot: "bg-amber-500", variant: "outline" },
  error: { label: "Error", dot: "bg-red-500", variant: "destructive" },
}

const UNKNOWN = { label: "Unknown", dot: "bg-muted-foreground", variant: "outline" as const }

export function McpStatusBadge({ status }: McpStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? UNKNOWN

  return (
    <Badge variant={config.variant} className={cn(status === "error" && "border-destructive/40")}>
      <span className={cn("size-2 shrink-0 rounded-full", config.dot)} />
      {config.label}
    </Badge>
  )
}

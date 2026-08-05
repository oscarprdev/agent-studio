"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getById, update, disconnect as disconnectConnection } from "@/lib/mcp/store"
import type { McpConnection } from "@/lib/mcp/types"
import { McpDetail } from "@/components/mcp/McpDetail"
import { TopBar } from "@/components/layout/top-bar"

export default function McpDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [connection, setConnection] = useState<McpConnection | null>(() =>
    getById(params.id),
  )

  if (!connection) {
    return (
      <>
        <TopBar title="MCP Connection" />
        <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex w-full max-w-3xl flex-col gap-6">
            <p className="text-sm text-muted-foreground">
              Connection not found.
            </p>
          </div>
        </div>
      </>
    )
  }

  async function handleSave(config: Record<string, string>) {
    const updated = update(connection!.id, { config })
    if (updated) {
      setConnection(updated)
    }
  }

  function handleDisconnect() {
    setConnection((prev) => {
      if (!prev) return prev
      return { ...prev, status: "disconnected" as const }
    })
    disconnectConnection(connection!.id)
  }

  return (
    <>
      <TopBar title={connection.name || "MCP Connection"} />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-6">
          <McpDetail
            connection={connection}
            onSave={handleSave}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
    </>
  )
}

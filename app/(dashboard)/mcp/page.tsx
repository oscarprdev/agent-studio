"use client"

import { useState, useEffect } from "react"
import { getAll, remove, disconnectConnection } from "@/lib/mcp/store"
import type { McpConnection } from "@/lib/mcp/types"
import { McpCard } from "@/components/mcp/McpCard"
import { McpAddSheet } from "@/components/mcp/McpAddSheet"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { TopBar } from "@/components/layout/top-bar"

export default function McpConnectionsPage() {
  const [connections, setConnections] = useState<McpConnection[]>(
    () => getAll() ?? []
  )
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // SSR hydration guard: set in effect to avoid mismatch between server/client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setConnections(getAll() ?? [])
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  function deleteConnection(id: string) {
    remove(id)
    setConnections(getAll() ?? [])
  }

  function disconnectConnectionById(id: string) {
    disconnectConnection(id)
    setConnections(getAll() ?? [])
  }

  if (!mounted) return null

  return (
    <>
      <TopBar
        title="MCP Connections"
        actions={
          <Button onClick={() => setShowAddSheet(true)}>Add MCP</Button>
        }
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            My MCP Connections
          </h1>
        </div>

        {connections.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No connections yet</EmptyTitle>
              <EmptyDescription>
                Add your first MCP server to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setShowAddSheet(true)}>Add MCP</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <McpCard
                key={connection.id}
                connection={connection}
                onDelete={deleteConnection}
                onDisconnect={disconnectConnectionById}
              />
            ))}
          </div>
        )}
      </div>

      <McpAddSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onConnectionAdded={() => setConnections(getAll() ?? [])}
      />
    </>
  )
}

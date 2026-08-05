"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { McpServerPicker } from "./McpServerPicker"
import { McpConfigForm } from "./McpConfigForm"
import { getAll, create } from "@/lib/mcp/store"
import { MCP_SERVERS, getServerDefinition } from "@/lib/mcp/servers"
import { toast } from "@/components/ui/toast"

interface McpAddSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnectionAdded: () => void
}

export function McpAddSheet({
  open,
  onOpenChange,
  onConnectionAdded,
}: McpAddSheetProps) {
  const [step, setStep] = useState<"select" | "configure">("select")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const excludedTypes = getAll().map((c) => c.type)
  const excludedSet = new Set(excludedTypes)
  const availableServers = MCP_SERVERS.filter(
    (server) => !excludedSet.has(server.type),
  )
  const allConnected = availableServers.length === 0

  function resetState() {
    setStep("select")
    setSelectedType(null)
  }

  function handleSelect(type: string) {
    setSelectedType(type)
    setStep("configure")
  }

  function handleBack() {
    resetState()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(config: Record<string, string>) {
    if (!selectedType) return
    const server = getServerDefinition(selectedType)
    if (!server) return

    create({
      name: server.name,
      type: selectedType,
      description: server.description,
      config,
    })

    toast.add({ title: `${server.name} connected`, type: "success" })
    resetState()
    onOpenChange(false)
    onConnectionAdded()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add MCP Server</SheetTitle>
          <SheetDescription>
            Select and configure an MCP server to connect.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          {allConnected ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              All MCP servers connected
            </p>
          ) : step === "select" ? (
            <McpServerPicker
              selectedType={selectedType}
              onSelect={handleSelect}
              excludedTypes={excludedTypes}
            />
          ) : selectedType ? (
            <McpConfigForm
              serverType={selectedType}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

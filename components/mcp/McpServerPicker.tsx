"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { MCP_SERVERS, getServerIcon } from "@/lib/mcp/servers"
import { cn } from "@/lib/utils"

interface McpServerPickerProps {
  selectedType: string | null
  onSelect: (type: string) => void
  excludedTypes: string[]
}

export function McpServerPicker({
  selectedType,
  onSelect,
  excludedTypes,
}: McpServerPickerProps) {
  const availableServers = MCP_SERVERS.filter(
    (server) => !excludedTypes.includes(server.type),
  )

  if (availableServers.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        All servers connected
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {availableServers.map((server) => {
        const Icon = getServerIcon(server.type)
        const isSelected = selectedType === server.type

        return (
          <Card
            key={server.type}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              isSelected && "border-primary bg-accent",
            )}
            onClick={() => onSelect(server.type)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                {Icon && (
                  <Icon
                    className={cn(
                      "text-muted-foreground",
                      isSelected && "text-primary",
                    )}
                  />
                )}
                <CardTitle>{server.name}</CardTitle>
              </div>
              <CardDescription>{server.description}</CardDescription>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

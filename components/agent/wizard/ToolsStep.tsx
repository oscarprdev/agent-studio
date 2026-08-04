"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { TOOL_CANDIDATES } from "@/lib/agents/tools"

interface ToolsStepProps {
  selectedTools: string[]
  onToggle: (toolId: string) => void
}

export function ToolsStep({ selectedTools, onToggle }: ToolsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOL_CANDIDATES.map((tool) => {
          const isSelected = selectedTools.includes(tool.id)

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToggle(tool.id)}
              className={cn(
                "rounded-xl text-left transition-colors ring-1 ring-foreground/10",
                isSelected
                  ? "bg-primary/10 ring-primary"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              <Card
                className={cn(
                  "border-0 shadow-none",
                  isSelected && "bg-transparent"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tool.name}</CardTitle>
                    {isSelected && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {tool.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}

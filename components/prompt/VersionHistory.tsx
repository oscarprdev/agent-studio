"use client"

import { useState } from "react"
import * as store from "@/lib/prompts/store"
import type { PromptVersion } from "@/lib/prompts/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface VersionHistoryProps {
  promptId: string
  isOpen: boolean
  onClose: () => void
  onRestore: (version: PromptVersion) => void
  selectedVersion?: PromptVersion | null
}

export function VersionHistory({
  promptId,
  isOpen,
  onClose,
  onRestore,
  selectedVersion,
}: VersionHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(selectedVersion?.id ?? null)

  function handleOpenChange(open: boolean) {
    if (!open) onClose()
  }

  function getVersionHistory(): PromptVersion[] {
    try {
      return store.getVersionHistory(promptId)
    } catch {
      return []
    }
  }

  const effectiveVersions = getVersionHistory()
  const selectedItem = effectiveVersions.find(
    (v) => v.id === selectedId
  ) ?? selectedVersion ?? null

  function handleSelect(version: PromptVersion) {
    setSelectedId(version.id)
  }

  function handleRestore(version: PromptVersion) {
    onRestore(version)
  }

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  function renderVersionListItem(
    version: PromptVersion,
    index: number
  ) {
    const isSelected = version.id === selectedId
    const isFirst = index === 0

    return (
      <div key={version.id}>
        {!isFirst && <Separator className="bg-border" />}
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
            isSelected
              ? "bg-muted"
              : "hover:bg-muted/60"
          )}
          onClick={() => handleSelect(version)}
        >
          <Badge variant="secondary" className="size-6 shrink-0 items-center justify-center px-0 text-[0.625rem] font-normal">
            {version.version}
          </Badge>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className={cn(
              "truncate text-sm",
              isSelected ? "font-medium" : ""
            )}>
              {version.title || "Untitled"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(version.createdAt)}
            </span>
          </div>
        </button>
      </div>
    )
  }

  function renderVersionInspector() {
    if (!selectedItem) return null

    return (
      <div className="flex-1">
        <Separator className="bg-border" />
        <Card className="bg-transparent shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="secondary" className="size-6 shrink-0 items-center justify-center px-0 text-[0.625rem] font-normal">
                {selectedItem.version}
              </Badge>
              <span className="truncate">{selectedItem.title || "Untitled"}</span>
            </CardTitle>
            <CardDescription>
              {formatDate(selectedItem.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Markdown Preview</h4>
              <div className="mt-2 max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
                {selectedItem.markdown ? (
                  <pre className="whitespace-pre-wrap font-sans">
                    {selectedItem.markdown}
                  </pre>
                ) : (
                  <span className="text-muted-foreground">No content</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Section Breakdown</h4>
              {selectedItem.content && (
                <div className="mt-2 flex flex-col gap-2">
                  {Object.entries(selectedItem.content).map(
                    ([key, value]) => {
                      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
                        return null
                      }
                      const displayValue = Array.isArray(value) ? value.join(", ") : value
                      const label = key.charAt(0).toUpperCase() + key.slice(1)
                      return (
                        <div key={key} className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {label}
                          </span>
                          <p className="truncate text-sm text-muted-foreground">
                            {displayValue}
                          </p>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </div>
            <Button onClick={() => handleRestore(selectedItem)}>
              Restore this version
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {effectiveVersions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No version history
              </p>
            ) : (
              effectiveVersions.map((version, index) =>
                renderVersionListItem(version, index)
              )
            )}
          </div>
          {renderVersionInspector()}
        </div>
      </SheetContent>
    </Sheet>
  )
}
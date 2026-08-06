"use client"

import { useState } from "react"

import { compareVersion } from "@/lib/agents/version-diff"
import type { Agent, AgentVersion } from "@/lib/agents/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Code2Icon,
  PlusCircleIcon,
  Trash2Icon,
  WandSparklesIcon,
} from "lucide-react"

interface AgentVersionCompareProps {
  version: AgentVersion | null
  current: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRollback?: (versionId: string) => boolean
}

function EmptyState({ message }: { message: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WandSparklesIcon className="size-6 text-muted-foreground/50" />
        </EmptyMedia>
        <EmptyTitle>Unable to Compare</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function DiffLine({ status, line }: { status: "added" | "removed"; line: string }) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap font-mono text-[13px]",
        status === "added" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        status === "removed" && "bg-red-500/10 text-red-700 dark:text-red-400",
      )}
    >
      <span className="mr-2 inline-block w-5 shrink-0 select-none text-right">
        {status === "added" ? "+" : "-"}
      </span>
      {line}
    </div>
  )
}

function ScrollableDiffArea({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-y-auto rounded-lg border bg-card font-mono text-xs max-h-[60vh]">
      <code className="block p-3">{children}</code>
    </pre>
  )
}

function PromptDiffPanel({
  promptDiffs,
}: {
  promptDiffs: { status: "added" | "removed"; line: string }[]
}) {
  if (promptDiffs.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <span>System prompt unchanged</span>
      </div>
    )
  }

  return (
    <ScrollableDiffArea>
      {promptDiffs.map((d, i) => (
        <DiffLine key={i} status={d.status} line={d.line} />
      ))}
    </ScrollableDiffArea>
  )
}

type DiffStatus = "same" | "changed" | "added" | "removed"

function FieldDiffRow({
  label,
  versionValue,
  currentValue,
  status,
}: {
  label: string
  versionValue?: string
  currentValue?: string
  status: DiffStatus
}) {
  const displayValue = status === "same" ? currentValue : versionValue ?? currentValue ?? "—"

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {status === "same" && (
          <Badge variant="secondary" className="text-[10px]">
            unchanged
          </Badge>
        )}
        {status === "changed" && (
          <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400">
            changed
          </Badge>
        )}
      </div>

      {status === "same" ? (
        <span className="truncate text-sm text-muted-foreground">{displayValue}</span>
      ) : (
        <span className="text-sm">{displayValue}</span>
      )}
    </div>
  )
}

function ScalarDiffSection({
  nameDiff,
  descriptionDiff,
  modelDiff,
}: {
  nameDiff: { field: string; status: DiffStatus; versionValue?: string; currentValue?: string }
  descriptionDiff: { field: string; status: DiffStatus; versionValue?: string; currentValue?: string }
  modelDiff: { field: string; status: DiffStatus; versionValue?: string; currentValue?: string }
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <FieldDiffRow label="Name" status={nameDiff.status} versionValue={nameDiff.versionValue} currentValue={nameDiff.currentValue} />
      <FieldDiffRow label="Description" status={descriptionDiff.status} versionValue={descriptionDiff.versionValue} currentValue={descriptionDiff.currentValue} />
      <FieldDiffRow label="Model" status={modelDiff.status} versionValue={modelDiff.versionValue} currentValue={modelDiff.currentValue} />
    </div>
  )
}

function CollectionList({
  items,
  title,
}: {
  items: { id: string; name: string; description: string; diffStatus: "added" | "removed" }[]
  title: string
}) {
  if (items.length === 0) {
    return null
  }

  const isAdded = items[0].diffStatus === "added"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isAdded ? (
          <PlusCircleIcon className="size-4 text-emerald-600" />
        ) : (
          <Trash2Icon className="size-4 text-red-600" />
        )}
        <span className="text-sm font-medium">
          {title} ({items.length})
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id}>
            {isAdded ? (
              <div className="flex items-start gap-2 rounded-md border bg-emerald-500/5 px-3 py-2 text-sm">
                <PlusCircleIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <span className="text-[13px] text-muted-foreground">{item.description}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md border bg-red-500/5 px-3 py-2 text-sm">
                <Trash2Icon className="mt-0.5 size-3.5 shrink-0 text-red-600" />
                <div className="flex flex-col gap-0.5">
                  <span className="line-through text-muted-foreground">{item.name}</span>
                  {item.description && (
                    <span className="text-[13px] text-muted-foreground/70">{item.description}</span>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AgentVersionCompare({
  version,
  current,
  open,
  onOpenChange,
  onRollback,
}: AgentVersionCompareProps) {
  const [rollbackOpen, setRollbackOpen] = useState(false)

  // When both fields are available, compute the diff
  let comparison = null
  if (version && current) {
    comparison = compareVersion(version, current)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            Version Comparison
            {version && (
              <span className="ml-2 inline-block">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {version.versionLabel}
                </Badge>
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Comparing {version?.versionLabel ?? "—"} with current agent
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-col gap-6 overflow-y-auto py-4">
          {version == null || current == null ? (
            <EmptyState message="No version or current agent data available. Cannot display a comparison." />
          ) : comparison == null ? (
            <EmptyState message="Unable to compute version differences. Ensure version and current agent data are loaded." />
          ) : (
            <>
              {/* Scalar fields */}
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">Scalar Changes</h3>
                <Separator />
                <ScalarDiffSection
                  nameDiff={comparison.name}
                  descriptionDiff={comparison.description}
                  modelDiff={comparison.model}
                />
              </div>

              {/* System prompt diff */}
              <div className="flex flex-col gap-1">
                <Alert>
                  <Code2Icon className="size-4" />
                  <AlertTitle>System Prompt Changes</AlertTitle>
                  <AlertDescription>
                    {comparison.promptDiffs.length > 0
                      ? `${comparison.promptDiffs.length} line(s) differ between versions`
                      : "System prompt is unchanged"}
                  </AlertDescription>
                </Alert>
                <PromptDiffPanel promptDiffs={comparison.promptDiffs} />
              </div>

              {/* Tools diff */}
              {comparison.toolDiffs.added.length > 0 ||
              comparison.toolDiffs.removed.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {comparison.toolDiffs.added.length > 0 && (
                    <CollectionList
                      items={comparison.toolDiffs.added}
                      title="Tools"
                    />
                  )}
                  {comparison.toolDiffs.removed.length > 0 && (
                    <CollectionList
                      items={comparison.toolDiffs.removed}
                      title="Tools"
                    />
                  )}
                </div>
              ) : null}

              {/* Skills diff */}
              {comparison.skillDiffs.added.length > 0 ||
              comparison.skillDiffs.removed.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {comparison.skillDiffs.added.length > 0 && (
                    <CollectionList
                      items={comparison.skillDiffs.added}
                      title="Skills"
                    />
                  )}
                  {comparison.skillDiffs.removed.length > 0 && (
                    <CollectionList
                      items={comparison.skillDiffs.removed}
                      title="Skills"
                    />
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter>
          {onRollback && version && (
            <Button
              variant="default"
              onClick={() => {
                setRollbackOpen(true)
              }}
            >
              Roll Back to {version.versionLabel}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>

        {version && (
          <AlertDialog open={rollbackOpen} onOpenChange={setRollbackOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Roll back to version {version.versionLabel}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore the agent to this version&apos;s
                  configuration. Current unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onRollback?.(version.versionId)
                    setRollbackOpen(false)
                  }}
                >
                  Roll Back
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AgentVersionCompare
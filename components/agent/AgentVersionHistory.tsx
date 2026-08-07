"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
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
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import type { AgentVersion } from "@/lib/agents/types"
import {
  EyeIcon,
  Trash2Icon,
  RotateCcwIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react"

interface AgentVersionHistoryProps {
  versions: AgentVersion[]
  selectedVersion: AgentVersion | null
  onSelectVersion: (version: AgentVersion) => void
  onClearSelection: () => void
  onDeleteVersion: (versionId: string) => boolean
  onRollbackVersion: (versionId: string) => boolean
}

function formatDate(dateStr: string): string {
  try {
    if (!dateStr) return "\u2014"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "\u2014"
  }
}

export function AgentVersionHistory({
  versions,
  selectedVersion,
  onSelectVersion,
  onClearSelection,
  onDeleteVersion,
  onRollbackVersion,
}: AgentVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [rollbackOpen, setRollbackOpen] = useState(false)
  const [rollbackTargetId, setRollbackTargetId] = useState<string | null>(null)
  const rollbackTargetLabel =
    (rollbackTargetId &&
      versions.find((v) => v.versionId === rollbackTargetId)?.versionLabel) ||
    "?"

  function handleDeleteConfirm(versionId: string) {
    setDeleteTargetId(null)
    setDeleteOpen(false)
    const success = onDeleteVersion(versionId)
    if (success) {
      toast.add({ title: "Version deleted", type: "success" })
      if (selectedVersion?.versionId === versionId) {
        onClearSelection()
      }
    } else {
      toast.add({ title: "Failed to delete version", type: "error" })
    }
  }

  function handleRollbackConfirm(versionId: string) {
    setRollbackTargetId(null)
    setRollbackOpen(false)
    const success = onRollbackVersion(versionId)
    if (success) {
      toast.add({ title: "Agent restored", type: "success" })
      onClearSelection()
    } else {
      toast.add({ title: "Failed to restore version", type: "error" })
    }
  }

  function handleSelect(version: AgentVersion) {
    if (selectedVersion?.versionId === version.versionId) {
      onClearSelection()
    } else {
      onSelectVersion(version)
      setIsOpen(true)
    }
  }

  if (versions.length === 0) {
    return (
      <section aria-label="Version History">
        <h2 className="mb-4 text-lg font-semibold">Version History</h2>
        <Empty>
          <EmptyTitle>No version history yet</EmptyTitle>
          <EmptyDescription>
            Versions are created automatically when you make meaningful changes.
          </EmptyDescription>
        </Empty>
      </section>
    )
  }

  const selectedVer = versions.find(
    (v) => v.versionId === selectedVersion?.versionId,
  )

  return (
    <section aria-label="Version History">
      <h2 className="mb-4 text-lg font-semibold">Version History</h2>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="sr-only">Version List</CardTitle>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Version</TableHead>
                  <TableHead className="w-[140px]">Changed</TableHead>
                  <TableHead>Change Reason</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((ver) => {
                  const isSelected =
                    selectedVersion?.versionId === ver.versionId

                  return (
                    <TableRow
                      key={ver.versionId}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected && "bg-muted/50",
                      )}
                      onClick={() => handleSelect(ver)}
                      aria-expanded={isSelected}
                      tabIndex={0}
                      role="button"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <ChevronDownIcon className="text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="text-muted-foreground" />
                          )}
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs"
                          >
                            {ver.versionLabel}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(ver.changedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {ver.changeReason ? (
                          <span className="text-sm text-muted-foreground">
                            {ver.changeReason}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            \u2014
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectVersion(ver)
                              setIsOpen(true)
                            }}
                          >
                            <EyeIcon data-icon="inline-start" />
                            Compare
                          </Button>
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRollbackTargetId(ver.versionId)
                              setRollbackOpen(true)
                            }}
                          >
                            <RotateCcwIcon data-icon="inline-start" />
                            Rollback
                          </Button>
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTargetId(ver.versionId)
                              setDeleteOpen(true)
                            }}
                          >
                            <Trash2Icon data-icon="inline-start" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardHeader>
        </Card>

        {/* Inline detail for selected version */}
        {selectedVer && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent>
              <Card className="mt-px rounded-t-none border-t-0">
                <CardContent className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Version Details
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClearSelection()
                      }}
                    >
                      <XIcon data-icon="inline-start" className="size-3" />
                      Clear selection
                    </Button>
                  </div>
                  <Separator />
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Name
                      </dt>
                      <dd className="col-span-2 truncate">{selectedVer.name}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Description
                      </dt>
                      <dd className="col-span-2">{selectedVer.description}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Model
                      </dt>
                      <dd className="col-span-2">{selectedVer.model}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        System Prompt
                      </dt>
                      <dd className="col-span-2 truncate">
                        {selectedVer.system_prompt}
                      </dd>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Skills
                      </dt>
                      <dd className="col-span-2">
                        {selectedVer.skills.length}
                      </dd>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Tools
                      </dt>
                      <dd className="col-span-2">
                        {selectedVer.tools.length}
                      </dd>
                    </div>
                    {selectedVer.changeReason && (
                      <div className="grid grid-cols-3 gap-2">
                        <dt className="font-medium text-muted-foreground">
                          Change Reason
                        </dt>
                        <dd className="col-span-2">
                          {selectedVer.changeReason}
                        </dd>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <dt className="font-medium text-muted-foreground">
                        Changed At
                      </dt>
                      <dd className="col-span-2">
                        {formatDate(selectedVer.changedAt)}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete version?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this version snapshot.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() =>
                  deleteTargetId && handleDeleteConfirm(deleteTargetId)
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rollback confirmation dialog */}
        <AlertDialog
          open={rollbackOpen}
          onOpenChange={setRollbackOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Roll back to version {rollbackTargetLabel} ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will restore the agent to this version&apos;s
                configuration. Current unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  rollbackTargetId && handleRollbackConfirm(rollbackTargetId)
                }
              >
                Roll Back
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}
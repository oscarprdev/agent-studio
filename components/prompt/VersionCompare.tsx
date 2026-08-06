"use client"

import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { PromptDiff, PromptVersion } from "@/lib/prompts/types"

const MAX_DIFF_LINES = 5000

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface VersionCompareRowProps {
  line: {
    type: "added" | "removed" | "unchanged"
    content: string
    oldLineNumber?: number
    newLineNumber?: number
  }
}

function VersionCompareRow({ line }: VersionCompareRowProps) {
  const prefixMap = {
    added: "+",
    removed: "-",
    unchanged: " ",
  }

  const labelMap = {
    added: "Added",
    removed: "Removed",
    unchanged: "Context",
  }

  const variantMap = {
    added: "default" as const,
    removed: "destructive" as const,
    unchanged: "secondary" as const,
  }

  const lineClassName = {
    added: "bg-emerald-50 dark:bg-emerald-950/20",
    removed: "bg-red-50 dark:bg-red-950/20",
    unchanged: "",
  }

  return (
    <div
      className={lineClassName[line.type]}
      role="listitem"
      aria-label={`${labelMap[line.type]}: ${line.content}`}
    >
      <div className="flex items-center gap-2 px-4 py-0.5 font-mono text-sm">
        <span
          className="inline-flex size-5 shrink-0 items-center justify-center rounded text-xs font-bold"
          style={{
            backgroundColor:
              line.type === "added"
                ? "rgb(34 197 94 / 0.15)"
                : line.type === "removed"
                  ? "rgb(239 68 68 / 0.15)"
                  : "transparent",
            color:
              line.type === "added"
                ? "rgb(22 163 74)"
                : line.type === "removed"
                  ? "rgb(220 38 38)"
                  : "rgb(107 114 128)",
          }}
        >
          {prefixMap[line.type]}
        </span>
        {line.oldLineNumber != null && (
          <span className="w-px h-4 bg-border" aria-hidden="true" />
        )}
        {line.oldLineNumber != null && (
          <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground/60">
            {line.oldLineNumber}
          </span>
        )}
        {line.newLineNumber != null && (
          <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground/60">
            {line.newLineNumber}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">
          {line.content || "\u00A0"}
        </span>
        <Badge
          variant={variantMap[line.type]}
          className="ml-auto shrink-0 text-[10px] font-medium"
        >
          {labelMap[line.type]}
        </Badge>
      </div>
    </div>
  )
}

interface VersionCompareProps {
  left: PromptVersion
  right: PromptVersion
  diff: PromptDiff
  onClose?: () => void
}

export function VersionCompare({
  left,
  right,
  diff,
  onClose,
}: VersionCompareProps) {
  const isIdentical = diff.lines.length === 0
  const isEmptyLeft = left.markdown.length === 0
  const isEmptyRight = right.markdown.length === 0
  const isTooLarge = diff.lines.length > MAX_DIFF_LINES

  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {left.title || "Untitled"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              v{left.version} — {formatDate(left.createdAt)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">→</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">
              {right.title || "Untitled"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              v{right.version} — {formatDate(right.createdAt)}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close version comparison"
          >
            <svg
              data-icon="inline-end"
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 overflow-auto">
        {isIdentical ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground/80">
              No differences between these versions
            </p>
            <Separator className="mt-2" />
          </div>
        ) : isEmptyLeft && isEmptyRight ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground/80">
              Both versions are empty
            </p>
          </div>
        ) : isTooLarge ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm font-medium text-muted-foreground/80">
              Document too large to display diff.
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum supported diff is {MAX_DIFF_LINES.toLocaleString()} lines.
            </p>
          </div>
        ) : (
          <div role="list" aria-label="Version diff">
            {diff.lines.map((line, index) => (
              <VersionCompareRow key={`${line.type}-${line.oldLineNumber ?? ""}-${line.newLineNumber ?? ""}-${index}`} line={line} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
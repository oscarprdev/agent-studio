"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { PromptPreview } from "@/components/prompt/PromptPreview"
import { VersionHistory } from "@/components/prompt/VersionHistory"
import { VersionCompare } from "@/components/prompt/VersionCompare"
import { TestPanel } from "@/components/prompt/TestPanel"
import * as store from "@/lib/prompts/store"
import { comparePromptVersions } from "@/lib/prompts/versions"
import { markdownToSections, sectionsToMarkdown } from "@/lib/prompts/serialize"
import type { Prompt, PromptVersion } from "@/lib/prompts/types"

interface PromptEditorProps {
  prompt: Prompt | null
  onSave?: (prompt: Prompt) => void
}

export function PromptEditor({ prompt, onSave }: PromptEditorProps) {
  const router = useRouter()

  // Initialize draft from prompt on mount
  const initialTitle = prompt?.title ?? ""
  const initialMarkdown = prompt?.content
    ? sectionsToMarkdown(prompt.content)
    : ""

  const [draftTitle, setDraftTitle] = useState(initialTitle)
  const [draftMarkdown, setDraftMarkdown] = useState(initialMarkdown)
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [compareLeft, setCompareLeft] = useState<PromptVersion | null>(null)
  const [compareRight, setCompareRight] = useState<PromptVersion | null>(null)

  const promptId = prompt?.id ?? ""
  const initialTitleRef = useRef(initialTitle)
  const initialMarkdownRef = useRef(initialMarkdown)
  const saveDirtyRef = useRef(false)

  // Load versions on mount
  useEffect(() => {
    if (!promptId) return
    try {
      setVersions(store.getVersionHistory(promptId))
    } catch {
      // ignore load errors
    }
  }, [promptId])

  // Save handler
  const handleSave = useCallback(() => {
    if (!prompt || !promptId) return

    // Skip if nothing changed
    if (
      draftTitle === initialTitleRef.current &&
      draftMarkdown === initialMarkdownRef.current
    ) {
      return
    }

    setIsSaving(true)

    try {
      // Parse markdown → PromptSections
      const { role, objective, tools, workflow, rules, output } =
        markdownToSections(draftMarkdown)

      // Update prompt (title + content)
      const updated = store.update(promptId, {
        title: draftTitle,
        content: { role, objective, tools, workflow, rules, output },
      })

      if (updated) {
        // Save version (skip if identical to latest version)
        const latestVersion = versions[0] ?? null
        const hasDiff =
          !latestVersion ||
          latestVersion.title !== draftTitle ||
          latestVersion.markdown !== draftMarkdown

        if (hasDiff) {
          try {
            store.savePromptVersion(
              promptId,
              draftTitle,
              draftMarkdown,
              { role, objective, tools, workflow, rules, output }
            )
          } catch {
            // version save failure — prompt is already saved
          }
        }

        // Refresh version list
        try {
          setVersions(store.getVersionHistory(promptId))
        } catch {
          // ignore
        }

        // Persist initial state for dirty check
        initialTitleRef.current = draftTitle
        initialMarkdownRef.current = draftMarkdown
        saveDirtyRef.current = false

        toast.add({ title: "Prompt saved", type: "success" })
        onSave?.(updated)
      } else {
        toast.add({ title: "Failed to save", type: "error" })
      }
    } catch {
      toast.add({ title: "Failed to save", type: "error" })
    } finally {
      setIsSaving(false)
    }
  }, [prompt, promptId, draftTitle, draftMarkdown, versions, onSave])

  // Keyboard shortcut: Cmd/Ctrl+S
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener("keydown", onKeydown)
    return () => window.removeEventListener("keydown", onKeydown)
  }, [handleSave])

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (saveDirtyRef.current && !isSaving) {
        handleSave()
        initialTitleRef.current = draftTitle
        initialMarkdownRef.current = draftMarkdown
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [handleSave, draftTitle, draftMarkdown, isSaving])

  // Restore version handler
  function handleRestore(version: PromptVersion) {
    // Overwrite current draft with version content
    setDraftTitle(version.title)
    setDraftMarkdown(version.markdown)
    setShowHistory(false)

    // Save as new version (restore creates snapshot)
    try {
      store.savePromptVersion(
        promptId,
        version.title,
        version.markdown,
        version.content
      )
      try {
        setVersions(store.getVersionHistory(promptId))
      } catch {
        // ignore
      }
    } catch {
      // ignore version save failure
    }

    toast.add({ title: "Version restored", type: "success" })
  }

  function handleCreateAgent() {
    if (!prompt) return
    const params = new URLSearchParams()
    params.set("promptId", prompt.id)
    router.push(`/agents/new?${params.toString()}`)
  }

  function handleCreateSkill() {
    if (!prompt) return
    const params = new URLSearchParams()
    params.set("promptId", prompt.id)
    router.push(`/skills/new?${params.toString()}`)
  }

  // Compare handler
  function handleShowCompare() {
    if (!promptId || versions.length < 2) return
    // Use the two most recent versions
    const left = versions[1] ?? null
    const right = versions[0] ?? null
    if (!left || !right) return

    try {
      setCompareLeft(left)
      setCompareRight(right)
    } catch {
      // ignore compare errors
    }
  }

  if (!prompt) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">Prompt not found</p>
        <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
          Back to List
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Top bar: title input, Save, Test, History */}
      <div className="flex flex-col gap-4 border-b p-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="prompt-title">Title</FieldLabel>
            <Input
              id="prompt-title"
              value={draftTitle}
              onChange={(e) => {
                setDraftTitle(e.target.value)
                saveDirtyRef.current = true
              }}
            />
          </Field>
        </FieldGroup>
      </div>

      {/* Split pane: Editor (left) | Preview (right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Markdown textarea editor */}
        <div className="flex-1 overflow-auto">
          <textarea
            value={draftMarkdown}
            onChange={(e) => {
              setDraftMarkdown(e.target.value)
              saveDirtyRef.current = true
            }}
            className="h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none"
            placeholder="Write your prompt in markdown..."
            aria-label="Prompt markdown editor"
          />
        </div>

        {/* Separator */}
        <div className="w-px shrink-0 bg-border" />

        {/* Live preview */}
        <div className="flex-1 overflow-auto border-l">
          <PromptPreview content={draftMarkdown} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col gap-3 border-t bg-muted/40 p-4 sm:flex-row sm:flex-wrap">
        <Button
          onClick={handleSave}
          disabled={isSaving || !promptId}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={handleCreateAgent}>
          Create Agent
        </Button>
        <Button variant="outline" onClick={handleCreateSkill}>
          Create Skill
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {versions.length >= 2 && (
            <Button variant="outline" onClick={handleShowCompare}>
              Compare
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowTest(true)}>
            Test
          </Button>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            History
          </Button>
        </div>
      </div>

      {/* Version History Sheet */}
      <VersionHistory
        promptId={promptId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestore}
      />

      {/* Test Panel Sheet */}
      <TestPanel
        isOpen={showTest}
        onClose={() => setShowTest(false)}
        currentMarkdown={draftMarkdown}
      />

      {/* Version Compare (inline below split pane) */}
      {compareLeft && compareRight && (
        <VersionCompare
          left={compareLeft}
          right={compareRight}
          diff={comparePromptVersions(compareLeft, compareRight)}
          onClose={() => {
            setCompareLeft(null)
            setCompareRight(null)
          }}
        />
      )}
    </div>
  )
}
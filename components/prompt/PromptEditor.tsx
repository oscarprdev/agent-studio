"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
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
  const [compareDiff, setCompareDiff] = useState<ReturnType<typeof comparePromptVersions> | null>(null)

  const promptId = prompt?.id ?? ""
  const draftTitleRef = useRef(draftTitle)
  const draftMarkdownRef = useRef(draftMarkdown)
  const initialTitleRef = useRef(initialTitle)
  const initialMarkdownRef = useRef(initialMarkdown)
  const saveDirtyRef = useRef(false)

  draftTitleRef.current = draftTitle
  draftMarkdownRef.current = draftMarkdown

  useEffect(() => {
    if (!promptId) return
    try {
      setVersions(store.getVersionHistory(promptId))
    } catch {
      // ignore load errors
    }
  }, [promptId])

  const handleSave = useCallback(() => {
    if (!prompt || !promptId) return

    if (
      draftTitleRef.current === initialTitleRef.current &&
      draftMarkdownRef.current === initialMarkdownRef.current
    ) {
      return
    }

    setIsSaving(true)

    try {
      const { role, objective, tools, workflow, rules, output } =
        markdownToSections(draftMarkdownRef.current)

      const updated = store.update(promptId, {
        title: draftTitleRef.current,
        content: { role, objective, tools, workflow, rules, output },
      })

      if (updated) {
        const latestVersion = versions[0] ?? null
        const hasDiff =
          !latestVersion ||
          latestVersion.title !== draftTitleRef.current ||
          latestVersion.markdown !== draftMarkdownRef.current

        if (hasDiff) {
          try {
            store.savePromptVersion(
              promptId,
              draftTitleRef.current,
              draftMarkdownRef.current,
              { role, objective, tools, workflow, rules, output }
            )
          } catch {
            // version save failure
          }
        }

        try {
          setVersions(store.getVersionHistory(promptId))
        } catch {
          // ignore
        }

        initialTitleRef.current = draftTitleRef.current
        initialMarkdownRef.current = draftMarkdownRef.current
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
  }, [prompt, promptId, versions, onSave])

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (saveDirtyRef.current && !isSaving) {
        handleSave()
        initialTitleRef.current = draftTitleRef.current
        initialMarkdownRef.current = draftMarkdownRef.current
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [handleSave, isSaving])

  function handleRestore(version: PromptVersion) {
    setDraftTitle(version.title)
    setDraftMarkdown(version.markdown)
    setShowHistory(false)

    try {
      const updated = store.restorePromptVersion(promptId, version.id)
      if (updated) {
        try {
          setVersions(store.getVersionHistory(promptId))
        } catch {
          // ignore
        }
        initialTitleRef.current = updated.title
        initialMarkdownRef.current = version.markdown
        saveDirtyRef.current = false
      }
    } catch {
      // ignore version restore failure
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

  function handleShowCompare() {
    if (!promptId || versions.length < 2) return
    const left = versions[1] ?? null
    const right = versions[0] ?? null
    if (!left || !right) return

    setCompareLeft(left)
    setCompareRight(right)
    setCompareDiff(comparePromptVersions(left, right))
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

      <div className="flex flex-1 overflow-hidden">
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

        <div className="w-px shrink-0 bg-border" />

        <div className="flex-1 overflow-auto border-l">
          <PromptPreview content={draftMarkdown} />
        </div>
      </div>

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

      <VersionHistory
        promptId={promptId}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestore}
      />

      <TestPanel
        isOpen={showTest}
        onClose={() => setShowTest(false)}
        currentMarkdown={draftMarkdown}
      />

      {compareLeft && compareRight && compareDiff && (
        <VersionCompare
          left={compareLeft}
          right={compareRight}
          diff={compareDiff}
          onClose={() => {
            setCompareLeft(null)
            setCompareRight(null)
            setCompareDiff(null)
          }}
        />
      )}
    </div>
  )
}

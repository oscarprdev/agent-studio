"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import * as store from "@/lib/agents/store"
import type { Agent, AgentDefinition, AgentVersion } from "@/lib/agents/types"
import { Button } from "@/components/ui/button"
import { TopBar } from "@/components/layout/top-bar"
import { toast } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { AgentOutput } from "@/components/agent/AgentOutput"
import { AgentVersionHistory } from "@/components/agent/AgentVersionHistory"
import { AgentVersionCompare } from "@/components/agent/AgentVersionCompare"
import { AgentDetailTabs } from "./_components/agent-detail-tabs"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 100)
}

function downloadFile(content: string, filename: string, mimeType: string) {
  try {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    // Silently tolerate browser/download failures
  }
}

function isValidDraft(draft: AgentDefinition) {
  return (
    draft.name.trim() !== "" &&
    draft.description.trim() !== "" &&
    draft.model.trim() !== "" &&
    draft.system_prompt.trim() !== ""
  )
}

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [agent, setAgent] = useState<Agent | null>(() => store.getById(id))
  const [versions, setVersions] = useState<AgentVersion[]>(() => {
    if (!agent) return []
    return store.getVersions(agent.id)
  })
  const [selectedVersion, setSelectedVersion] = useState<AgentVersion | null>(null)

  if (!agent) {
    return (
      <>
        <TopBar title="Agent Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">Agent not found</p>
          <Button render={<Link href="/agents" />} nativeButton={false}>
            Back to Agents
          </Button>
        </div>
      </>
    )
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [draft, setDraft] = useState<AgentDefinition>({
    name: agent.name,
    description: agent.description,
    model: agent.model,
    system_prompt: agent.system_prompt,
    skills: agent.skills,
    tools: agent.tools,
  })

  const [showPreview, setShowPreview] = useState(false)

  function handleSave() {
    if (!isValidDraft(draft)) return
    const updated = store.update(agent.id, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      model: draft.model.trim(),
      system_prompt: draft.system_prompt.trim(),
      skills: draft.skills,
      tools: draft.tools,
    })
    if (updated) {
      setAgent(updated)
      setVersions(store.getVersions(updated.id))
      toast.add({ title: "Agent saved", type: "success" })
    } else {
      toast.add({ title: "Failed to save agent", type: "error" })
    }
  }

  function handleDuplicate() {
    const newAgent = store.duplicateAgent(agent.id)
    if (newAgent) {
      toast.add({ title: "Agent duplicated", type: "success" })
      router.push(`/agents/${newAgent.id}`)
    } else {
      toast.add({ title: "Failed to duplicate agent", type: "error" })
    }
  }

  function handleDelete() {
    const removed = store.deleteAgent(agent.id)
    if (removed) {
      router.push("/agents")
    } else {
      toast.add({ title: "Failed to delete agent", type: "error" })
    }
  }

  function handleExportMarkdown() {
    const md = store.exportAgentMarkdown(agent.id)
    if (md) {
      downloadFile(md, `${sanitizeFilename(agent.name)}.md`, "text/markdown")
    }
  }

  function handleExportJson() {
    downloadFile(
      JSON.stringify({ ...draft, version: agent.version, createdAt: agent.createdAt, updatedAt: agent.updatedAt }, null, 2),
      `${sanitizeFilename(agent.name)}.json`,
      "application/json",
    )
  }

  function handleDeleteVersion(versionId: string): boolean {
    const ok = store.deleteVersion(agent.id, versionId)
    if (ok) {
      setVersions(store.getVersions(agent.id))
      if (selectedVersion?.versionId === versionId) setSelectedVersion(null)
      toast.add({ title: "Version deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete version", type: "error" })
    }
    return ok
  }

  function handleRollbackVersion(versionId: string): boolean {
    const restored = store.rollbackToVersion(agent.id, versionId)
    if (restored) {
      setAgent(restored)
      setVersions(store.getVersions(restored.id))
      setSelectedVersion(null)
      setDraft({
        name: restored.name,
        description: restored.description,
        model: restored.model,
        system_prompt: restored.system_prompt,
        skills: restored.skills,
        tools: restored.tools,
      })
      toast.add({ title: "Agent restored", type: "success" })
    } else {
      toast.add({ title: "Failed to restore version", type: "error" })
    }
    return restored !== null
  }

  function handleSelectVersion(v: AgentVersion) {
    setSelectedVersion(v)
  }

  return (
    <>
      <TopBar title={agent.name} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AgentDetailTabs
          key={agent.updatedAt}
          agent={agent}
          draft={draft}
          onChange={setDraft}
        />

        <AgentVersionHistory
          versions={versions}
          selectedVersion={selectedVersion}
          onSelectVersion={handleSelectVersion}
          onClearSelection={() => setSelectedVersion(null)}
          onDeleteVersion={handleDeleteVersion}
          onRollbackVersion={handleRollbackVersion}
        />

        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <CollapsibleContent>
            <AgentOutput agent={{ ...draft }} />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap items-center gap-2 pt-4">
          <Button onClick={handleSave} disabled={!isValidDraft(draft)} size="lg">
            Save
          </Button>
          <Button variant="outline" onClick={handleDuplicate} size="lg">
            Duplicate
          </Button>
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="lg">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{agent.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  agent and remove it from storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    handleDelete()
                    setDeleteConfirmOpen(false)
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={handleExportMarkdown} size="lg">
            Export Markdown
          </Button>
          <Button variant="outline" onClick={handleExportJson} size="lg">
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? (
              <>
                Hide Preview <ChevronUpIcon data-icon="inline-end" />
              </>
            ) : (
              <>
                Test (Preview) <ChevronDownIcon data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Compare dialog */}
      {selectedVersion && (
        <AgentVersionCompare
          version={selectedVersion}
          current={agent}
          open={!!selectedVersion}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedVersion(null)
            }
          }}
          onRollback={handleRollbackVersion}
        />
      )}
    </>
  )
}

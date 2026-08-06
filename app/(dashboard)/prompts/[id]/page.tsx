"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getById, remove } from "@/lib/prompts/store"
import { getPromptVersions } from "@/lib/prompts/versions"
import { markdownToSections } from "@/lib/prompts/serialize"
import type { Prompt, PromptVersion } from "@/lib/prompts/types"
import { TopBar } from "@/components/layout/top-bar"
import { ArrowRight, CopyIcon, Trash2Icon, WandSparklesIcon } from "lucide-react"
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
import { toast } from "@/components/ui/toast"

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014"
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "\u2014"
  }
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h4>
      {children}
    </div>
  )
}

export default function PromptDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [prompt, setPrompt] = useState<Prompt | null>(() => getById(params.id))
  const [versions] = useState<PromptVersion[]>(() => {
    try {
      return getPromptVersions(params.id)
    } catch {
      return []
    }
  })
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!prompt) {
    return (
      <>
        <TopBar title="Prompt Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">Prompt not found</p>
          <Button render={<Link href="/prompts" />} nativeButton={false}>
            Back to List
          </Button>
        </div>
      </>
    )
  }

  const latestVersion = versions.length > 0 ? versions[0]?.version ?? null : null
  const sections = markdownToSections(prompt.content || "")

  function handleCopy(): void {
    const md = [
      `ROLE\n${sections.role}`,
      `\nOBJECTIVE\n${sections.objective}`,
      `\nTOOLS\n${sections.tools.join(", ")}`,
      `\nWORKFLOW\n${sections.workflow.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
      `\nRULES\n${sections.rules}`,
      `\nOUTPUT\n${sections.output}`,
    ].join("\n")
    navigator.clipboard.writeText(md).then(() => {
      toast.add({ title: "Copied to clipboard", type: "success" })
    }).catch(() => {
      toast.add({ title: "Failed to copy", type: "error" })
    })
  }

  function handleDelete(): void {
    remove(prompt.id)
    toast.add({ title: "Prompt deleted", type: "success" })
    router.push("/prompts")
  }

  function handleCreateAgent(): void {
    router.push(`/agents/new?promptId=${prompt.id}`)
  }

  function handleCreateSkill(): void {
    router.push(`/skills/new?promptId=${prompt.id}`)
  }

  return (
    <>
      <TopBar
        title={prompt.title}
        actions={
          <>
            {latestVersion !== null && (
              <Badge variant="secondary">v{latestVersion}</Badge>
            )}
            <Badge variant="outline">Created {formatDate(prompt.createdAt)}</Badge>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Button variant="outline" size="xs" onClick={handleCopy}>
              <CopyIcon className="size-3" data-icon="inline-start" />
              Copy
            </Button>
            <Button variant="outline" size="xs" onClick={handleCreateAgent}>
              <WandSparklesIcon className="size-3" data-icon="inline-start" />
              Agent
            </Button>
            <Button variant="outline" size="xs" onClick={handleCreateSkill}>
              Skill
            </Button>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="xs" onClick={() => setDeleteOpen(true)}>
                  <Trash2Icon className="size-3" data-icon="inline-start" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{prompt.title}"?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the prompt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      handleDelete()
                      setDeleteOpen(false)
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Button variant="outline" size="xs" render={<Link href={`/prompts/${params.id}/editor`} />} nativeButton={false}>
              Edit
              <ArrowRight className="size-3" data-icon="inline-end" />
            </Button>
          </>
        }
      />
      <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Version {prompt.version || "—"}</span>
            {prompt.tags.length > 0 && (
              <>
                <Separator orientation="vertical" />
                <div className="flex gap-1">
                  {prompt.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
          <SectionCard title="Role">
            <p className="text-sm">{sections.role || "—"} </p>
          </SectionCard>
          <SectionCard title="Objective">
            <p className="text-sm">{sections.objective || "—"} </p>
          </SectionCard>
          <SectionCard title="Tools">
            {sections.tools.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {sections.tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </SectionCard>
          <SectionCard title="Workflow">
            {sections.workflow.length > 0 ? (
              <ol className="list-inside list-decimal space-y-1 text-sm">
                {sections.workflow.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">None</p>
            )}
          </SectionCard>
          <SectionCard title="Rules">
            <p className="whitespace-pre-wrap text-sm">{sections.rules || "—"} </p>
          </SectionCard>
          <SectionCard title="Output">
            <p className="whitespace-pre-wrap text-sm">{sections.output || "—"} </p>
          </SectionCard>
        </div>
      </div>
    </>
  )
}

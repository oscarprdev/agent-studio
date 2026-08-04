import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { PromptSections } from "@/lib/prompts/types"

interface PromptOutputProps {
  content: PromptSections
  className?: string
}

const SECTIONS = [
  { key: "role" as const, label: "ROLE" },
  { key: "objective" as const, label: "OBJECTIVE" },
  { key: "tools" as const, label: "TOOLS" },
  { key: "workflow" as const, label: "WORKFLOW" },
  { key: "rules" as const, label: "RULES" },
  { key: "output" as const, label: "OUTPUT" },
]

function isEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length === 0
  return typeof value === "string" && value.trim().length === 0
}

function SectionLabel({ label }: { label: string }) {
  return <Badge variant="secondary">{label}</Badge>
}

function ParagraphContent({ text }: { text: string }) {
  if (isEmpty(text)) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return <p className="whitespace-pre-wrap text-sm">{text}</p>
}

function ToolsContent({ tools }: { tools: string[] }) {
  if (tools.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => (
        <Badge key={tool} variant="outline">
          {tool}
        </Badge>
      ))}
    </div>
  )
}

function WorkflowContent({ workflow }: { workflow: string[] }) {
  if (workflow.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return (
    <ol className="flex flex-col gap-2">
      {workflow.map((step, i) => (
        <li key={i} className="flex flex-col gap-2">
          {i > 0 && <Separator />}
          <span className="whitespace-pre-wrap text-sm">
            {i + 1}. {step}
          </span>
        </li>
      ))}
    </ol>
  )
}

function RulesContent({ rules }: { rules: string }) {
  if (isEmpty(rules)) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  const items = rules.split("\n").filter((line) => line.trim().length > 0)
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, i) => (
        <li key={i} className="whitespace-pre-wrap text-sm">
          • {item.trim()}
        </li>
      ))}
    </ul>
  )
}

export function PromptOutput({ content, className }: PromptOutputProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {SECTIONS.map(({ key, label }) => (
        <section key={key} className="flex flex-col gap-2">
          <SectionLabel label={label} />
          {key === "role" && <ParagraphContent text={content.role} />}
          {key === "objective" && (
            <ParagraphContent text={content.objective} />
          )}
          {key === "tools" && <ToolsContent tools={content.tools} />}
          {key === "workflow" && (
            <WorkflowContent workflow={content.workflow} />
          )}
          {key === "rules" && <RulesContent rules={content.rules} />}
          {key === "output" && <ParagraphContent text={content.output} />}
        </section>
      ))}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { SkillContent } from "@/lib/skills/types"

interface SkillOutputProps {
  content: SkillContent
  className?: string
}

const SECTIONS = [
  { key: "name" as const, label: "NAME" },
  { key: "description" as const, label: "DESCRIPTION" },
  { key: "instructions" as const, label: "INSTRUCTIONS" },
  { key: "triggers" as const, label: "TRIGGERS" },
  { key: "tools" as const, label: "TOOLS" },
  { key: "expectedOutput" as const, label: "EXPECTED_OUTPUT" },
  { key: "rules" as const, label: "RULES" },
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
  return <p className="text-sm">{text}</p>
}

function InstructionsContent({ text }: { text: string }) {
  if (isEmpty(text)) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return <p className="whitespace-pre-wrap text-sm">{text}</p>
}

function BadgeListContent({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Not specified</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          {item}
        </Badge>
      ))}
    </div>
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

export function SkillOutput({ content, className }: SkillOutputProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {SECTIONS.map(({ key, label }) => (
        <section key={key} className="flex flex-col gap-2">
          <SectionLabel label={label} />
          {key === "name" && <ParagraphContent text={content.name} />}
          {key === "description" && (
            <ParagraphContent text={content.description} />
          )}
          {key === "instructions" && (
            <InstructionsContent text={content.instructions} />
          )}
          {key === "triggers" && <BadgeListContent items={content.triggers} />}
          {key === "tools" && <BadgeListContent items={content.tools} />}
          {key === "expectedOutput" && (
            <ParagraphContent text={content.expectedOutput} />
          )}
          {key === "rules" && <RulesContent rules={content.rules} />}
        </section>
      ))}
    </div>
  )
}

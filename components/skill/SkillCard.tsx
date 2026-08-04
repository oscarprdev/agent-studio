"use client"

import Link from "next/link"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Skill } from "@/lib/skills/types"

interface SkillCardProps {
  skill: Skill
  onDelete?: (id: string) => void
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "…"
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function SkillCard({ skill, onDelete }: SkillCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate" title={skill.name}>
          {truncate(skill.name, 60)}
        </CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          {formatDate(skill.createdAt)}
        </Badge>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-2 text-muted-foreground">
          {truncate(skill.description, 120)}
        </p>
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skill.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="outline" size="sm" render={<Link href={`/skills/${skill.id}`} />} nativeButton={false}>
          View
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(skill.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

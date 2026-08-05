"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getAll, search, remove } from "@/lib/skills/store"
import type { Skill } from "@/lib/skills/types"
import { SkillCard } from "@/components/skill/SkillCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { TopBar } from "@/components/layout/top-bar"

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(() => getAll() ?? [])
  const [query, setQuery] = useState("")

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setSkills(getAll() ?? [])
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  const filteredSkills = query.trim() ? search(query) : skills

  function handleDelete(id: string) {
    try {
      const removed = remove(id)
      if (removed) {
        setSkills((prev) => prev.filter((s) => s.id !== id))
        toast.add({ title: "Skill deleted", type: "success" })
      } else {
        toast.add({ title: "Failed to delete", type: "error" })
      }
    } catch {
      toast.add({ title: "Failed to delete", type: "error" })
    }
  }

  return (
    <>
      <TopBar title="Skills" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">My Skills</h1>
          <Button render={<Link href="/skills/new" />} nativeButton={false}>New Skill</Button>
        </div>

        <Input
          placeholder="Search skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        {filteredSkills.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No skills yet</EmptyTitle>
              <EmptyDescription>
                Create your first skill to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/skills/new" />} nativeButton={false}>New Skill</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

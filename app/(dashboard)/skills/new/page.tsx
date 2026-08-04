"use client"

import { SkillGenerator } from "@/components/skill/SkillGenerator"
import { TopBar } from "@/components/layout/top-bar"

export default function NewSkillPage() {
  return (
    <>
      <TopBar title="New Skill" />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <SkillGenerator />
        </div>
      </div>
    </>
  )
}
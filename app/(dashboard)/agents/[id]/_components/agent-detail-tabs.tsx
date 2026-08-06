"use client"

import { useState } from "react"
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AgentOverviewTab } from "@/components/agent/AgentOverviewTab"
import { AgentConfigurationTab } from "@/components/agent/AgentConfigurationTab"
import { AgentSkillsTab } from "@/components/agent/AgentSkillsTab"
import { AgentToolsTab } from "@/components/agent/AgentToolsTab"
import type { Agent, AgentDefinition } from "@/lib/agents/types"

type AgentDetailTabsProps = {
  agent: Agent
}

export function AgentDetailTabs({ agent }: AgentDetailTabsProps) {
  const [draft, setDraft] = useState<AgentDefinition>({
    name: agent.name,
    description: agent.description,
    model: agent.model,
    system_prompt: agent.system_prompt,
    skills: agent.skills,
    tools: agent.tools,
  })

  return (
    <TabsRoot defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="configuration">Configuration</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <AgentOverviewTab agent={agent} draft={draft} />
      </TabsContent>
      <TabsContent value="configuration">
        <AgentConfigurationTab agent={agent} onChange={setDraft} />
      </TabsContent>
      <TabsContent value="skills">
        <AgentSkillsTab agent={agent} draft={draft} onChange={setDraft} />
      </TabsContent>
      <TabsContent value="tools">
        <AgentToolsTab agent={agent} draft={draft} onChange={setDraft} />
      </TabsContent>
    </TabsRoot>
  )
}
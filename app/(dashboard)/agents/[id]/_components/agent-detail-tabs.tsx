"use client"

import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AgentOverviewTab } from "@/components/agent/AgentOverviewTab"
import type { Agent } from "@/lib/agents/types"

type AgentDetailTabsProps = {
  agent: Agent
}

export function AgentDetailTabs({ agent }: AgentDetailTabsProps) {
  return (
    <TabsRoot defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="configuration">Configuration</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <AgentOverviewTab agent={agent} />
      </TabsContent>
      <TabsContent value="configuration">
        <h2 className="font-heading text-lg">Configuration Tab — coming in task 054</h2>
      </TabsContent>
      <TabsContent value="skills">
        <h2 className="font-heading text-lg">Skills Tab — coming in task 055</h2>
      </TabsContent>
      <TabsContent value="tools">
        <h2 className="font-heading text-lg">Tools Tab — coming in task 056</h2>
      </TabsContent>
    </TabsRoot>
  )
}
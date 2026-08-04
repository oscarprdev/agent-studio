"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProgressIndicator } from "@/components/agent/wizard/ProgressIndicator"
import { GoalStep } from "@/components/agent/wizard/GoalStep"
import { ToolsStep } from "@/components/agent/wizard/ToolsStep"
import { SkillsStep } from "@/components/agent/wizard/SkillsStep"
import { ContextStep } from "@/components/agent/wizard/ContextStep"
import { GenerateStep } from "@/components/agent/wizard/GenerateStep"
import { generateAgent } from "@/lib/ai/generate-agent"
import * as store from "@/lib/agents/store"
import type { Agent, Tool, WizardState } from "@/lib/agents/types"

const TOOL_MAP: Record<string, Tool> = {
  github: { id: "github", name: "GitHub", description: "Access repositories, create issues, manage pull requests", category: "development" },
  linear: { id: "linear", name: "Linear", description: "Manage projects, create and update issues", category: "project-management" },
  notion: { id: "notion", name: "Notion", description: "Read and write to Notion pages and databases", category: "project-management" },
  slack: { id: "slack", name: "Slack", description: "Send messages, search channels", category: "communication" },
  jira: { id: "jira", name: "Jira", description: "Create and manage issues, sprints, and boards", category: "project-management" },
  figma: { id: "figma", name: "Figma", description: "Access design files and inspect components", category: "design" },
  docker: { id: "docker", name: "Docker", description: "Manage containers, images, and compose files", category: "development" },
  aws: { id: "aws", name: "AWS", description: "Interact with AWS services", category: "cloud" },
  gcp: { id: "gcp", name: "GCP", description: "Access Google Cloud services", category: "cloud" },
  azure: { id: "azure", name: "Azure", description: "Manage Azure resources and deployments", category: "cloud" },
}

interface AgentWizardProps {
  onSave?: (agent: Agent) => void
}

export function AgentWizard({ onSave }: AgentWizardProps) {
  const router = useRouter()
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    goal: "",
    selectedTools: [],
    skills: [],
    context: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const { currentStep } = state

  function isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return state.goal.trim().length > 0
      case 1:
      case 2:
      case 3:
        return true
      default:
        return true
    }
  }

  function handleNext() {
    if (currentStep < 4 && isStepValid(currentStep)) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }))
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }))
    }
  }

  function handleStepClick(step: number) {
    if (step < currentStep) {
      setState((prev) => ({ ...prev, currentStep: step }))
    }
  }

  async function handleGenerate() {
    if (isGenerating) return
    setIsGenerating(true)
    try {
      const tools = state.selectedTools
        .map((id) => TOOL_MAP[id])
        .filter((t): t is Tool => t !== undefined)
      const result = await generateAgent({
        goal: state.goal,
        tools,
        skills: state.skills,
        context: state.context,
      })
      setState((prev) => ({
        ...prev,
        generatedAgent: {
          ...result,
          id: crypto.randomUUID(),
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }))
    } finally {
      setIsGenerating(false)
    }
  }

  function handleSave() {
    if (!state.generatedAgent) return
    const agent = store.create({
      name: state.generatedAgent.name,
      description: state.generatedAgent.description,
      model: state.generatedAgent.model,
      system_prompt: state.generatedAgent.system_prompt,
      skills: state.generatedAgent.skills,
      tools: state.generatedAgent.tools,
    })
    onSave?.(agent)
    router.push("/agents")
  }

  function handleToolToggle(toolId: string) {
    setState((prev) => ({
      ...prev,
      selectedTools: prev.selectedTools.includes(toolId)
        ? prev.selectedTools.filter((id) => id !== toolId)
        : [...prev.selectedTools, toolId],
    }))
  }

  function handleSkillAdd(skill: WizardState["skills"][number]) {
    setState((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
  }

  function handleSkillRemove(skillId: string) {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== skillId),
    }))
  }

  function handleReset() {
    setState({
      currentStep: 0,
      goal: "",
      selectedTools: [],
      skills: [],
      context: "",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <Separator />

      <div className="min-h-[300px]">
        {currentStep === 0 && (
          <GoalStep
            value={state.goal}
            onChange={(goal) => setState((prev) => ({ ...prev, goal }))}
          />
        )}
        {currentStep === 1 && (
          <ToolsStep
            selectedTools={state.selectedTools}
            onToggle={handleToolToggle}
          />
        )}
        {currentStep === 2 && (
          <SkillsStep
            skills={state.skills}
            onAdd={handleSkillAdd}
            onRemove={handleSkillRemove}
          />
        )}
        {currentStep === 3 && (
          <ContextStep
            value={state.context}
            onChange={(context) => setState((prev) => ({ ...prev, context }))}
          />
        )}
        {currentStep === 4 && (
          <GenerateStep
            wizardState={state}
            onGenerate={handleGenerate}
            onSave={handleSave}
            isGenerating={isGenerating}
            generatedAgent={state.generatedAgent}
          />
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(currentStep === 4 && state.generatedAgent) ? (
            <Button variant="outline" onClick={handleReset}>
              Discard
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
          )}
        </div>

        {currentStep < 4 && (
          <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

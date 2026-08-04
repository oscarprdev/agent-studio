"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface ToolCandidate {
  id: string
  name: string
  description: string
  category: string
  icon?: string
}

const TOOL_CANDIDATES: ToolCandidate[] = [
  {
    id: "github",
    name: "GitHub",
    description:
      "Access repositories, create issues, manage pull requests, and interact with GitHub Actions workflows.",
    category: "development",
  },
  {
    id: "linear",
    name: "Linear",
    description:
      "Manage projects, create and update issues, track progress, and organize work in Linear.",
    category: "project-management",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Read and write to Notion pages, databases, and documents for knowledge management.",
    category: "project-management",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Send messages, search channels, and interact with Slack workspaces for team communication.",
    category: "communication",
  },
  {
    id: "jira",
    name: "Jira",
    description:
      "Create and manage issues, sprints, and boards in Jira for agile project tracking.",
    category: "project-management",
  },
  {
    id: "figma",
    name: "Figma",
    description:
      "Access design files, inspect components, and extract design tokens from Figma.",
    category: "design",
  },
  {
    id: "docker",
    name: "Docker",
    description:
      "Manage containers, images, and compose files for development and deployment workflows.",
    category: "development",
  },
  {
    id: "aws",
    name: "AWS",
    description:
      "Interact with AWS services including S3, Lambda, EC2, and CloudFormation for cloud infrastructure.",
    category: "cloud",
  },
  {
    id: "gcp",
    name: "GCP",
    description:
      "Access Google Cloud services like BigQuery, Cloud Run, and GCS for cloud operations.",
    category: "cloud",
  },
  {
    id: "azure",
    name: "Azure",
    description:
      "Manage Azure resources, deploy to App Service, and interact with Azure DevOps pipelines.",
    category: "cloud",
  },
]

interface ToolsStepProps {
  selectedTools: string[]
  onToggle: (toolId: string) => void
}

export function ToolsStep({ selectedTools, onToggle }: ToolsStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOL_CANDIDATES.map((tool) => {
          const isSelected = selectedTools.includes(tool.id)

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToggle(tool.id)}
              className={cn(
                "rounded-xl text-left transition-colors ring-1 ring-foreground/10",
                isSelected
                  ? "bg-primary/10 ring-primary"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              <Card
                className={cn(
                  "border-0 shadow-none",
                  isSelected && "bg-transparent"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tool.name}</CardTitle>
                    {isSelected && (
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3.5" />
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {tool.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}

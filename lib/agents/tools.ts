import type { Tool } from "./types";

export const TOOL_CANDIDATES: Tool[] = [
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
];

export const TOOL_MAP: Record<string, Tool> = Object.fromEntries(
  TOOL_CANDIDATES.map((t) => [t.id, t])
);

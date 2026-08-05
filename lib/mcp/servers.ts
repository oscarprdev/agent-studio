import type { McpServerDefinition } from "./types";
import {
  GitBranchIcon,
  CircleDotIcon,
  SquareIcon,
  MessageCircleIcon,
  FolderIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";

export const MCP_SERVERS = [
  {
    type: "github",
    name: "GitHub",
    description: "Access GitHub repositories, issues, and pull requests",
    icon: "GitBranchIcon",
    credentials: [
      { key: "apiKey", label: "API Key", placeholder: "ghp_...", type: "password" },
    ],
  },
  {
    type: "linear",
    name: "Linear",
    description: "Manage issues and projects in Linear",
    icon: "CircleDotIcon",
    credentials: [
      { key: "apiKey", label: "API Key", placeholder: "lin_api_...", type: "password" },
    ],
  },
  {
    type: "notion",
    name: "Notion",
    description: "Access Notion pages and databases",
    icon: "SquareIcon",
    credentials: [
      { key: "apiKey", label: "API Key", placeholder: "secret_...", type: "password" },
    ],
  },
  {
    type: "slack",
    name: "Slack",
    description: "Send messages and manage Slack workspaces",
    icon: "MessageCircleIcon",
    credentials: [
      { key: "apiKey", label: "API Key", placeholder: "xoxb-...", type: "password" },
    ],
  },
  {
    type: "filesystem",
    name: "Filesystem",
    description: "Read and write files on the local filesystem",
    icon: "FolderIcon",
    credentials: [
      { key: "path", label: "Path", placeholder: "/path/to/directory", type: "text" },
    ],
  },
  {
    type: "web-search",
    name: "Web Search",
    description: "Search the web for information",
    icon: "SearchIcon",
    credentials: [
      { key: "apiKey", label: "API Key", placeholder: "sk-...", type: "password" },
    ],
  },
] as const satisfies McpServerDefinition[];

const ICON_MAP: Record<string, LucideIcon> = {
  GitBranchIcon,
  CircleDotIcon,
  SquareIcon,
  MessageCircleIcon,
  FolderIcon,
  SearchIcon,
};

export function getServerDefinition(
  type: string,
): McpServerDefinition | null {
  return MCP_SERVERS.find((s) => s.type === type) ?? null;
}

export function getServerIcon(type: string): LucideIcon | null {
  const server = getServerDefinition(type);
  if (!server) return null;
  return ICON_MAP[server.icon] ?? null;
}

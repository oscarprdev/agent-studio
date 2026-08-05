# Task 002: Create MCP Server Definitions Registry

## Context

The server definitions registry is the static source of truth for available MCP servers and their required credentials. It feeds the server picker UI and config form. This depends only on the types created in Task 001.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 2: Create MCP Server Definitions Registry**
- **Scope In**: MCP server definitions registry (`lib/mcp/servers.ts`)

## Implementation Steps

1. Create `lib/mcp/servers.ts`
2. Define `MCP_SERVERS` as a `readonly McpServerDefinition[]` array containing exactly 6 predefined servers:
   - **GitHub** — icon: `GithubIcon`, credentials: `apiKey` (label: "API Key", type: "password")
   - **Linear** — icon: `CircleDotIcon`, credentials: `apiKey` (label: "API Key", type: "password")
   - **Notion** — icon: `SquareIcon`, credentials: `apiKey` (label: "API Key", type: "password")
   - **Slack** — icon: `MessageCircleIcon`, credentials: `apiKey` (label: "API Key", type: "password")
   - **Filesystem** — icon: `FolderIcon`, credentials: `path` (label: "Path", type: "text")
   - **Web Search** — icon: `SearchIcon`, credentials: `apiKey` (label: "API Key", type: "password")
3. Define `getServerDefinition(type: string): McpServerDefinition | null` — finds by `.type` property, returns null if not found
4. Define `getServerIcon(type: string)` — maps type string to the corresponding lucide icon component (imported dynamically)
5. Export `MCP_SERVERS` and both helper functions

## Acceptance Criteria

- [ ] `lib/mcp/servers.ts` exports `MCP_SERVERS` (readonly array of 6 server definitions)
- [ ] `getServerDefinition("github")` returns the correct definition for GitHub
- [ ] `getServerDefinition("nonexistent")` returns `null`
- [ ] Each server definition includes correct `type`, `name`, `description`, `icon`, and `credentials`
- [ ] `MCP_SERVERS` is the only source of truth (no hardcoded server logic elsewhere)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `lib/mcp/servers.ts` — Static server definitions registry (new file, ~80 lines)

## Dependencies

- Task 001 (entity types must exist)
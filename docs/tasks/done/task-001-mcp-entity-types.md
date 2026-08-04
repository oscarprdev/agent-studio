# Task 001: Create MCP Entity Type Definitions

## Context

This task establishes the type contracts that every other MCP task depends on. The types mirror the patterns from `lib/prompts/types.ts` and define the domain model for MCP connections and server definitions used throughout the feature.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **E — Entities** (`McpConnection`, `McpServerDefinition`, `CredentialField`)
- **Operation 1: Create MCP Types**

## Implementation Steps

1. Create `lib/mcp/` directory
2. Create `lib/mcp/types.ts` with the following exports:
   - `CredentialField` interface: `key`, `label`, `placeholder`, `type` ("text" | "password")
   - `McpServerDefinition` interface: `type`, `name`, `description`, `icon` (lucide icon name string), `credentials` (array of `CredentialField`)
   - `McpConnection` interface: `id` (string, `crypto.randomUUID()`), `name`, `type`, `description` (from server definition), `status` ("connected" | "disconnected" | "error"), `config` (Record<string, string>), `lastTestedAt` (string | null, ISO timestamp), `createdAt` (ISO timestamp), `updatedAt` (ISO timestamp)
   - `McpConnectionStatus` type union: `"connected" | "disconnected" | "error"`
   - `CreateMcpConnectionInput` type: subset of `McpConnection` suitable for creation (omit `id`, `status`, `lastTestedAt`, `createdAt`, `updatedAt`)
3. Use consistent naming: `lib/prompts/types.ts` is the reference pattern
4. No implementation logic — pure TypeScript interfaces/types only

## Acceptance Criteria

- [ ] `lib/mcp/types.ts` exists and exports all five types: `CredentialField`, `McpServerDefinition`, `McpConnection`, `McpConnectionStatus`, `CreateMcpConnectionInput`
- [ ] `McpConnectionStatus` is exactly the union: `"connected" | "disconnected" | "error"`
- [ ] `McpConnection.config` is typed as `Record<string, string>`
- [ ] `McpConnection.lastTestedAt` allows `null`
- [ ] `CreateMcpConnectionInput` excludes all auto-generated fields (`id`, `status`, `lastTestedAt`, `createdAt`, `updatedAt`)
- [ ] `McpServerDefinition.icon` is a string (lucide icon name)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `lib/mcp/types.ts` — Entity type definitions (new file, ~25 lines)

## Dependencies

None. This is the foundation task.
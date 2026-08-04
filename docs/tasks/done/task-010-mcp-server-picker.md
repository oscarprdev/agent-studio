# Task 010: Create MCP Server Picker Component

## Context

The server picker is a component inside the Add Sheet that lets users choose which MCP server type to connect. It filters out already-connected server types and highlights the selected option. This is a pure presentational component with a selection callback.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 7: Create MCP Server Picker**

## Implementation Steps

1. Create `components/mcp/McpServerPicker.tsx`
2. Component accepts three props:
   - `selectedType: string | null` — currently selected server type (or null)
   - `onSelect: (type: string) => void` — callback when a server is selected
   - `excludedTypes: string[]` — server types already connected (to filter out)
3. Import `MCP_SERVERS` from `lib/mcp/servers`
4. Filter out servers whose type is in `excludedTypes`
5. Render each available server as a clickable card option:
   - Each option displays: server icon (from `getServerIcon`), name, description
   - Selected option gets visual highlight (`border-primary` or `bg-accent`)
   - Use shadcn `Card` component for each server option (for consistency with PromptCard)
6. When a server card is clicked, call `onSelect(type)`
7. If the filtered list is empty (all servers connected), show "All servers connected" message
8. Make the component `"use client"`

## Acceptance Criteria

- [ ] `components/mcp/McpServerPicker.tsx` exists as a `"use client"` component
- [ ] Accepts `selectedType`, `onSelect`, and `excludedTypes` props
- [ ] Filters out server types present in `excludedTypes`
- [ ] Each server option shows icon, name, and description
- [ ] Selected server type gets visual highlight (border or background)
- [ ] Clicking a server option calls `onSelect` with the server type string
- [ ] Empty list after filtering shows "All servers connected" message
- [ ] Uses shadcn `Card` component for each option
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpServerPicker.tsx` — Server type picker component (new file, ~55 lines)

## Dependencies

- Task 002 (server definitions registry with `MCP_SERVERS` and `getServerIcon`)
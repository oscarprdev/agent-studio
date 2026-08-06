# Task 056 — Tools Tab

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Tools tab: catalog-backed tool picker from TOOL_CANDIDATES with add/remove"
- Acceptance Criteria: "Catalog-backed tool picker from TOOL_CANDIDATES"
- Operations: "Add/remove tools"
- Structure: "Create `components/agent/AgentToolsTab.tsx`"

---

## Description

Implement the **Tools** tab with a catalog-backed tool picker and add/remove capability:

1. **Tool catalog display** — render all tools from `TOOL_CANDIDATES` (defined in `lib/agents/tools.ts`) as selectable cards or list items, each showing the tool's name, description, and category as a badge
2. **Add tool** — clicking/selecting a tool from the catalog adds its full `Tool` object to the draft `tools` array
3. **Remove tool** — removing an existing tool from the draft array
4. **Selected state** — tools already assigned to the agent render as "selected" / highlighted in the catalog

Adding/removing tools operates on draft state only and persists through the global Save action.

---

## Acceptance Criteria

- The Tools tab renders inside the tab layout in the detail page
- All 10 tools from `TOOL_CANDIDATES` display in a grid or list layout with name, description, and category badge
- Tools already assigned to the agent are highlighted/marked as selected in the catalog
- Clicking a non-selected tool card adds it to the draft (no separate "add" button needed — card is the add trigger)
- Clicking a selected tool card removes it from the draft (toggle behavior)
- Each tool also has a dedicated remove button on the "assigned tools" list section
- Adding a tool: adds the complete `Tool` object from `TOOL_CANDIDATES`, not just the ID
- Adding a tool: rejects if the tool's `id` is already in the draft (dedup — toggle behavior handles this but add a guard)
- When the agent has tools, a brief "Assigned Tools" section above the catalog shows them as badges or cards with remove
- When the agent has no tools, show "No tools assigned. Select tools from the catalog below."
- The tools count badge in the Overview tab updates to reflect the draft count
- `npm run lint` and `npm run build` pass

---

## Out of Scope

- Saving tools to the store (handled by the Save action)
- Editing an existing tool's properties
- Tool-specific configuration or parameter settings
- Searching or filtering the tool catalog
- Custom tool addition (only catalog tools)

---

## Domain

### Tool Catalog Integration

`TOOL_CANDIDATES` in `lib/agents/tools.ts` is the authoritative tool catalog. Each entry is a `Tool { id, name, description, category, icon? }`. When a tool is assigned to an agent, the full catalog object is stored — not just the ID.

The wizard already uses this catalog implicitly through `selectedTools` strings. The detail view stores and displays the full `Tool` objects, making the tools tab a richer experience than the wizard's string-based selection.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentToolsTab.tsx` |

---

## Implementation Notes

### Draft state integration

```ts
interface AgentToolsTabProps {
  agent: Agent
  draft: AgentDefinition
  onChange: (draft: AgentDefinition) => void
}
```

### Tool selection logic

```ts
// Toggle a tool on/off
function handleToggleTool(toolId: string) {
  if (draft.tools.some((t) => t.id === toolId)) {
    // Remove
    onChange({ ...draft, tools: draft.tools.filter((t) => t.id !== toolId) })
  } else {
    // Add — find complete Tool from catalog
    const catalogTool = TOOL_CANDIDATES.find((t) => t.id === toolId)
    if (catalogTool) {
      onChange({ ...draft, tools: [...draft.tools, catalogTool] })
    }
  }
}
```

### Catalog card rendering

Each tool card should display:
- Tool name (heading)
- Description (body text)
- Category badge (e.g., "development", "cloud", "project-management")
- Selected state visual indicator (border color change, background tint, or checkmark)

### Layout

- **Assigned tools section** (if any) at the top: badges or small cards with remove buttons
- **Catalog grid** below: all 10 tool cards in a responsive grid

### Use existing patterns

- Import `TOOL_CANDIDATES`, `TOOL_MAP` from `@/lib/agents/tools`
- Use existing shadcn `Badge` for category labels
- Use existing `Card` component for tool cards
- Grid: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`

### Category badge colors

Optionally assign a semantic color by category:

```
development → blue
cloud → emerald
project-management → purple
communication → amber
design → pink
```

This matches the base-nova semantic color token convention from the shadcn skill.
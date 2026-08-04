# Task 012: Create MCP Add Sheet Component

## Context

The Add Sheet is a side panel (Sheet) that orchestrates the two-step add flow: first select a server type, then fill credentials. It coordinates between `McpServerPicker`, `McpConfigForm`, and the storage layer. This is the most complex component in the MCP feature as it has state management and business logic.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 6: Create MCP Add Sheet**
- **Approach**: "Sheet vs. Separate Page for Add Flow — Sheet (chosen)"

## Implementation Steps

1. Create `components/mcp/McpAddSheet.tsx`
2. Component accepts one prop: `open: boolean`
3. Make the component `"use client"`
4. Imports:
   - `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetClose` from `@/components/ui/sheet`
   - `McpServerPicker` from `./McpServerPicker`
   - `McpConfigForm` from `./McpConfigForm`
   - `getAll` from `lib/mcp/store`
   - `create` from `lib/mcp/store`
   - `MCP_SERVERS`, `getServerDefinition` from `lib/mcp/servers`
5. Internal state:
   - `step: "select" | "configure"` — tracks whether on step 1 (select) or step 2 (configure)
   - `selectedType: string | null` — the selected server type
   - `config: Record<string, string>` — credential values collected in step 2
   - `isSubmitting: boolean` — for loading state
6. Step 1: Render `McpServerPicker` with:
   - `selectedType` and `onSelect` callback
   - `excludedTypes` computed from `getAll()` mapped to their `.type`
7. When server is selected:
   - Set `selectedType` to selected type
   - Set step to `"configure"`
   - Initialize `config` with empty strings for each credential field
8. Step 2: Render `McpConfigForm` with:
   - `serverType={selectedType}`
   - `onSubmit` that validates all fields are filled, calls `store.create()`, shows success toast, resets state, and closes sheet
   - `onBack` that goes back to step 1
9. On successful creation:
   - Call `onConnectionAdded` callback (passed as prop)
   - Close the sheet (reset to initial state)
10. "Back" button in step 2 returns to server selection
11. Handle the case where all server types are already connected: show "All MCP servers connected" message
12. Use the shadcn `Sheet` component with `side="right"` (default)

## Acceptance Criteria

- [ ] `components/mcp/McpAddSheet.tsx` exists as a `"use client"` component
- [ ] Accepts `open: boolean` prop
- [ ] Uses shadcn `Sheet` component with `SheetContent`, `SheetHeader`, `SheetTitle`
- [ ] Manages internal state for step (select → configure)
- [ ] Step 1 renders `McpServerPicker` with excluded types filtered from already-connected connections
- [ ] Step 2 renders `McpConfigForm` based on selected server type
- [ ] On form submit: validates all fields filled, calls `create()` from store, shows toast on success
- [ ] On successful creation: resets internal state and closes sheet
- [ ] "Back" button returns to server selection step
- [ ] When all server types are connected: shows "All MCP servers connected" message
- [ ] Uses SidePanel pattern consistent with existing app architecture
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpAddSheet.tsx` — Add connection side panel (new file, ~100 lines)

## Dependencies

- Task 003 (storage layer with `create()` and `getAll()`)
- Task 010 (server picker component)
- Task 011 (config form component)
- Task 002 (server definitions)
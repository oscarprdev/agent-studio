# Task 008: Create MCP Status Badge Component

## Context

The status badge is a small presentational component used inside the MCP card and the detail view. It maps connection status to colors and labels. This is a standalone UI component with no business logic.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 4: Create MCP Status Badge Component**

## Implementation Steps

1. Create `components/mcp/` directory
2. Create `components/mcp/McpStatusBadge.tsx`
3. Component accepts a single `status` prop of type `McpConnectionStatus`
4. Map status to badge variant and visual label:
   - `"connected"` → green dot (`bg-emerald-500` circle) + "Connected" text, use `secondary` badge variant or custom green styling
   - `"disconnected"` → amber dot (`bg-amber-500` circle) + "Disconnected" text
   - `"error"` → red dot (`bg-red-500` circle) + "Error" text
5. Use the shadcn `Badge` component from `@/components/ui/badge`
6. Add a small colored dot indicator before the label text (use a `<span>` with `size-2 rounded-full` and the appropriate bg color)
7. Unknown status → default to "Unknown" with muted styling
8. Make the component `"use client"` (standard for shadcn UI components)

## Acceptance Criteria

- [ ] `components/mcp/McpStatusBadge.tsx` exists and is a `"use client"` component
- [ ] Accepts a `status: McpConnectionStatus` prop (or a string-compatible status value)
- [ ] `"connected"` renders a green dot + "Connected" text
- [ ] `"disconnected"` renders an amber dot + "Disconnected" text
- [ ] `"error"` renders a red dot + "Error" text
- [ ] Unknown status renders "Unknown" with muted styling (no crash)
- [ ] Uses shadcn `Badge` component from `@/components/ui/badge`
- [ ] Dot uses semantic color tokens: `bg-emerald-500`, `bg-amber-500`, `bg-red-500`
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpStatusBadge.tsx` — Status badge component (new file, ~50 lines)

## Dependencies

- Task 001 (entity types must exist)
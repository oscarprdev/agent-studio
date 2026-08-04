# Task 014: Replace MCP List Page

## Context

This task replaces the "Coming soon" stub at `/mcp` with the full MCP connections list page. It follows the exact pattern from `app/(dashboard)/prompts/page.tsx`: client component with lazy state initialization from store, visibility change listener for revalidation, grid of cards, and empty state.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 10: Replace MCP List Page**
- **Where**: `app/(dashboard)/mcp/page.tsx`

## Implementation Steps

1. Open `app/(dashboard)/mcp/page.tsx` (currently a "Coming soon" stub)
2. Make page `"use client"` for state management
3. Import:
   - `useState`, `useEffect` from `react`
   - `getAll`, `remove` from `lib/mcp/store`
   - `McpConnection` from `lib/mcp/types`
   - `McpCard` from `components/mcp/McpCard`
   - `McpAddSheet` from `components/mcp/McpAddSheet`
   - `TopBar` from `components/layout/top-bar`
   - `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` from `@/components/ui/empty`
   - `Button` from `@/components/ui/button`
   - `Link` from `next/link`
4. State management:
   - `connections` state with lazy initializer: `getAll()` from store
   - `showAddSheet` boolean for sheet visibility
   - `useEffect` for visibility change listener (reload from store when tab becomes visible — same pattern as prompts page)
5. Page layout:
   - `TopBar` with title "MCP Connections" and "Add MCP" button in `actions` slot (opens sheet)
   - Main content area with:
     - `<h1>` heading "My MCP Connections"
     - Empty state when no connections (use Empty components)
     - Grid of MCP cards: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`
6. Handle add connection:
   - Pass `onConnectionAdded` callback that re-reads from store and updates state
7. Handle delete connection:
   - `deleteConnection(id)` that calls `remove(id)` from store, then updates state
8. SSR hydration: render null until mounted (same pattern as dashboard layout)

## Acceptance Criteria

- [ ] `app/(dashboard)/mcp/page.tsx` is replaced (no longer "Coming soon" stub)
- [ ] Page is `"use client"`
- [ ] Displays "MCP Connections" in the `TopBar`
- [ ] "Add MCP" button in `TopBar` actions opens the add sheet
- [ ] Connections loaded from store via lazy `useState(getAll)`
- [ ] Visibility change listener refreshes connections when tab becomes visible
- [ ] Empty state shown correctly when no connections (with CTA to add first)
- [ ] Grid layout: `grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`
- [ ] Each connection renders as an `McpCard`
- [ ] Delete handler removes connection from store and refreshes list
- [ ] Add sheet callback refreshes the list after adding
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `app/(dashboard)/mcp/page.tsx` — MCP list page (modify existing stub, ~60 lines)

## Dependencies

- Task 003 (storage layer)
- Task 009 (card component)
- Task 012 (add sheet component)
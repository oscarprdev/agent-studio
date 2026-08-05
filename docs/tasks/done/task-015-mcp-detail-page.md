# Task 015: Create MCP Detail Page

## Context

This task creates the detail/configure page at `/mcp/[id]`. It loads a specific connection by ID, renders the `McpDetail` component, and handles save/delete operations. It mirrors the pattern from `app/(dashboard)/prompts/[id]/page.tsx` with `useParams()` for routing.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 11: Create MCP Detail Page**

## Implementation Steps

1. Create `app/(dashboard)/mcp/[id]/page.tsx`
2. Make page `"use client"`
3. Import:
   - `useState` from `react`
   - `useParams`, `useRouter` from `next/navigation`
   - `getById`, `update`, `remove` from `lib/mcp/store`
   - `McpConnection` from `lib/mcp/types`
   - `McpDetail` from `components/mcp/McpDetail`
   - `TopBar` from `components/layout/top-bar`
   - `toast` from `@/components/ui/toast`
4. State:
   - `connection` state with lazy initializer: `getById(params.id)`
5. Layout:
   - `TopBar` with connection name or "MCP Connection" as title
   - Main content: centered layout with `max-w-3xl` (same as prompt detail page)
   - `McpDetail` component with connection data and callbacks
6. Save handler:
   - Calls `update(id, { config, updatedAt })` from store
   - Updates local state with the updated connection
   - Shows success toast
7. Delete handler:
   - Calls `remove(id)` from store
   - Redirects to `/mcp` using `useRouter()`
   - Shows success toast
8. Connection not found:
   - If `getById` returns null, show "Connection not found" message
   - Or redirect to `/mcp`
9. Invalid ID:
   - Same as not found — show error or redirect
10. Follow the same layout pattern as `prompts/[id]/page.tsx`:
    - `flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8`
    - `flex w-full max-w-3xl flex-col gap-6`

## Acceptance Criteria

- [ ] `app/(dashboard)/mcp/[id]/page.tsx` exists as a new file
- [ ] Page is `"use client"`
- [ ] Uses `useParams()` to extract the connection ID from URL
- [ ] Loads connection from store via `getById(params.id)`
- [ ] TopBar shows connection name or "MCP Connection" as fallback
- [ ] Renders `McpDetail` component with connection data
- [ ] Save handler updates store and shows success toast
- [ ] Delete handler removes from store and redirects to `/mcp`
- [ ] Connection not found shows error or redirects to `/mcp`
- [ ] Layout follows same pattern as `prompts/[id]/page.tsx` (centered, max-w-3xl)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `app/(dashboard)/mcp/[id]/page.tsx` — MCP detail config page (new file, ~50 lines)

## Dependencies

- Task 003 (storage layer with `getById`, `update`, `remove`)
- Task 013 (McpDetail component)
- Task 001 (entity types)
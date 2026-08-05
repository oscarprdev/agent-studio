# Task 009: Create MCP Card Component

## Context

The MCP card is the primary list-item display for each connection. It follows the same pattern as `PromptCard` — card with title, description, status badge, date, and action buttons. Users will click the card to navigate to detail pages and use the delete button to remove connections.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 5: Create MCP Card Component**
- **Where**: `app/(dashboard)/mcp/page.tsx` (grid rendering)

## Implementation Steps

1. Create `components/mcp/McpCard.tsx`
2. Component accepts `connection: McpConnection` and optional `onDelete: (id: string) => void` props
3. Make the component `"use client"`
4. Import and use:
   - `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` from `@/components/ui/card`
   - `Button` from `@/components/ui/button`
   - `Link` from `next/link`
   - `getServerIcon` from `lib/mcp/servers` for the icon
   - `McpStatusBadge` from `./McpStatusBadge`
5. Layout:
   - **CardHeader**: server icon (lucide icon from `getServerIcon`) + connection name as title + `McpStatusBadge`
   - **CardContent**: description truncated with `line-clamp-2` and `text-muted-foreground`
   - **CardFooter**: "Configure" button (Link to `/mcp/[id]`) + "Delete" button
6. Use the existing `formatDate` helper pattern from `PromptCard.tsx` for the "Last tested" timestamp
7. If `lastTestedAt` is null, show "Never tested"
8. Use `Button` with `render={<Link />}` pattern for navigation (matching `PromptCard` exactly)
9. Make the entire card clickable via wrapping the card content in a `Link` or making the card a navigation target
10. Responsive: full width on mobile, card grid on desktop (grid handled by parent page, card just needs to be responsive)

## Acceptance Criteria

- [ ] `components/mcp/McpCard.tsx` exists as a `"use client"` component
- [ ] Displays server icon mapped from type via `getServerIcon`
- [ ] Displays connection name and description (description truncated with `line-clamp-2`)
- [ ] Displays `McpStatusBadge` with current connection status
- [ ] Displays "Last tested" timestamp formatted with `formatDate`, or "Never tested" if null
- [ ] "Configure" button links to `/mcp/[connection.id]`
- [ ] "Delete" button calls onDelete callback with connection ID
- [ ] Uses shadcn `Card` component with `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`
- [ ] Uses `Button` with `render={<Link />}` pattern for Configure button (matching PromptCard)
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpCard.tsx` — MCP connection card component (new file, ~70 lines)

## Dependencies

- Task 001 (entity types)
- Task 002 (server definitions registry with `getServerIcon`)
- Task 008 (McpStatusBadge component)
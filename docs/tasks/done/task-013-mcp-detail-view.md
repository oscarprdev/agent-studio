# Task 013: Create MCP Detail Component

## Context

The MCP Detail component renders an editable configuration view for a single connection. It supports editing credentials, testing the connection (mock), and disconnecting (deleting) the connection. This is the most feature-rich UI component in the MCP feature and includes async operations with loading states.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 9: Create MCP Detail Component**

## Implementation Steps

1. Create `components/mcp/McpDetail.tsx`
2. Component accepts three props:
   - `connection: McpConnection` — the connection to edit
   - `onSave: (config: Record<string, string>) => Promise<void>` — callback to save changes
   - `onDelete: () => Promise<void>` — callback to delete the connection
3. Make the component `"use client"`
4. Imports:
   - `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `CardDescription` from `@/components/ui/card`
   - `FieldGroup`, `Field`, `FieldLabel` from `@/components/ui/field`
   - `Input` from `@/components/ui/input`
   - `Button` from `@/components/ui/button`
   - `Spinner` from `@/components/ui/spinner`
   - `Badge` from `@/components/ui/badge`
   - `McpStatusBadge` from `./McpStatusBadge`
   - `getServerDefinition` from `lib/mcp/servers` (for credential field labels)
5. Header section: server name, description, status badge, and "Last tested" timestamp
6. Configuration section: render an editable form field for each credential stored in the connection:
   - Use `FieldGroup` + `Field` + `FieldLabel` + `Input` pattern
   - Each field label comes from `getServerDefinition`'s credentials metadata
   - Input value bound to local form state
   - Password type for password credentials, text for others
7. Action buttons:
   - **Save Changes**: calls `onSave(configWithUpdates)`, disables during save, shows "Saving..." with Spinner
   - **Test Connection**: calls async mock test (the page will inject a mock test handler), shows "Testing..." with Spinner during test
   - **Disconnect**: triggers AlertDialog confirmation, then calls `onDelete()`
8. Show `Spinner` on each button during its async operation
9. On save success: show success toast
10. On save failure: show error toast
11. Use `AlertDialog` for the disconnect confirmation

## Acceptance Criteria

- [ ] `components/mcp/McpDetail.tsx` exists as a `"use client"` component
- [ ] Accepts `connection`, `onSave`, and `onDelete` props
- [ ] Displays server name, description, `McpStatusBadge`, and "Last tested" timestamp in the header
- [ ] Renders an editable form field per credential from the connection's config
- [ ] Each form field uses FieldGroup + Field + FieldLabel + Input pattern
- [ ] "Save Changes" button calls onSave with updated config, disables during save
- [ ] "Test Connection" button shows loading state during async test
- [ ] "Disconnect" button triggers AlertDialog confirmation before deleting
- [ ] Success/error toasts are shown for save operations
- [ ] Spinner shown on all buttons during async operations
- [ ] Password fields use `type="password"`
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpDetail.tsx` — Connection detail/edit component (new file, ~120 lines)

## Dependencies

- Task 001 (entity types)
- Task 002 (server definitions with credential metadata)
- Task 008 (status badge)
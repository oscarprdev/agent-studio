# Task 011: Create MCP Config Form Component

## Context

The config form captures credential fields required by a chosen MCP server. It renders input fields dynamically based on the server's `credentials` definition and validates that all fields are filled before allowing submission.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 8: Create MCP Config Form**

## Implementation Steps

1. Create `components/mcp/McpConfigForm.tsx`
2. Component accepts three props:
   - `serverType: string` — the MCP server type key
   - `onSubmit: (config: Record<string, string>) => void` — callback with config values
   - `onBack: () => void` — callback to go back to server selection
3. Make the component `"use client"`
4. Look up the server definition via `getServerDefinition(serverType)` from `lib/mcp/servers`
5. If server definition is not found, render an error message
6. Render server name and description as a header
7. For each credential field in the server definition, render a form field:
   - Use the `FieldGroup` + `Field` + `FieldLabel` from `@/components/ui/field`
   - Use `Input` from `@/components/ui/input`
   - Password-type credentials render `<Input type="password" />`
   - Text-type credentials render `<Input type="text" />`
   - Each input's placeholder comes from the credential's `placeholder` field
   - Input name/key uses the credential's `key` field
8. Manage form state: `config` object keyed by credential keys
9. "Connect" button calls `onSubmit(config)` only when all credential fields are filled
10. "Back" button calls `onBack()`
11. Submit button shows a `Spinner` + "Connecting..." text while submitting (controlled via a `isSubmitting` state)
12. Disable the submit button if any field is empty

## Acceptance Criteria

- [ ] `components/mcp/McpConfigForm.tsx` exists as a `"use client"` component
- [ ] Accepts `serverType`, `onSubmit`, and `onBack` props
- [ ] Looks up server definition via `getServerDefinition()` and renders an error if not found
- [ ] Renders server name and description as a header
- [ ] Renders one form field per credential field from the server definition
- [ ] Each form field uses FieldGroup + Field + FieldLabel + Input shadcn components
- [ ] Password credentials use `type="password"` on the Input
- [ ] Text credentials use `type="text"` on the Input
- [ ] Submit button is disabled when any credential field is empty
- [ ] Submit button shows "Connecting..." with Spinner while submitting
- [ ] Back button is present and calls `onBack()`
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `components/mcp/McpConfigForm.tsx` — Credential configuration form (new file, ~70 lines)

## Dependencies

- Task 002 (server definitions registry with `getServerDefinition`)
- Task 001 (entity types for `McpServerDefinition`)
# Task 047-006 — AgentVersionHistory Component

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- O, Operation 5: Render and Compare Versions
  - Steps 1–2: render empty state when no history; label, date, reason; newest first; row action selects a version
- S, Structure — Files To Create: `components/agent/AgentVersionHistory.tsx`
  - "client presentation for the Versions section, list rows, selected-version details, and action callbacks"

---

## Description

Create a standalone client-side component that renders the **Versions section** on the agent detail page. This component receives the current agent, version list, and callback props for actions — it does NOT manage the page's agent state directly.

### Component API

```typescript
type AgentVersionHistoryProps = {
  agent: Agent;
  versions: AgentVersion[];
  selectedVersion: AgentVersion | null;
  onSelectVersion: (version: AgentVersion) => void;
  onClearSelection: () => void;
  onDeleteVersion: (versionId: string) => boolean;
  onRollbackVersion: (versionId: string) => boolean;
}
```

### Layout

The component renders a section with:

1. **Heading**: "Version History"
2. **Empty state** (when `versions.length === 0`):
   - Uses project's `Empty` / `EmptyHeader` / `EmptyTitle` / `EmptyDescription` components
   - "No version history yet. Versions are created automatically when you make meaningful changes."
3. **Version list** (when `versions.length > 0`):
   - Each version shown as a row or card with:
     - **Label** (e.g. `"1.2"`) — displayed prominently
     - **Changed date** — formatted with existing `formatDate` helper (or new if none; format: `toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })`)
     - **Change reason** — displayed if `changeReason` is present; show `"—"` fallback otherwise
     - **Actions**: Compare (primary), Rollback (secondary, with confirmation), Delete (tertiary, with confirmation)
   - Newest versions first (already sorted by store's `getVersions`)
   - Clicking a row selects the version for inline detail view

### Selected Version Detail (inline)

When a version is selected (`selectedVersion` is not `null`), render a collapsible section below the list showing the full snapshot:
- All fields: name, description, model, system_prompt, skills count, tools count, change reason, changed at
- Use existing `Collapsible` / `Card` composition
- Collapsible behavior: open on select, close via "Clear selection" button or clicking outside
- Read-only display (not editable)

### Action Confirmation

- **Delete**: Uses `AlertDialog` (existing installed component). Title: "Delete version"? Description: "This will permanently remove this version snapshot."
- **Rollback**: Uses `AlertDialog`. Title: "Roll back to version X"? Description: "This will restore the agent to this version's configuration. Current unsaved changes will be lost."
- Both actions show toast feedback on success/error

### Style & Composition Rules

- Use `Card` + `CardHeader`/`CardTitle`/`CardContent` for version grouping
- Use `Badge` for version labels
- Use `gap-*` for spacing (never `space-*`)
- Use semantic Button variants: "Compare" = `default` / "Rollback" = `secondary` / "Delete" = `destructive`
- Use `Separator` between sections
- Icons in buttons use `data-icon="inline-start"` — no manual sizing classes
- Dates formatted via existing `formatDate` pattern from `AgentCard` (duplicated inline here for self-sufficiency)

### Toast Feedback

Uses `toast.add({ title, type })` from `@/components/ui/toast`:
- Delete → `"Version deleted"` success / `"Failed to delete version"` error
- Rollback → `"Agent restored"` success / `"Failed to restore version"` error
- Compare: no toast — it just selects the version

### Accessibility

- Each version row is keyboard navigable (button-triggered)
- Dialogs have required `DialogTitle` + `AlertDialogDescription`
- Action buttons have descriptive text (not icon-only for critical actions)
- Empty state is screen-reader friendly via semantic markup

---

## Acceptance Criteria

- `components/agent/AgentVersionHistory.tsx` exists with `"use client"` directive
- Component accepts the defined prop interface
- Renders an empty state when `versions` is empty
- Renders version rows showing label, date, and change reason (with fallback for missing reason)
- Clicking a version row triggers `onSelectVersion`
- "Clear selection" closes the detail view via `onClearSelection`
- Selected version detail shows full snapshot fields as read-only
- Delete button opens an `AlertDialog`; on confirm calls `onDeleteVersion`
- Rollback button opens an `AlertDialog`; on confirm calls `onRollbackVersion`
- Cancel on dialogs does NOT call the callback
- Success toast shown on delete/rollback; error toast on failure
- Uses shadcn/ui composition patterns: `Card`, `Badge`, `Button`, `Collapsible`, `AlertDialog`
- Composes `gap-*` spacing (never `space-*`)
- No barrel imports
- TypeScript compiles cleanly

---

## Out Of Scope

- Compare view (this task is the list + inline detail only; compare view is Task 047-007)
- Integration into the agent detail page (Task 047-007)
- Version creation trigger
- Diff computation (handled by `version-diff.ts`)

---

## Domain

### Why a Separate Component?

The plan (s § A, Approach) prefers extracting focused components rather than making the route page monolithic. The version list has a complete lifecycle (select, compare, delete, rollback, inline detail) that deserves encapsulation. The agent detail page remains responsible for loading versions and coordinating state.

### Inline Detail vs Separate View

The plan mentions "selected-version details" in the component. For MVP, inline collapsible detail keeps the page self-contained and avoids needing a nested route or extra navigation state.

---

## Dependencies

- Task 047-002 (`AgentVersion` type)
- Task 047-003 (store `getVersions`, `deleteVersion`, `rollbackToVersion` functions)
- Task 047-001 (Dialog, Table, Alert UI components)

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentVersionHistory.tsx` |
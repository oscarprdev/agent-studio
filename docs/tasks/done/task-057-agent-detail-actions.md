# Task 057 — Detail Actions

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Save button persists the complete draft", "Duplicate action calls duplicateAgent(id) and navigates", "Delete action: AlertDialog, calls deleteAgent, navigates to /agents"
- Acceptance Criteria: "Export Markdown: download as .md file", "Export JSON: download saved agent as .json", "Test action: preview using AgentOutput component"
- Operations: "Save configuration and memberships", "Export Markdown and JSON", "Duplicate", "Delete", "Test agent"
- Structure: "Add save, duplicate, delete, Markdown export, JSON export, and clarified test action feedback"

---

## Description

Implement the action bar at the bottom of the agent detail page with six actions:

1. **Save** — persists the complete draft (`name`, `description`, `model`, `system_prompt`, `skills`, `tools`) to the store via `store.update()`, refreshes page state, shows success toast
2. **Duplicate** — calls `duplicateAgent(id)`, navigates to the new agent's detail page, shows toast
3. **Delete** — opens an AlertDialog confirmation, calls `deleteAgent(id)` on confirm, navigates to `/agents` on success, shows error on failure
4. **Export Markdown** — downloads the current saved agent as a `.md` file using `exportAgentMarkdown()` from the store
5. **Export JSON** — downloads the saved (not draft) agent as a `.json` file with `JSON.stringify(agent, null, 2)`. If no save has happened yet, prompt the user or disable.
6. **Test** — opens a preview using the existing `AgentOutput` component showing the full draft state (name, description, model, system_prompt, skills, tools)

Save is the most prominent button; the five auxiliary actions are secondary outline buttons.

---

## Acceptance Criteria

### Save
- Clicking Save triggers `store.update(agent.id, fullDraft)` with all six fields
- On success, the page state updates with the returned agent (including new `updatedAt`)
- On success, a success toast is shown
- On failure (e.g. agent removed), an error toast is shown, draft remains visible
- Save button is disabled when `name`, `description`, `model`, or `system_prompt` is empty after trimming

### Duplicate
- Duplicate calls `duplicateAgent(agent.id)` from the store — NOT a manual reconstruct
- After duplication, navigation goes to the new agent's detail route (`/agents/<newId>`)
- On failure, an error toast is shown

### Delete
- Delete opens an AlertDialog with the agent name visible in the confirmation dialog
- AlertDialog warns "This action cannot be undone"
- On confirm, calls `deleteAgent(agent.id)`
- On success, navigates to `/agents`
- On failure, an error toast is shown and the user stays on the detail page
- Cancel in the dialog does nothing

### Export Markdown
- Download triggers a `.md` file using `exportAgentMarkdown(agent.id)` from the store
- Filename is derived from the sanitized agent name (e.g., `my-agent.md`)
- A Blob with `text/markdown` MIME type is created, clicked, and the URL is revoked
- On browser/download failure, no crash — action is silently tolerated

### Export JSON
- Download triggers a `.json` file with `JSON.stringify(agent, null, 2)`
- MIME type is `application/json`
- Filename is derived from the sanitized agent name (e.g., `my-agent.json`)
- Exports the **saved** state, NOT the current draft — if the user has not saved yet, the JSON downloads the currently persisted agent (not the unsaved draft)
- On browser/download failure, no crash

### Test (Preview)
- Test opens a preview panel/view using the existing `AgentOutput` component
- The preview shows the full draft: name, description, model, system_prompt, skills list, tools list
- This is a preview-only action (no AI execution) — must NOT claim "test" means actual execution
- The preview can be a collapsible panel below the action bar or a slide-over

### General
- All actions are in a single row at the bottom of the detail view
- Save is the prominent/default button; other five are outline buttons
- `npm run lint` and `npm run build` pass

---

## Out of Scope

- Saving draft to URL params or localStorage as auto-save
- Real AI execution or tool running (test is preview only)
- Cancel/discard draft action
- Bulk actions on multiple agents
- Undo save action

---

## Domain

### Draft Persistence

The agent detail view uses a draft pattern: changes in tabs are local state until an explicit Save. The Save action atomically writes all six mutable fields through `store.update()`, which preserves `id`, `createdAt`, and `version` while updating `updatedAt`.

### File Downloads

Both markdown and JSON exports use the browser Blob API:

```ts
const blob = new Blob([content], { type: "text/markdown" })
const url = URL.createObjectURL(blob)
const a = document.createElement("a")
a.href = url
a.download = `${sanitizedName}.md`
document.body.appendChild(a)
a.click()
document.body.removeChild(a)
URL.revokeObjectURL(url)
```

JSON exports use the persisted saved agent (not the draft). This is a deliberate design decision: the user must save first to have a "saved agent" to export.

---

## Files

| Action | Path |
|--------|------|
| Modify | `app/(dashboard)/agents/[id]/page.tsx` (action bar in page) |
| Modify | `components/agent/AgentEditor.tsx` (extract action logic, may mark for reduction) |

---

## Implementation Notes

### Component structure

The actions should live in the page component (`[id]/page.tsx`) or as a child component within the page. The page manages the shared draft state and has access to the router for navigation.

```ts
// Page-level action handler
async function handleSave() {
  const updated = await store.update(agent.id, draft)
  if (updated) {
    setAgent(updated)
    toast.add({ title: "Agent saved", type: "success" })
  } else {
    toast.add({ title: "Failed to save agent", type: "error" })
  }
}
```

### Duplicate

Reuse `duplicateAgent(id)` from `@/lib/agents/store` — do NOT manually reconstruct the clone. The store already handles deep copying `skills` and `tools` arrays.

### Delete

Use existing AlertDialog components (the same pattern already used in `AgentCard.tsx`):

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
```

### Export helpers

Wrap the download logic in a reusable helper to avoid duplication:

```ts
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

### Test preview

Reuse the existing `AgentOutput` component and `AgentDefinition` type. The preview shows the draft state so the user can see what their full agent configuration looks like.

### Toast feedback

Use existing toast pattern: `toast.add({ title: "...", type: "success" })` from `@/components/ui/toast`.

### Disabled Save

Save button should be disabled when:
- `name.trim() === ""`
- `description.trim() === ""`
- `model.trim() === ""`
- `system_prompt.trim() === ""`

Check `isValid` in the `disabled` prop of the Save button.

### AgentEditor role after this task

The existing `AgentEditor` component becomes partially obsolete — the edit/preview toggle and configuration fields are moved into the tabs. The file should be reduced to extract the action handlers and markdown export helper, or the actions can live entirely in the page. Either approach is acceptable.
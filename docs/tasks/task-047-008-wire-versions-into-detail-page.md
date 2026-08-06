# Task 047-008 — Wire Version History Into Agent Detail Page

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- Definition of Done #4:
  > "The agent detail page renders a Versions section below `AgentDetailTabs`, including label, changed date, reason, details, compare, and rollback actions."
- O, Operation 5: Render and Compare Versions
  - Full flow: load versions, render section, wire compare, rollback, delete with refresh
- S, Structure — Files To Modify: `app/(dashboard)/agents/[id]/page.tsx`
  - "load versions, render the Versions section below `AgentDetailTabs`, wire compare/delete/rollback actions, refresh local state, and provide toast/error handling"
- S, Safeguards — Performance:
  - "Refresh state directly after mutations"
  - "Compare only the selected version and current agent; do not recompute a diff for every history row"

---

## Description

Update the Agent detail page (`app/(dashboard)/agents/[id]/page.tsx`) to integrate the version history UI. This is the integration task that ties all previous tasks together.

### State to Add

```typescript
// Version state (new)
const [versions, setVersions] = useState<AgentVersion[]>([])
const [selectedVersion, setSelectedVersion] = useState<AgentVersion | null>(null)
const [compareOpen, setCompareOpen] = useState(false)
const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null)
const [rollbackVersionId, setRollbackVersionId] = useState<string | null>(null)
```

### Version Loading

On initial client render (inside `useState` initializer), load existing versions:
```typescript
const [versions, setVersions] = useState<AgentVersion[]>(() => {
  if (!agent) return []
  return store.getVersions(agent.id)
})
```

### Version History Section

Below `AgentDetailTabs` (before the action buttons row), render the `AgentVersionHistory` component:

```tsx
<AgentVersionHistory
  agent={agent}
  versions={versions}
  selectedVersion={selectedVersion}
  onSelectVersion={(v) => {
    setSelectedVersion(v)
    setCompareOpen(true) // opens the compare dialog
  }}
  onClearSelection={() => setSelectedVersion(null)}
  onDeleteVersion={(id) => {
    const ok = store.deleteVersion(agent.id, id)
    if (ok) {
      setVersions(store.getVersions(agent.id))
      if (selectedVersion?.versionId === id) setSelectedVersion(null)
      toast.add({ title: "Version deleted", type: "success" })
    } else {
      toast.add({ title: "Failed to delete version", type: "error" })
    }
    return ok
  }}
  onRollbackVersion={(id) => {
    const restored = store.rollbackToVersion(agent.id, id)
    if (restored) {
      setAgent(restored)
      setVersions(store.getVersions(restored.id))
      setSelectedVersion(null)
      // Also refresh draft to match the restored agent
      setDraft({
        name: restored.name,
        description: restored.description,
        model: restored.model,
        system_prompt: restored.system_prompt,
        skills: restored.skills,
        tools: restored.tools,
      })
      toast.add({ title: "Agent restored", type: "success" })
    } else {
      toast.add({ title: "Failed to restore version", type: "error" })
    }
    return restored !== null
  }}
/>
```

The section should be placed between `AgentDetailTabs` and the action buttons row.

### Compare Integration

When a version is selected (via `onSelectVersion`), open a Dialog containing `AgentVersionCompare`:

```tsx
<Dialog open={compareOpen} onOpenChange={setCompareOpen}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    {agent && selectedVersion && (
      <AgentVersionCompare
        version={selectedVersion}
        current={agent}
        onClose={() => setCompareOpen(false)}
      />
    )}
  </DialogContent>
</Dialog>
```

### Version Auto-Refresh After Save

When the user saves the agent via `handleSave`, refresh the version list:
```typescript
if (updated) {
  setAgent(updated)
  setVersions(store.getVersions(updated.id))  // ← auto-refresh
  toast.add({ title: "Agent saved", type: "success" })
}
```

### Auto-Refresh After Delete

The existing `handleDelete` already navigates away, so no refresh needed.

### Error Handling

- Unknown agent ID → store returns `null`/`[]`, UI shows empty state
- Malformed localStorage → store returns safe empty values, no crash
- Storage quota failure → store returns `null`, toast shows error at the page boundary
- All store failures bubble up as toast notifications (not silent failures at page level)

### UI Constraints

- Use existing button patterns (`size="lg"`, variant conventions)
- Toast uses existing import: `import { toast } from "@/components/ui/toast"`
- No new side effects for state refresh — use event handler callbacks only (plan §O, Performance: "refresh state directly after mutations")
- Compare Dialog only opens when a version is selected (not on page load)
- Version count badge in section heading: "Version History (3)" — update on refresh

---

## Acceptance Criteria

- Import `AgentVersionHistory` from `@/components/agent/AgentVersionHistory`
- Import `AgentVersionCompare` from `@/components/agent/AgentVersionCompare`
- Import `store` functions: `getVersions`, `deleteVersion`, `rollbackToVersion` from `@/lib/agents/store`
- The `AgentVersionHistory` component renders below `AgentDetailTabs`
- The compare Dialog opens when a version row is clicked, shows `AgentVersionCompare` content
- The compare Dialog closes on "Close" button click or Escape key
- Rollback: after `store.rollbackToVersion` succeeds:
  - Current agent state is updated with restored values
  - Draft state is synced with restored agent values
  - Version list is refreshed
  - Dialog closes
  - Success toast shown
- Delete: after `store.deleteVersion` succeeds:
  - Version list is refreshed
  - If the deleted version was selected, selection is cleared
  - Success toast shown
- Cancel on Delete/Rollback dialogs does NOT call the store function
- Save refreshes the version list (`versions` array updates after save)
- Toast error shown on store failure for delete/rollback
- No new `useEffect` calls for state management (state refreshes only in event handlers)
- `npm run build` succeeds after this change

---

## Out Of Scope

- Adding a "Create initial version" button (initial history bootstrap is not implemented — see plan clarifications)
- Version pagination (the MVP only considers small history sets)
- Cross-agent version search
- Any changes to the `AgentDetailTabs` component (Task 047-006/047-007 add the version components separately)

---

## Domain

### Integration Layer

The page component is the integration point. It owns:
- `agent` state (existing)
- `versions` state (new)
- `selectedVersion` state (new)
- UI coordination: opens dialogs, shows toasts, refreshes state
- Store call orchestration: calls `getVersions` after mutations, not during render

### No State Duplication

The `useState` initializer pattern for `versions` reads from the store once on render. After mutations, `store.getVersions()` is called explicitly in event handlers. This avoids stale closures from effects and ensures each render gets fresh data.

### Rollback Refresh Strategy

Rollback updates both the current agent state AND the version list. The version list refresh is critical because a rollback changes `updatedAt` and potentially the agent's field values — these changes may trigger another version (store-level auto-versioning), so the list must be current.

---

## Dependencies

- Task 047-002 (`AgentVersion` type)
- Task 047-003 (store CRUD functions: `getVersions`, `deleteVersion`, `rollbackToVersion`)
- Task 047-004 (auto-version integration in store)
- Task 047-006 (`AgentVersionHistory` component)
- Task 047-007 (`AgentVersionCompare` component)

## Files

| Action | Path |
|--------|------|
| Modify | `app/(dashboard)/agents/[id]/page.tsx` |
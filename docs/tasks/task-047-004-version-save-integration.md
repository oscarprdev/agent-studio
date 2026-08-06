# Task 047-004 — Integrate Versioning Into Agent Save

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- O, Operation 3: Integrate Versioning With Agent Save
  - Steps 1–5: check version count, compare, create pre-update snapshot, persist, preserve immutable fields
  - Exception handling: "a failed version write must prevent the subsequent save from reporting a successful versioned update"
- S, Safeguards — Invariants:
  - "A non-trivial save writes the snapshot before the current agent update"
  - "Name/description-only saves do not add versions; unchanged saves do not add versions"

---

## Description

Modify `lib/agents/store.ts` so that agent saves automatically create version snapshots for non-trivial changes. This provides store-level versioning that protects all existing callers (`saveAgent`, `update`, `duplicateAgent`) from silently bypassing history.

### Two Update Paths

**1. `saveAgent(input)` — update path (has `id`):**

```typescript
// Inside saveAgent's update block (existing hasId branch):
// BEFORE the persist(agents) call:
const prevAgent = agents[index]  // read before mutation
if (isNonTrivialChange(prevAgent, input as Partial<Agent>)) {
  // Only create version if history already has entries
  const versions = readVersions(prevAgent.id)
  if (versions.length > 0) {
    const version = createVersion(prevAgent.id, input as Partial<Agent>)
    if (!version) {
      // Failed to create version — abort the save to avoid history gap
      return null
    }
  }
}
// Then persist the agent (existing behavior)
```

**2. `update(id, updates)`:**

Same pattern — check for non-trivial change, create version if history > 0, then persist.

**3. `saveAgent(input)` — create path (no `id`):**

No version creation. The first version is created by the first non-trivial save on an existing agent.

### Decision: Auto-Version vs Explicit Version

This task implements **store-level auto-versioning**: when `saveAgent` (update path) or `update` detects a non-trivial change AND the agent has existing versions (`versions.length > 0`), it automatically creates a snapshot before persisting the agent update.

This is a **pre-update snapshot** — the version captures the state BEFORE applying the updates, matching plan §O, Operation 1 step: "create the pre-update snapshot with the supplied/default reason before writing the agent."

This means the version snapshot actually captures the *previous* configuration. The user sees a version representing what existed before the change — this is the correct semantic for "version history."

**Important edge case**: If version creation fails, the entire save must be rolled back (return `null`). A failed version write should not result in the agent update succeeding without a trace.

### `changeReason` for Auto-Create

When `saveAgent`/`update` create a version automatically (not via explicit `createVersion`), the `changeReason` defaults to `"Saved"` since the page doesn't pass it.

---

## Acceptance Criteria

- `saveAgent` (update path) automatically creates a version snapshot when:
  - The agent already has versions (`versions.length > 0`)
  - The change is non-trivial (`isNonTrivialChange` returns `true`)
  - The version creation succeeds
- Name/description-only saves do NOT create versions (even when `versions.length > 0`)
- Unchanged saves (identical `before` and `after`) do NOT create versions
- If version creation fails → `saveAgent` returns `null` (save is aborted)
- `update(id, updates)` follows the same auto-version pattern as `saveAgent`
- `saveAgent` (create path) does NOT create a version (first version comes from first non-trivial save)
- `duplicateAgent` does NOT auto-create versions (duplication is a separate operation)
- Existing agent save behavior is preserved (same return contract, same timestamps, same immutable field preservation)
- `npm run build` succeeds after this change

---

## Out Of Scope

- Auto-version on the **first** save (initial history bootstrap — plan clarifies this needs product decision)
- UI integration (Tasks 047-006 / 047-007)
- Diff utilities (Task 047-005)
- The version from `changeReason` input — auto-created versions use default `"Saved"`

---

## Domain

### Rollback Does Not Create Version

When `rollbackToVersion` restores an old configuration, that is NOT considered a "save" by the user — it is a recovery action. The plan's §S, Safeguards states: "rollback preserves the version list and current agent identity/creation timestamp." The implementation does NOT create a snapshot for rollback restores.

### Pre-Update Snapshot

The version is captured BEFORE the agent is mutated. On save, this means: the version snapshot = the PREVIOUS configuration (the one about to be overwritten), not the new one. This is important for correct comparison in the UI — comparing version N against current shows what changed from version N to now.

---

## Dependencies

- Task 047-002 (`AgentVersion` type)
- Task 047-003 (store CRUD functions including `isNonTrivialChange`)

## Files

| Action | Path |
|--------|------|
| Modify | `lib/agents/store.ts` |
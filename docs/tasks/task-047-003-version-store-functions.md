# Task 047-003 — Version Store CRUD Functions

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- O, Operation 1: Create Version Snapshot
- O, Operation 2: Read and Delete Version History
- S, Structure — Files To Modify: `lib/agents/store.ts`
- S, Safeguards — Invariants: version records are immutable, per-agent-scoped

---

## Description

Extend `lib/agents/store.ts` with private helper functions and public CRUD methods for version lifecycle management. All versions are stored in a separate localStorage key per agent:

```
agentstudio:agents:{agentId}:versions
```

### Private Helpers to Add

| Function | Signature | Description |
|----------|-----------|-------------|
| `versionKey` | `(agentId: string) => string` | Resolve the per-agent version storage key |
| `readVersions` | `(agentId: string) => AgentVersion[]` | Safe read from per-agent key, returns `[]` on missing/malformed |
| `persistVersions` | `(agentId: string, versions: AgentVersion[]) => void` | Write to per-agent key, silent fail |
| `generateVersionId` | `() => string` | Returns `crypto.randomUUID()` |
| `nextVersionLabel` | `(versions: AgentVersion[]) => string` | Returns `"1.0"`, `"1.1"`, etc. based on length |
| `isNonTrivialChange` | `(before: Partial<Agent>, after: Partial<Agent>) => boolean` | Detects substantive changes (plan §O, Operation 3) |

### Public Functions to Add

| Function | Signature | Returns | Description |
|----------|-----------|---------|-------------|
| `createVersion` | `(agentId: string, updates: Partial<Agent>, changeReason?: string) => AgentVersion \| null` | Version snapshot | Creates an immutable snapshot before the agent update; saves to version array and returns the version, or null on failure |
| `getVersion` | `(agentId: string, versionId: string) => AgentVersion \| null` | Version or null | Finds version by ID in the agent's version list |
| `getVersions` | `(agentId: string) => AgentVersion[]` | Versions (newest first) | Returns sorted copy, defensive (never mutates caller data) |
| `deleteVersion` | `(agentId: string, versionId: string) => boolean` | Success boolean | Removes the version by ID from the array, persists, returns false if not found |
| `rollbackToVersion` | `(agentId: string, versionId: string) => Agent \| null` | Restored agent | Copies snapshot fields into current agent while preserving `id` and `createdAt`; does NOT create a new version; persists agent |
| `cleanupAgentVersions` | `(agentId: string) => void` | void | Removes the per-agent version key (called during agent deletion) |

### Key Implementation Details

**`isNonTrivialChange` logic** (plan §O, Operation 3, step 2):

A change is non-trivial if any of these differ between `before` and `after`:
- `system_prompt` (string value)
- `model` (string value)
- `tools` — compared by stable `id` + `name`; arrays with same IDs are equal by `JSON.stringify( [...].sort(byId) )` on both sides
- `skills` — compared by stable `id`; arrays with same IDs are equal by `JSON.stringify( [...].sort(byId) )`

A change is trivial (no version) if only `name`, `description`, or nothing changed. The "no change" case also returns trivial.

**Snapshot creation** (plan §O, Operation 1, step 4):

Tools and skills must be deep-cloned (not just spread) — nested arrays must be copied so later agent edits cannot mutate history.

**Error handling**:

- Invalid agentId → return `null`/`false`/`[]` depending on function
- SSR (no `isBrowser()`) → return safe defaults
- Malformed JSON in storage → treat as empty array
- Storage quota failure → silent in `persistVersions`, return `null` for `createVersion`/`rollbackToVersion`

**Version label policy**:

Auto-increment: `n + 1` → `"1.0"` for version 0, `"1.1"` for version 1, etc. The first version (when no versions exist) is `"1.0"`.

---

## Acceptance Criteria

- All seven public functions (`createVersion`, `getVersion`, `getVersions`, `deleteVersion`, `rollbackToVersion`, `cleanupAgentVersions`) are exported from `lib/agents/store.ts`
- Private helpers (`versionKey`, `readVersions`, `persistVersions`, `nextVersionLabel`, `isNonTrivialChange`) exist in the same file (not exported)
- `createVersion("uuid", { system_prompt: "new" })`:
  - Creates a version with unique `versionId`, label `"1.0"`, and current `changedAt` timestamp
  - Persists the version to `agentstudio:agents:{agentId}:versions`
  - Returns the version object with all snapshot fields populated
  - Returns `null` on SSR, invalid id, unknown agent, or storage failure
- `getVersion("uuid", "some-id")` returns the matching version or `null`
- `getVersions("uuid")` returns newest-first (sorted by `changedAt` desc), defensive copy
- `deleteVersion("uuid", "id")` returns `true` when found and removed, `false` when not found
- `rollbackToVersion("uuid", "id")`:
  - Returns the agent with snapshot fields applied
  - Preserves original `id`, `createdAt` from the current agent
  - Updates `updatedAt` to current time
  - Does NOT create a new version snapshot
  - Returns `null` on unknown agent, unknown version, or storage failure
- `cleanupAgentVersions("uuid")` removes the per-agent version storage key
- `isNonTrivialChange`:
  - Returns `true` when `system_prompt`, `model`, tools, or skills changed
  - Returns `false` when only `name` or `description` changed
  - Returns `false` when no fields changed
  - Tools/skills comparison is by stable ID (reorderings are equal if IDs match)
- All functions use safe JSON parsing with try/catch (existing store convention)
- `npm run build` succeeds after this change

---

## Out Of Scope

- Integration with `saveAgent` / `update` (Task 047-004)
- UI components (Tasks 047-006 / 047-007)
- Diff utilities (Task 047-005)
- Auto-versioning on create (the plan states the first non-trivial save creates version `"1.0"`)

---

## Domain

### localStorage Storage Layout

Versions for each agent live in a dedicated key: `agentstudio:agents:{agentId}:versions`. This isolates version data from the main agent array, preventing the base array from growing with history data. Agent deletion must also clean up this per-agent key.

### Immutability Guarantee

Once created, version snapshots are never mutated. The `createVersion` function deep-clones `skills`, `tools`, `system_prompt`, and other mutable fields so later edits cannot affect historical state. The returned array from `getVersions` is also a defensive copy.

### Non-Trivial Change Detection

Only substantive changes (prompt, model, tools, skills) trigger versioning. Name and description edits are considered cosmetic — they update the current agent but don't pollute version history with noise.

---

## Dependencies

- Task 047-002 (`AgentVersion` type must exist first)

## Files

| Action | Path |
|--------|------|
| Modify | `lib/agents/store.ts` |
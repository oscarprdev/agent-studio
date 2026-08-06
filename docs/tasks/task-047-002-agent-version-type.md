# Task 047-002 — Add AgentVersion Type

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant section:

E — Entities → AgentVersion — New

```
Fields: versionId, versionLabel, name, description, system_prompt, model,
        skills, tools, optional context, createdAt, changedAt, optional changeReason.
```

Definition of Done #1:

> `AgentVersion` is exported from `lib/agents/types.ts` with the requested snapshot fields and timestamps.

---

## Description

Add the `AgentVersion` type to the existing `lib/agents/types.ts` file. This type represents an immutable snapshot of an agent's configuration at a point in time.

### Type Definition

```typescript
export interface AgentVersion {
  versionId: string;
  versionLabel: string;
  name: string;
  description: string;
  system_prompt: string;
  model: string;
  skills: Skill[];
  tools: Tool[];
  context?: string;
  createdAt: string;
  changedAt: string;
  changeReason?: string;
}
```

- `versionId` — unique identifier, generated via `crypto.randomUUID()` by the store
- `versionLabel` — auto-incremented string like `"1.0"`, `"1.1"`, `"1.2"` (see decision below)
- `createdAt` — fixed to the creation time (never changes after version creation)
- `changedAt` — same as `createdAt` at creation time (represents the point-in-time of the snapshot)
- `changeReason` — optional user-provided description of what changed; stored if present, `null` if not

### Resolution of Plan Clarifications

**Version label policy** (from plan §R → Clarifications):
- Auto-incremented per-agent: `"1.0"`, `"1.1"`, `"1.2"`, etc.
- The integer part increments only when the version exceeds `"1.0"` (the first version after the initial snapshot)
- Store helper resolves the next label from the existing version count

**`context` field** (from plan §R → Clarifications):
- Added as optional (`?`) — MVP does not require the agent editor to capture context, but snapshots may carry it if the Agent type gains it later

**Initial history policy**:
- The first non-trivial save creates version `"1.0"` (no separate bootstrap needed)
- Name/description-only saves never create a version

---

## Acceptance Criteria

- `AgentVersion` is exported from `lib/agents/types.ts`
- `AgentVersion` has all required fields: `versionId`, `versionLabel`, `name`, `description`, `system_prompt`, `model`, `skills`, `tools`, `createdAt`, `changedAt`
- `context` and `changeReason` are optional (`?`)
- Field types reference existing `Skill[]` and `Tool[]` types from the same file
- No existing type exports are broken (importers of `Tool`, `Skill`, `Agent`, etc. still compile)
- TypeScript `npm run build` succeeds after this change

---

## Out Of Scope

- Store functions for version CRUD (Task 047-003)
- Diff utilities (Task 047-005)
- UI components (Tasks 047-006 / 047-007)
- Any logic for generating version labels (handled in store helper)

---

## Domain

### Type Safety

`AgentVersion` is a **snapshot** — fields represent a point-in-time copy. The types must match `Agent` for common fields (`name`, `description`, `system_prompt`, `model`, `skills`, `tools`) so that casting/cloning between them is type-safe.

### Immovable Contract

This type is the foundation for all version operations. Adding/removing fields later is a breaking change — keep the schema minimal for MVP but structured enough for future fields.

---

## Dependencies

None.

## Files

| Action | Path |
|--------|------|
| Modify | `lib/agents/types.ts` |
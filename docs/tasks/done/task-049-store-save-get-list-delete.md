# Task 049 - Implement saveAgent, getAgent, listAgents, deleteAgent

## Reference

Plan document:

docs/plans/plan-017-agent-storage-layer.md

Relevant sections:

- **D — Definition of Done:** all four function signatures and return conventions
- **Operation: `saveAgent`** (full spec — create-or-update semantics)
- **Operation: `getAgent`** (read by ID, `Agent | null`)
- **Operation: `listAgents`** (read all, `Agent[]`)
- **Operation: `deleteAgent`** (remove, return `boolean`)
- **Structure:** "Implement the new names as aliases/wrappers where semantics are identical, and route new functionality through the canonical operations."
- **Norms:** "Naming: Use the requested camelCase public API names (`saveAgent`, `getAgent`, `listAgents`, `deleteAgent`, `duplicateAgent`, `exportAgentMarkdown`) and preserve existing legacy names for compatibility."

---

## Description

Implement four new public functions in `lib/agents/store.ts`:

- `saveAgent(input)` — create-or-update single endpoint
- `getAgent(id)` — read-by-ID alias to existing `getById`
- `listAgents()` — read-all alias to `getAll`
- `deleteAgent(id)` — remove alias

All four functions **must** use the hardened storage helpers from task-047 and the type from task-048. They route through existing `readAll()` and `persist()` internals to avoid code duplication.

### `saveAgent(input: SaveAgentInput): Agent | null`

Create-or-update endpoint. The presence of an `id` selects update semantics; its absence selects create semantics.

**Create path** (no valid `id`):
1. Read the agent array via `readAll()`.
2. Generate UUID via `crypto.randomUUID()`.
3. Build agent with `version: "1.0.0"` (unconditionally), `createdAt` and `updatedAt` set to `new Date().toISOString()`.
4. Required input fields: `name`, `description`, `model`, `system_prompt`, `skills`, `tools`.
5. Push to array, persist, return agent.
6. If `persist` silently fails (caught internally by `persist()`), still return the generated `Agent` object (matching existing `create` convention: skill store returns object even if localStorage write fails).
7. If `crypto.randomUUID()` throws in some environments, return `null`.

**Update path** (valid `id` present):
1. Read the agent array via `readAll()`.
2. Find by `id` — if not found, return `null`.
3. Deeply spread existing record, then spread input fields over it.
4. Preserve `id` and `createdAt` (immutable). Do NOT allow the input to override them.
5. Set `updatedAt` to `new Date().toISOString()`.
6. Persist and return the updated agent. If persist fails, still return the updated object (matching existing `update` convention — but return `null` since existing `update` returns `null` on persist failure via catch).
7. If the input's optional metadata fields (`version`, `createdAt`) are provided in input, they must NOT override the stored immutable metadata in update mode.

**Edge cases:**
- Empty/undefined input → return `null`.
- Missing required field (`name`, `description`, `model`, `system_prompt`, `skills`, `tools`) → return `null`.
- No valid `id` and storage unavailable → return `null` (SSR-safe).
- Update path with unknown `id` → return `null`.

### `getAgent(id: string): Agent | null`

Simple alias to `getById` with SSR guard. Identical semantics.

- Returns the matching `Agent` or `null`.
- Empty/invalid `id` → `null` (no storage read).
- SSR → `null`.

Implementation: delegate to existing `getById(id)` call.

### `listAgents(): Agent[]`

Alias to `getAll` with SSR guard. Returns all agents or empty array.

- Empty storage → `[]`.
- Malformed JSON → `[]`.
- SSR → `[]`.

Implementation: delegate to existing `getAll()`.

### `deleteAgent(id: string): boolean`

Alias to `remove` with SSR guard. Returns `true` if a record was removed, `false` if not found.

- Empty/invalid `id` → `false` (no storage read).
- Unknown `id` → `false`.
- Unknown `id` must **not** create a record.
- Storage write failure → `false`.
- SSR → `false`.

Implementation: delegate to existing `remove(id)`.

### Backward compatibility

All five existing legacy exports MUST continue to be exported:
```ts
export { getAll, getById, create, update, remove };
```

The new functions and legacy functions coexist. Consumers are not required to migrate.

---

## Files to modify

| File | Action |
|---|---|
| `lib/agents/store.ts` | Add `saveAgent`, `getAgent`, `listAgents`, `deleteAgent` exports + re-export legacy names |
| `lib/agents/types.ts` | Already modified by task-048 to add `SaveAgentInput` |

---

## Acceptance criteria

### `saveAgent`
- [ ] `saveAgent(input)` is exported from `lib/agents/store.ts`.
- [ ] `saveAgent` accepts `SaveAgentInput` type.
- [ ] **Create path**: no `id` → generates UUID, sets `version: "1.0.0"`, sets both timestamps to `new Date().toISOString()`, returns the new agent.
- [ ] **Update path**: `id` present → locates existing, updates mutable fields only, preserves `id` + `createdAt`, refreshes `updatedAt`, returns updated agent.
- [ ] **Update rejects metadata override**: input `version`/`createdAt` are ignored during update.
- [ ] **Create without ID**: does NOT silently upsert — a new agent must be created with freshly generated UUID.
- [ ] **Unknown update ID** returns `null`.
- [ ] **Empty/missing input** returns `null`.
- [ ] **SSR execution** returns `null` (no throw).
- [ ] Return type on write failure: `null` (matches `update` store convention, not the skill store's object-on-failure).
- [ ] Required fields from `CreateAgentInput` are enforced: all 6 fields must be present and non-empty strings/arrays.

### `getAgent`
- [ ] `getAgent(id: string)` is exported.
- [ ] Returns `Agent | null`.
- [ ] Delegates to existing `getById` behavior.
- [ ] Invalid/empty ID → `null` (no storage access).
- [ ] SSR → `null` (no throw).

### `listAgents`
- [ ] `listAgents()` is exported.
- [ ] Returns `Agent[]`.
- [ ] Returns empty array for absent storage, malformed JSON, and SSR.
- [ ] Preserves existing order.

### `deleteAgent`
- [ ] `deleteAgent(id: string)` is exported.
- [ ] Returns `boolean` (true = removed, false = not found/error).
- [ ] Delegates to existing `remove` behavior.
- [ ] Empty/invalid ID → `false`.
- [ ] Unknown ID → `false`.
- [ ] Storage write failure → `false`.
- [ ] SSR → `false` (no throw).

### Compatibility
- [ ] All existing legacy exports (`getAll`, `getById`, `create`, `update`, `remove`) remain in the module.
- [ ] No breaking API changes.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] Existing consumers (`app/(dashboard)/agents/page.tsx`, `app/(dashboard)/agents/[id]/page.tsx`, `components/agent/AgentEditor.tsx`, `components/agent/AgentWizard.tsx`) still compile without modifications.

---

## Out of scope

- `duplicateAgent` (task-050).
- `exportAgentMarkdown` (task-050).
- Dashboard migration (task-050).
- Component or page changes.
- Test runner configuration.

---

## Domain

### Aliasing Pattern

The plan says: "Retain `getAll`, `getById`, `create`, `update`, and `remove` as compatibility exports. Implement the new names as aliases/wrappers where semantics are identical."

For `getAgent`, `listAgents`, and `deleteAgent`, this means they are thin aliases delegating directly to `getById`, `getAll`, and `remove` respectively. The only additional guard they provide is the SSR check before delegating.

`saveAgent` is NOT a simple alias — it's an upsert operation that encapsulates create-or-update branching logic based on whether an `id` is present. It routes through `readAll()` and `persist()` internally to share the hardening from task-047.

### Error Convention

Two conventions coexist in the codebase:
1. **Skill store**: returns the generated object even on localStorage write failure (the object is still "real").
2. **Agent store** (existing `update`): returns `null` on persist failure via catch.

`saveAgent` follows the **agent store convention** (`null` on failure) because it is an agent store addition and must match the established pattern in its own module.

### Immutable Metadata

During updates, `id` and `createdAt` are immutable. The input cannot override these values. This is enforced by explicitly preserving `existing.id` and `existing.createdAt` in the spread:

```ts
const updated: Agent = {
  ...existing,
  ...input,
  id: existing.id,         // never overwrite
  createdAt: existing.createdAt,  // never overwrite
  updatedAt: new Date().toISOString(),  // always refresh
};
```

### Mermaid Graph: saveAgent Decision Flow

```mermaid
flowchart TD
    SA[saveAgent input] --> CHK{Has valid id?}
    CHK -- no: create --> UUID[gen UUID]
    UUID --> TS[set createdAt = updatedAt = now]
    TS --> BUILD[build Agent: name, description, model,\nsystem_prompt, skills, tools,\nversion='1.0.0', metadata]
    BUILD --> PUSH[push to array, persist]
    PUSH --> RETCREATE[return Agent | null]

    CHK -- yes: update --> FIND[find existing by id]
    FIND --> MISS{Found?}
    MISS -- no --> RETNULL[return null]
    MISS -- yes --> SPREAD[spread existing + input\noverride: mutable fields only\npreserve: id, createdAt\nrefresh: updatedAt]
    SPREAD --> SPUSH[push to array, persist]
    SPUSH --> RETUPD[return updated Agent | null]
```
# Plan 017 — Agent Storage Layer (AGE-17)

## Executive Summary

Complete the existing frontend-only agent store rather than introducing a second persistence model. The implementation will retain the repository’s documented `Agent` shape—`system_prompt`, object-based `Skill[]` and `Tool[]`, and string `version`—and add the requested canonical CRUD aliases, duplication, and markdown serialization around the current `localStorage` implementation. The dashboard will use `listAgents()` for its initial agent count. No backend, synchronization, version-history, or new dependency is required.

## Current State Analysis

- `lib/agents/types.ts` already exports `Agent`, `Skill`, `Tool`, `AgentDefinition`, and `CreateAgentInput`. The existing fields match the PRD/documentation conventions, not the issue’s alternate `systemPrompt`, `string[]`, and numeric `version` wording.
- `lib/agents/store.ts` already persists agents under `agentstudio:agents` and implements `getAll`, `getById`, `create`, `update`, and `remove`.
- Existing store behavior uses `crypto.randomUUID()` and ISO timestamps for new agents, preserves `id` and `createdAt` during updates, and returns null/false for missing update/delete targets.
- `readAll()` safely returns an empty array for absent or malformed JSON, but browser-storage availability and write failures need to be handled consistently across the new public operations.
- `app/(dashboard)/dashboard/page.tsx` currently computes its initial stats once with `getAll().length`; the count is already storage-backed but must be switched to the requested `listAgents()` API.
- The agents list, wizard, and editor still use the legacy names (`getAll`, `getById`, `create`, `update`, `remove`) and already contain duplicate/export UI behavior. Preserve those imports for compatibility unless a focused migration is needed; the new functions should be the canonical task-facing API, not a parallel store.
- `lib/skills/store.ts` establishes the project pattern for synchronous localStorage CRUD, null/boolean missing-target results, cloning array fields on duplication, and silent handling of expected storage errors.
- This is a client-only scaffold. `package.json` has `lint` and `build` scripts but no test runner, test files, or testing dependencies.

## R — Requirements

### Problem

The agent domain has partial localStorage CRUD but lacks the task’s stable storage API for save/get/list/delete, duplication, and markdown export. Consumers also need a named list operation for dashboard metrics.

### Definition of Done

- `lib/agents/types.ts` continues to export the documented `Agent` interface and provides any input type needed by `saveAgent` without changing existing field conventions.
- `lib/agents/store.ts` exports `saveAgent`, `getAgent`, `listAgents`, `deleteAgent`, `duplicateAgent`, and `exportAgentMarkdown`.
- Every storage operation uses the exact key `agentstudio:agents` and remains safe when executed during SSR, with empty storage, malformed JSON, unavailable storage, or quota/write failure.
- Saving without an ID creates a UUID-backed agent with `version: "1.0.0"` and matching ISO `createdAt`/`updatedAt`; saving an existing ID updates only mutable fields and refreshes `updatedAt`.
- Duplication preserves the original agent, creates a new UUID and fresh timestamps, appends `" (Copy)"` to the name, and copies nested arrays so later mutation cannot affect the original.
- Markdown export returns a deterministic formatted string containing all documented agent fields, including version and timestamps, plus readable skill and tool details.
- The dashboard’s Agents stat reads `listAgents().length`.
- `npm run build` passes. Run `npm run lint` as an additional regression check even though it is not listed in the acceptance criteria.

### Scope In

- Extend the existing agent types and store.
- Add the dashboard import/API migration.
- Preserve backward-compatible legacy store exports used by existing pages/components.
- Verify current editor/list integrations still compile and operate with the unchanged `Agent` shape.

### Scope Out

- Backend/API/database persistence, authentication scoping, sync, conflict resolution, sharing, marketplace features, or real agent execution.
- Numeric version migration, version history, schema migration, or changing `system_prompt`, `Skill[]`, or `Tool[]` to alternate issue wording.
- Adding a test framework or unrelated UI redesign.

## E — Entities

### Agent — existing, retained

- **Fields:** `id: string`, `name: string`, `description: string`, `model: string`, `system_prompt: string`, `skills: Skill[]`, `tools: Tool[]`, `version: string`, `createdAt: string`, `updatedAt: string`.
- **Relationships:** `skills` references embedded `Skill` objects; `tools` references embedded `Tool` objects. There is no backend identity or external relationship.
- **Domain rules:** IDs are unique UUIDs for newly created records; `createdAt` is immutable after creation; `updatedAt` changes on update; version remains the existing string format; arrays remain object arrays as required by current consumers and PRD documentation.

### SaveAgentInput — new type-level input contract

- **Fields:** Existing definition fields (`name`, `description`, `model`, `system_prompt`, `skills`, `tools`) with optional persisted metadata (`id`, `version`, `createdAt`, `updatedAt`) so the same operation can create or update.
- **Relationships:** Produces or updates one `Agent` record in the storage array.
- **Domain rules:** Presence of a valid existing `id` selects update semantics; absence of `id` selects create semantics. Generated metadata must not be accepted in a way that overrides immutable create/update rules.
- **Compatibility:** Keep `CreateAgentInput` for existing callers. If implementation chooses a function overload instead of exporting this named type, document that `saveAgent` accepts the corresponding union explicitly.

## A — Approach

### Overall strategy

1. Keep `STORAGE_KEY`, `readAll`, and `persist` in `lib/agents/store.ts` as the single storage boundary.
2. Harden the boundary first: guard browser access (`typeof window`/storage availability), parse only arrays, and catch both reads and writes.
3. Implement the six requested functions using the existing CRUD primitives or shared internal read-modify-write helpers, avoiding duplicated serialization logic.
4. Retain `getAll`, `getById`, `create`, `update`, and `remove` as compatibility exports. Implement the new names as aliases/wrappers where semantics are identical, and route new functionality through the canonical operations.
5. Keep markdown generation pure and side-effect free: `exportAgentMarkdown(id)` reads the record and returns `string | null` when the ID is missing.
6. Change only the dashboard’s agent-stat import/call to the new list API. Do not introduce a React store or network fetch; synchronous local reads match the existing architecture.

### Trade-offs and alternatives

- **Wrapper aliases vs. renaming all consumers:** Wrappers minimize churn and avoid breaking existing pages/components. A full migration is unnecessary for this issue and would broaden the change surface.
- **`saveAgent` input shape:** A single input type supporting optional ID provides the requested create-or-update API while retaining `CreateAgentInput` for existing callers. `[NEEDS CLARIFICATION: If the Linear acceptance checker requires an exact `saveAgent(Agent)` signature rather than an optional-ID save input, preserve the same runtime semantics and add a compatible overload.]`
- **Export return vs. browser download:** The store should return markdown text because it is reusable and testable. The existing `AgentEditor` owns browser download behavior and can call this function in a follow-up or same-scope cleanup if desired; AGE-17 does not require changing its UI contract.
- **Storage versioning:** The required key is fixed as `agentstudio:agents`; do not silently change it to a versioned key because that would hide existing agents. `[NEEDS CLARIFICATION: No migration policy is specified for future storage schema versions.]`

## S — Structure

### Files to modify

- `lib/agents/types.ts`
  - Preserve the current exported `Agent`, `Skill`, and `Tool` interfaces.
  - Add the minimal save input type or compatible type alias needed by `saveAgent`.
  - Do not rename fields or alter array/value types.

- `lib/agents/store.ts`
  - Harden storage read/write helpers.
  - Add the six requested public functions.
  - Preserve legacy exports and their current return conventions.
  - Centralize clone/timestamp/markdown formatting logic where practical.

- `app/(dashboard)/dashboard/page.tsx`
  - Replace the agent store import of `getAll` with `listAgents`.
  - Replace the Agents count call with `listAgents().length`.
  - Keep the existing lazy `useState` initialization and other stat counts unchanged.

### Files to verify, not necessarily modify

- `app/(dashboard)/agents/page.tsx` — legacy list/delete aliases remain compatible.
- `app/(dashboard)/agents/[id]/page.tsx` — legacy `getById` remains compatible.
- `components/agent/AgentWizard.tsx` — existing create flow continues to persist agents.
- `components/agent/AgentEditor.tsx` — existing update/duplicate/export UI continues to compile; avoid duplicating a second storage format.
- `lib/agents/tools.ts` — existing `Tool` objects remain valid.

### Files to create

- None beyond the requested plan artifact; `types.ts` and `store.ts` already exist and should be modified in place.

### Dependency changes

- None. Do not add UUID, markdown, download, state-management, or testing packages.

## O — Operations

### Operation: `saveAgent`

**Input:** Save input containing documented agent definition fields and optional persisted metadata/ID.

**Output:** `Agent` on successful create or update; preserve the existing store’s non-throwing behavior for storage failure if that is required by current callers. `[NEEDS CLARIFICATION: Decide whether write failure should return the generated/updated object, `null`, or a result type; match the established create/update convention rather than inventing a new contract.]`

**Steps:**

1. Read the current array through the safe reader.
2. If no ID is supplied, generate a UUID, set version to `"1.0.0"` unless the established create contract explicitly permits another value, set both timestamps to one `toISOString()` value, append, and persist.
3. If an ID is supplied, locate the record; update only supported mutable fields, preserve the existing ID and `createdAt`, retain the existing version unless explicitly supplied by the accepted input contract, set a fresh `updatedAt`, and persist.
4. Return the resulting agent using the same object shape as existing callers.

**Edge cases:** empty/malformed storage, missing ID, unknown ID, duplicate IDs already present, unavailable `crypto.randomUUID`, unavailable localStorage, quota failure, and attempts to overwrite immutable metadata. Unknown update IDs must not create accidental records unless the final contract explicitly defines upsert-by-ID.

### Operation: `getAgent`

**Input:** `id: string`.

**Output:** Matching `Agent | null`.

**Steps:**

1. Return `null` immediately for an empty/invalid ID.
2. Read the safe agent array.
3. Return the first matching record or `null`.

**Edge cases:** SSR, missing storage, malformed JSON, empty ID, and unknown ID return `null` without throwing.

### Operation: `listAgents`

**Input:** None.

**Output:** `Agent[]`.

**Steps:**

1. Read `agentstudio:agents` through the safe reader.
2. Return an empty array when the key is absent, JSON is malformed, or the parsed value is not an array.
3. Preserve stored order and avoid mutating the persisted array during reads.

**Edge cases:** localStorage unavailable, malformed JSON, non-array JSON, and empty storage.

### Operation: `deleteAgent`

**Input:** `id: string`.

**Output:** `boolean`, true only when an existing record was removed.

**Steps:**

1. Return false for an empty/invalid ID.
2. Read the current array and find the target.
3. If absent, return false without writing.
4. Filter the target, persist the new array, and return true only after the write succeeds according to the chosen store error convention.

**Edge cases:** unknown ID, duplicate/corrupt records, malformed storage, storage write failure, and empty storage must not throw or report a successful deletion without persistence.

### Operation: `duplicateAgent`

**Input:** `id: string`.

**Output:** New `Agent | null`.

**Steps:**

1. Read the current array and find the source with `getAgent`-equivalent semantics.
2. Return null if the source does not exist.
3. Create a clone with a new UUID, name `${source.name} (Copy)`, and fresh matching `createdAt`/`updatedAt` timestamps.
4. Preserve the documented content fields and version.
5. Clone `skills` and `tools` arrays (and nested objects as needed to prevent direct array/object aliasing), append the clone, persist, and return it.

**Edge cases:** empty/unknown ID, malformed storage, unavailable UUID generation, storage write failure, and source arrays missing in legacy data. The original must remain unchanged and must never receive the copy’s timestamps or ID.

### Operation: `exportAgentMarkdown`

**Input:** `id: string`.

**Output:** Deterministic markdown `string | null` for a found agent; null when no matching agent exists.

**Steps:**

1. Retrieve the agent through the safe accessor.
2. Return null for missing/invalid IDs or missing records.
3. Serialize, in a stable order, the ID, name, description, model, version, created/updated timestamps, system prompt, tools, and skills.
4. Render empty tools/skills with an explicit `_None_` marker rather than omitting required fields.
5. Render each tool with its stable ID/name/description/category and each skill with its stable ID/name/description/instructions/tools, escaping or fencing multiline content so it remains valid readable markdown.
6. Return text only; leave Blob/download/DOM behavior to the UI layer.

**Edge cases:** missing agent, empty arrays, multiline prompts/instructions/descriptions, markdown-sensitive characters, missing optional icon values, and legacy records with absent nested fields must produce safe readable output without throwing.

### Operation: Dashboard agent count

**Input:** None beyond the existing client component lifecycle.

**Output:** Agents stat card count.

**Steps:**

1. Import `listAgents` from the agent store.
2. Keep the existing lazy initialization so localStorage is read once for the initial render path.
3. Set the Agents count to `listAgents().length`.
4. Leave skills/prompts counts and existing workspace rendering untouched.

**Edge cases:** SSR/localStorage unavailable should result in the store’s empty array and a displayed count of zero; cross-tab refresh behavior remains governed by the existing dashboard pattern. `[NEEDS CLARIFICATION: If the dashboard must live-update while already open after another tab creates an agent, add a storage-event subscription in a separate UI-focused change.]`

### Verification operation

1. Run `npm run lint` and record any pre-existing toolchain failures separately from AGE-17 issues.
2. Run `npm run build`; this is the required acceptance command.
3. In a browser, clear `agentstudio:agents`, create an agent through the wizard, and confirm one persisted record with UUID/timestamps/version.
4. Exercise save/update, get, list, delete, duplicate, and export through the existing UI or a browser console/import harness.
5. Confirm duplicate ID/timestamps/name and that the source is unchanged.
6. Confirm markdown contains every required field and readable tool/skill content, including empty-list output.
7. Replace storage with malformed JSON and confirm list/get/delete/duplicate/export do not throw and list returns an empty array.
8. Confirm dashboard Agents count is zero for empty storage and reflects persisted records after reload.

## N — Norms

- **Naming:** Use the requested camelCase public API names (`saveAgent`, `getAgent`, `listAgents`, `deleteAgent`, `duplicateAgent`, `exportAgentMarkdown`) and preserve existing legacy names for compatibility.
- **Types:** Follow current strict TypeScript conventions and `@/*` imports. Preserve snake_case `system_prompt`, object arrays, and string `version` because the PRD/documentation and current consumers are authoritative.
- **Storage:** Use the constant key `agentstudio:agents`; all access must go through guarded helpers. Do not read localStorage directly in the dashboard beyond the store API.
- **Logging:** Existing stores do not log expected storage failures. Continue silent catches for unavailable/malformed localStorage; do not add console noise.
- **Error handling:** Expected missing IDs and malformed storage return null, false, or empty arrays according to operation semantics. Do not throw from ordinary browser-storage failures.
- **Testing:** No test runner is configured. Use lint, build, and the manual acceptance matrix unless a test harness is provided before implementation.
- **UI conventions:** No new shadcn UI is needed. If the editor is later wired to `exportAgentMarkdown`, retain existing shadcn composition and browser download behavior.
- **Documentation:** Keep this plan as the implementation record; document any resolved save-failure or exact-signature decision in the implementation/PR notes.

## S — Safeguards

- **Invariants:** IDs remain unique for newly generated agents; update never changes an existing ID or `createdAt`; duplicate never mutates its source; all persisted records retain the documented field names and value types.
- **Data integrity:** Use read-modify-write for mutations, persist only validated arrays, and do not claim mutation success when persistence fails. Clone arrays/nested values on duplication to prevent shared references.
- **Compatibility:** Preserve the existing storage key and legacy exports so wizard, list, detail, and editor pages continue to work. Do not migrate or discard existing records.
- **SSR safety:** All localStorage and browser-global access must be guarded because client components can still be pre-rendered; build/render paths must not fail when `window`, `localStorage`, or `crypto.randomUUID` is unavailable.
- **Performance:** Operations are synchronous O(n) array scans, appropriate for the MVP’s local collection. Avoid repeated storage reads inside a single mutation and avoid adding network waterfalls or dependencies.
- **Security:** localStorage is not secure storage and may contain system prompts/tool metadata; do not represent this MVP persistence as confidential or user-isolated. Markdown export must not execute stored content as HTML or code.
- **Export safety:** Treat all stored fields as untrusted text, use fenced blocks for multiline prompt/instruction content where appropriate, and keep export generation pure so downloads remain controlled by the client UI.
- **Scope guard:** Do not add sharing, marketplace, backend sync, conflict resolution, or version history while implementing this storage layer.

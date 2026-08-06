# REASONS: Skills Feature Implementation Plan

## Executive Summary

Skills are already partially represented in this worktree, but the implementation does not match the Phase 1 MVP contract. The current `lib/skills` model is generator-oriented (`input`, nested `content`, and `tags`), while agents still use a separate embedded `Skill` shape. The skills routes, cards, editor, generator, and dashboard count also already exist, so this work is primarily a domain-model alignment and lifecycle integration rather than greenfield route creation.

The implementation should establish one canonical persisted Skill entity, expose it through a localStorage CRUD store, update list/create/edit/delete UX to use that entity, and make the agent wizard select persisted skills while saving wizard-created skills into the same store.

## Reason — Requirements

### Problem

The PRD defines Skill as a first-class reusable capability with `name`, `description`, `instructions`, `tools`, and `created_by`. The current implementation persists a different generator schema and the agent wizard creates ephemeral skills directly in wizard state. This prevents reliable reuse, makes the skills lifecycle inconsistent, and means the dashboard and wizard are not guaranteed to reflect the same source of truth.

### Definition of Done

- `lib/skills/store.ts` persists the canonical Skill shape under a stable localStorage key and supports `getAll`, `getById`, `create`, `update`, and `remove`.
- Skills have typed `Skill` and `CreateSkillInput` definitions in `lib/skills/types.ts`; agent-facing imports no longer define a competing Skill entity.
- `/skills` displays persisted skills in a responsive grid, has an empty state with a create CTA, and revalidates on `visibilitychange`.
- `/skills/new` provides fields for name, description, instructions, and tools; valid submission persists a skill and navigates to `/skills`.
- `/skills/[id]` loads the persisted skill, edits all mutable fields, preserves identity/creation metadata, and handles missing IDs.
- Skill deletion requires confirmation and removes the skill from the store.
- The agent wizard offers persisted skills for selection and persists newly created wizard skills before using them in the generated agent.
- Dashboard Skills count reflects the current store after navigation/refocus, supporting AGE-20.
- `npm run lint` and `npm run build` pass. There is no configured automated test runner.

### Scope In

- Canonical Skill types and localStorage store.
- Skills list, create, edit, and delete lifecycle.
- Existing skill card/editor/generator components that must be adapted to the canonical shape.
- Agent wizard skill catalog and persistence integration.
- Dashboard count refresh where needed.

### Scope Out

- Backend/API/database persistence, synchronization, sharing, marketplace, version history, or permissions.
- New tool-provider infrastructure; reuse the existing `TOOL_CANDIDATES` catalog.
- Replacing the existing mock AI generator with a real provider.
- Full migration/versioning framework for arbitrary legacy localStorage data.

## Exploration — Entities

### Current architecture findings

- `lib/agents/store.ts` is the primary CRUD pattern: localStorage read/persist helpers, UUID and ISO timestamp creation, immutable identity/creation fields on update, and boolean/null failure results.
- `lib/prompts/store.ts` is the closest small CRUD analogue and uses `agentstudio:prompts`; `lib/skills/store.ts` currently follows that shape but stores generator-specific fields.
- `app/(dashboard)/agents/page.tsx` and `prompts/page.tsx` are client list pages using lazy `getAll()` state, `visibilitychange` revalidation, grid cards, and toast-based deletion feedback.
- `/skills`, `/skills/new`, and `/skills/[id]` are present already. They currently depend on the generator model and therefore do not satisfy the requested direct form fields.
- `components/skill/SkillCard.tsx`, `SkillEditor.tsx`, and `SkillGenerator.tsx` are existing skill UI surfaces that must either be adapted or explicitly separated by responsibility.
- `components/agent/wizard/SkillsStep.tsx` currently imports `Skill` from `lib/agents/types`, creates UUID-only in-memory skills, and does not read or write `lib/skills/store.ts`.
- `components/agent/AgentSkillsTab.tsx` repeats the same embedded-skill creation behavior for the agent detail view. It is a related integration point and should be checked for canonical type compatibility, but it is not a separate persistence feature unless required by the chosen model.
- The dashboard already links `Create Skill` to `/skills/new` and reads the skills store for its initial count, but its count is captured once and needs the same refocus refresh pattern as the agent count work.
- Existing tool choices are defined in `lib/agents/tools.ts` as IDs plus display metadata; Skill `tools` should use the existing identifier convention so stored selections can be rendered and validated consistently.

### Canonical Skill entity

```text
Skill {
  id: string
  name: string
  description: string
  instructions: string
  tools: string[]
  created_by: string
  createdAt: string
  updatedAt: string
}
```

`CreateSkillInput` should contain the mutable/domain input fields and should not allow callers to supply `id`, `createdAt`, or `updatedAt`.

### Relationships and domain rules

- A Skill is independent and reusable; an Agent references a snapshot/list of skills for the current MVP rather than owning the Skill lifecycle.
- Skill IDs are generated by the store and are immutable.
- `createdAt` is generated on create and immutable on update; `updatedAt` changes on every successful update.
- Name and description are required based on the existing wizard validation and CRUD conventions; instructions may be empty unless product clarification says otherwise.
- Tool values must be drawn from the existing tool catalog unless the product explicitly allows arbitrary tool names.
- `[NEEDS CLARIFICATION: Define the exact `created_by` value for localStorage MVP—authenticated user ID, email, workspace ID, or a fixed local-user sentinel—and whether it is displayed or editable.]`
- `[NEEDS CLARIFICATION: Decide whether existing generator fields (`input`, `content`, `tags`, `triggers`, `expectedOutput`, and `rules`) must be migrated/preserved or may be discarded when adopting the PRD MVP shape.]`

## Alternatives — Approach

### Recommended strategy

Refactor `lib/skills/types.ts` and `lib/skills/store.ts` to the canonical MVP entity, then adapt the existing skill UI and agent wizard to use that store. Keep the localStorage repository pattern and existing shadcn composition; do not add a state-management dependency or a backend abstraction that the current frontend-only architecture does not use.

Use a shared skill form component only if it reduces duplication without obscuring route-specific behavior. The create and edit pages should remain client components because they use browser storage, hooks, and event handlers.

### Alternatives and trade-offs

- **Keep both generator and CRUD Skill schemas:** rejected as the default because it leaves two incompatible first-class entities and makes agent selection/persistence ambiguous. Retain generator-specific data only if the clarification requires backward compatibility.
- **Store full Tool objects instead of tool IDs:** rejected because the existing wizard stores selected IDs and `TOOL_CANDIDATES` is the catalog. IDs minimize stale duplicated metadata and align with current conventions.
- **Use React context/SWR/Zustand:** rejected for this MVP because all existing stores are direct localStorage helpers and the required visibility revalidation pattern already exists.
- **Keep AI generation as a separate creation mode:** acceptable, but its save adapter must create the canonical Skill and preserve only fields supported by that model; it must not become a second persistence path.

## Steps — Structure and Operations

### File Change List

#### Create

- `docs/plans/plan-001-skills-feature.md` — this implementation plan.
- `[NEEDS CLARIFICATION: Add a dedicated shared skill form component only if the implementation confirms create/edit duplication is substantial.]`

#### Modify

- `lib/skills/types.ts` — replace or migrate generator-specific Skill definitions to the canonical MVP shape; export `Skill` and `CreateSkillInput`.
- `lib/skills/store.ts` — implement/harden browser-safe CRUD, canonical serialization, validation, generated metadata, and immutable fields.
- `app/(dashboard)/skills/page.tsx` — align list rendering, empty/search behavior, visibility refresh, and confirmed deletion with the canonical model.
- `app/(dashboard)/skills/new/page.tsx` — replace generator-only flow or add the required direct CRUD form while preserving any explicitly approved generation flow.
- `app/(dashboard)/skills/[id]/page.tsx` — load and edit all canonical mutable fields, including instructions and tools.
- `components/skill/SkillCard.tsx` — render canonical fields/tools and retain edit/navigation/delete affordances.
- `components/skill/SkillEditor.tsx` — edit canonical fields, use confirmed deletion, and handle store failures.
- `components/skill/SkillGenerator.tsx` — adapt save output to canonical Skill or remove from the direct create route if generation is out of this MVP slice.
- `components/agent/wizard/SkillsStep.tsx` — load persisted skills, select/deselect them, and persist newly authored skills through the skill store.
- `components/agent/AgentWizard.tsx` — wire the updated skill callbacks and ensure generated/saved agents receive canonical selected skills.
- `components/agent/AgentSkillsTab.tsx` — update imports and creation behavior to avoid reintroducing a competing `lib/agents/types.Skill` shape; persist newly created skills if this surface is in scope for reuse.
- `app/(dashboard)/dashboard/page.tsx` — refresh the live skill count on visibility change and keep the quick action route.
- `lib/agents/types.ts` — remove the duplicate Skill interface and import/re-export the canonical type as needed to preserve agent API compatibility.
- `lib/ai/generate-agent.ts` — update Skill imports and generated default skills to the canonical shape; define how generated defaults are persisted before agent save.
- `lib/ai/generate-skill.ts` — adapt generator output type/adapter if the generator remains part of `/skills/new`.

#### Dependencies

- None expected. Reuse existing shadcn components, lucide icons, `crypto.randomUUID`, localStorage, and `TOOL_CANDIDATES`.

### Phase 1 — Normalize the domain and store

1. Decide and document the canonical `created_by` source and legacy-data policy before changing serialization.
2. Define `Skill` and `CreateSkillInput` in `lib/skills/types.ts` with the PRD fields plus existing local metadata.
3. Remove the competing `Skill` declaration from `lib/agents/types.ts`; update imports to reference the canonical type.
4. Make `lib/skills/store.ts` safe for SSR/non-browser calls, matching the agent store's `isBrowser`, parse-failure, and persistence-failure behavior.
5. Implement `getAll`, `getById`, `create`, `update`, and `remove`; preserve ID/creation metadata during updates and validate required fields.
6. Ensure tool values are normalized as copied arrays and are compatible with the existing tool catalog.

### Phase 2 — Implement the Skills CRUD UX

1. Update `SkillCard` to show name, description, tool count/labels, and edit/delete actions using existing Card, Badge, Button, and AlertDialog conventions.
2. Update `/skills` to initialize from `getAll`, revalidate on visibility, show the empty state only when the store is empty, and keep search filtering derived from current state rather than an unrefreshed store read.
3. Build the direct create form at `/skills/new` with `FieldGroup`/`Field`, required name/description inputs, monospace instructions textarea, and tool checkbox/multi-select controls sourced from `TOOL_CANDIDATES`.
4. On submit, trim/validate inputs, call `create`, show success/error feedback, and navigate to `/skills` only after a successful store result.
5. Update `/skills/[id]` and `SkillEditor` to initialize from `getById`, support all mutable fields, show a not-found state, and return to the list after successful deletion.
6. Wrap deletion in an accessible AlertDialog confirmation and ensure failed deletes do not mutate UI state.

### Phase 3 — Integrate the agent wizard and dashboard

1. Change `SkillsStep` to load `getAll()` into local state and present persisted skills as selectable cards/checkboxes.
2. Keep a clearly separated “create skill” form for wizard-only authoring; call `skillsStore.create` on add and add the returned persisted Skill to wizard state.
3. Prevent duplicate selections by stable ID and refresh the catalog after a skill is created elsewhere or the tab regains visibility.
4. Update `AgentWizard` and generation helpers to use the canonical Skill type. Persist generated default skills before they are attached to a generated agent, or explicitly exclude generated defaults from the reusable-store requirement after resolving the product decision.
5. Update `AgentSkillsTab` so any new skill created there follows the same persistence rule, or document that this detail-view form remains embedded-only if that is intentionally out of scope.
6. Add dashboard `visibilitychange` revalidation for all counts or at minimum the Skills count, preserving `/skills/new` quick action behavior.

### Operations

#### `getAll()`

- **Input:** none.
- **Output:** `Skill[]`.
- **Steps:** read the skill storage key; parse JSON; accept only an array; return an empty array for SSR, absent storage, malformed JSON, or storage errors.
- **Edge cases:** invalid records should not crash rendering; `[NEEDS CLARIFICATION: Whether malformed individual records should be filtered/migrated rather than returned.]`

#### `getById(id)`

- **Input:** `id: string`.
- **Output:** `Skill | null`.
- **Steps:** call the safe read path; find exact ID; return null when missing/invalid.
- **Edge cases:** empty IDs, SSR, malformed storage.

#### `create(input)`

- **Input:** `CreateSkillInput`.
- **Output:** `Skill | null` or the project’s established failure contract.
- **Steps:** trim/validate required fields; normalize tool IDs and `created_by`; generate UUID and ISO timestamps; append and persist; return the created entity.
- **Edge cases:** missing name/description, invalid tools, unavailable `crypto`, quota/storage failure, duplicate names. `[NEEDS CLARIFICATION: Are duplicate skill names allowed?]`

#### `update(id, updates)`

- **Input:** `id: string`, partial mutable Skill fields.
- **Output:** `Skill | null`.
- **Steps:** find existing record; validate changed fields; merge mutable fields only; preserve `id`, `created_by`, and `createdAt`; refresh `updatedAt`; persist and return.
- **Edge cases:** unknown ID, attempted identity mutation, empty required fields, invalid tool IDs, storage failure.

#### `remove(id)`

- **Input:** `id: string`.
- **Output:** `boolean`.
- **Steps:** read all; remove exact matching ID; persist only when a record was removed; return status.
- **Edge cases:** unknown/empty ID, repeated deletion, storage failure; UI must require confirmation before calling it.

#### Agent-wizard skill selection

- **Input:** persisted skills, selected IDs, and optional new-skill form input.
- **Output:** selected canonical `Skill[]` in wizard state and persisted store records.
- **Steps:** read catalog; render selections; create new skill through store; append returned entity; deduplicate by ID; pass selected skills to generation and agent save.
- **Edge cases:** catalog empty, skill deleted in another tab, stale wizard state, localStorage failure, generated default skills not yet persisted.

## Overview — Norms

### Naming and UI conventions

- Use `@/*` imports, strict TypeScript, existing route/file naming, and the existing `getAll`/`getById`/`create`/`update`/`remove` store API.
- Keep client directives only on pages/components using hooks, events, or browser storage.
- Use `FieldGroup` + `Field` for forms, `gap-*` instead of `space-*`, `size-*` for equal dimensions, semantic color tokens, and `data-icon` on button icons.
- Use existing shadcn `Empty`, `Card`, `Badge`, `AlertDialog`, `Checkbox`/appropriate option control, and toast primitives rather than custom equivalents.

### Logging and error handling

- No logging convention exists for localStorage CRUD; continue the existing silent storage-failure pattern and communicate actionable failures through the existing toast component.
- Never let SSR or malformed localStorage crash a page.
- Keep IDs and creation metadata server-independent and immutable from UI input.

### Testing and documentation

- No test runner or test dependencies are configured. Verification is static/build/lint plus manual browser checks.
- Run `npm run lint` and `npm run build`.
- Manually verify create, edit, delete confirmation, empty state, search, refocus refresh, wizard selection, wizard-created skill reuse, and dashboard count.
- If the schema changes, document the legacy storage decision in the implementation PR/plan and update this plan if behavior deviates.

## Now — Safeguards

### Risks and dependencies

- **Schema collision:** Existing persisted data uses the generator schema. A hard replacement can make prior skills unreadable; migration or an explicit reset policy is required.
- **Type collision:** Removing `agents/types.Skill` affects agent generation, wizard, detail tabs, and exports; update all imports together before build verification.
- **Creation semantics:** The wizard currently creates ephemeral defaults and the generator creates nested content. The reusable-store requirement cannot be met until those paths have a defined persistence policy.
- **Identity semantics:** `created_by` has no established Skill implementation. Its source must be clarified before treating the entity as complete.
- **Cross-tab freshness:** localStorage has no subscription here; visibility refresh is required, but same-tab updates still need explicit state updates after mutations.
- **Tool compatibility:** Stored tool IDs must remain aligned with `TOOL_CANDIDATES`; arbitrary generated labels may not be selectable in the wizard.

### Invariants

- Skill IDs are unique and never change through edit.
- `createdAt` and `created_by` are not editable through the form.
- Every successful mutation updates localStorage before the UI claims success.
- UI state is updated only after a store operation succeeds.
- The agent wizard and Skills page read from the same canonical store.
- Delete is irreversible in localStorage and therefore requires explicit confirmation.

### Performance, security, and compatibility

- localStorage operations should remain synchronous and small enough for the MVP grid; avoid repeated reads during a single render and derive filtered results from the state snapshot.
- Treat instructions and descriptions as untrusted user text: render as text, never inject HTML, and do not execute stored tool names.
- Authentication exists only as a client-side mock; do not imply server-side authorization or cross-user isolation in this MVP.
- Preserve existing route URLs and the `agentstudio:skills` key unless a migration plan is approved.

### Verification approach

1. Run lint and production build after type/store changes, then again after UI integration.
2. Start the dev server and manually exercise the complete lifecycle from a clean storage state.
3. Verify localStorage records contain the canonical fields and timestamps, and that reload/refocus preserves them.
4. Verify editing cannot change ID, creation timestamp, or creator.
5. Verify delete confirmation cancel/confirm paths and missing-record behavior.
6. Verify wizard-created skills appear on `/skills`, can be selected again, and are present in the saved agent payload.
7. Verify dashboard Skills count updates after creation/deletion and after returning focus to the dashboard.
8. If legacy data migration is approved, test both legacy and canonical records before and after migration.

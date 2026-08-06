# REASONS: Agent Version History and Comparison — AGE-47

## R — Requirements

### Problem

Agents are editable records, but the current `Agent` model stores only one mutable configuration and a display version string. The detail page and agent store provide no durable local history, comparison workflow, or rollback capability. Users cannot understand how an agent evolved or safely recover an earlier prompt/tool/skill configuration.

### Definition of Done

1. `AgentVersion` is exported from `lib/agents/types.ts` with the requested snapshot fields and timestamps.
2. Version snapshots are persisted in `agentstudio:agents:{agentId}:versions`, isolated per agent and returned newest first.
3. The store exposes `createVersion`, `getVersion`, `getVersions`, `deleteVersion`, and `rollbackToVersion` with the requested return contracts.
4. Saving an agent creates a snapshot before the update only when the existing history contains at least one version and the change is non-trivial: `system_prompt`, `model`, tools, or skills. Name/description-only edits do not create a version.
5. The agent detail page renders a Versions section below `AgentDetailTabs`, including label, changed date, reason, details, compare, and rollback actions.
6. Compare presents the selected version beside the current agent, identifies field-level changes, highlights system-prompt line additions/removals, and identifies added/removed tools and skills.
7. Rollback restores the selected version’s editable agent fields, updates the current agent timestamp, preserves version history, and refreshes the page state.
8. Missing agents, missing versions, malformed localStorage, storage quota failures, cancel actions, and unavailable browser storage fail safely without false success feedback.
9. `npm run lint` and `npm run build` pass; manual acceptance verification covers save, list, compare, rollback, delete, and reload persistence.

### Scope In

- Agent version snapshot typing and localStorage persistence.
- Store-level version lifecycle and save integration.
- Version list, detail/compare presentation, and rollback controls on the existing agent detail route.
- Reuse of existing Base UI/shadcn components, toast behavior, and `AgentDetailTabs` layout.

### Scope Out

- Server persistence, authentication, collaboration, synchronization, or API routes.
- Full diff libraries, merge conflict handling, branch semantics, or multi-version selection beyond one version versus current.
- A new version-management route or changes to the broader agent wizard.
- Automatic version creation for title/description-only edits.
- Changes to unrelated export formats unless required to preserve existing behavior.

### Clarifications Required Before Implementation

- **Initial history policy:** The stated save rule requires existing history `> 0`, but new agents currently have no versions and no UI action can create the first version. Confirm whether `create`/`saveAgent` should seed an initial `1.0` snapshot, or whether the first non-trivial save should create the initial snapshot despite the `> 0` rule. Without this decision, automatic history can remain empty permanently.
- **Version label policy:** Confirm whether labels are auto-incremented (`1.0`, `1.1`, …), copied from `Agent.version`, or entered/generated from `changeReason`. The requested type permits arbitrary labels but does not define generation rules.
- **`context` source:** `Agent` currently has no `context` field. Confirm whether `context` must be added to `Agent`/editor state or whether snapshots should leave `AgentVersion.context` undefined for this MVP.
- **Rollback versioning:** Confirm whether rollback itself should create a new snapshot describing the rollback, or only restore the selected snapshot while preserving existing history.

## E — Entities

### AgentVersion — New

- **Fields:** `versionId`, `versionLabel`, `name`, `description`, `system_prompt`, `model`, `skills`, `tools`, optional `context`, `createdAt`, `changedAt`, optional `changeReason`.
- **Relationships:** Belongs to one `Agent` by the agent ID encoded in its localStorage key; contains immutable snapshot copies of the agent’s mutable configuration at the time of version creation.
- **Domain rules:** `versionId` is unique within the agent’s history; `changedAt` is the snapshot creation time; returned histories are newest first; snapshot arrays must be copied so later agent edits cannot mutate history.

### Agent — Modified Existing Entity

- **Fields:** Existing fields remain authoritative for the current configuration. `context` is only added if the clarification above confirms it belongs in the current agent model. The existing `version` field remains compatible with current exports unless a separate version-label policy changes it.
- **Relationships:** One agent has zero or more `AgentVersion` snapshots in a separate storage record.
- **Domain rules:** Current-agent updates preserve `id` and `createdAt`; substantive changes are detected before mutation; rollback copies snapshot configuration into the current agent without deleting snapshots.

### Version Comparison — Derived View Model

- **Fields:** Selected version, current agent, changed scalar fields, system-prompt diff lines, added/removed tools, and added/removed skills.
- **Relationships:** Derived from one `AgentVersion` and the current `Agent`; never persisted.
- **Domain rules:** Tools and skills are compared by stable `id`; system prompt comparison uses a simple line-based diff; unchanged fields are explicitly represented as unchanged or omitted consistently.

## A — Approach

Use the existing synchronous, browser-only store as the source of truth and keep version records in separate per-agent localStorage keys as required. Extend the existing store rather than introducing a state library or a new persistence abstraction.

1. Add `AgentVersion` and shared snapshot field typing in `types.ts`.
2. Add private store helpers for the per-agent key, safe JSON reads, snapshot creation, UUID generation, substantive-change detection, and version-label selection. Reuse the existing `isBrowser`, `readAll`, and `persist` error-handling style.
3. Make the save path capture the pre-update agent before mutating it. The version snapshot must be written before the current-agent update, and only after the confirmed initial-history policy and non-trivial comparison pass.
4. Keep `createVersion` explicit and reusable. `getVersion`/`getVersions` return defensive data; `deleteVersion` rewrites only that agent’s version key; `rollbackToVersion` uses the existing agent update semantics while avoiding accidental loss of the history key.
5. Extract version history UI into focused client components so the route remains responsible for loading the agent, coordinating store mutations, toast feedback, and refreshing state. Use existing `Table`/`Card`/`Dialog`/`AlertDialog` primitives only where already available; add no UI dependency.
6. Implement comparison as a pure derived calculation in the compare component or a small local utility. Do not add a diff package. Use semantic styling for additions/removals and existing icon/button conventions.

### Trade-offs and Alternatives

- **Separate key versus embedding versions:** Separate keys match the issue’s storage contract and avoid inflating the main agent array, but agent deletion must explicitly clean up orphaned history.
- **Store-level versus page-level save integration:** Store-level integration protects all existing callers of `update`/`saveAgent`; page-only integration is smaller but can silently bypass history when another caller saves. Prefer store-level behavior, with tests/manual checks for both public save paths.
- **Inline page UI versus extracted components:** Inline markup is simpler initially, but a list, detail, compare panel, and rollback confirmation would make the current route difficult to review. Extract focused components while keeping domain logic in the store.
- **Line diff versus full diff library:** A simple line diff meets MVP scope and avoids bundle/dependency cost, but it will not provide semantic word-level or moved-line detection.

## S — Structure

### Files To Create

- `components/agent/AgentVersionHistory.tsx` — client presentation for the Versions section, list rows, selected-version details, and action callbacks.
- `components/agent/AgentVersionCompare.tsx` — client comparison panel/dialog for current versus selected version, scalar changes, prompt diff, and tool/skill changes.
- `lib/agents/version-diff.ts` — pure comparison helpers for scalar fields, line-based system-prompt changes, and ID-based tools/skills deltas, if keeping these calculations out of the component is consistent with the final implementation.

### Files To Modify

- `lib/agents/types.ts` — export `AgentVersion`; add `context` to current-agent input types only if clarification confirms it.
- `lib/agents/store.ts` — import `AgentVersion`; implement per-agent version persistence, lifecycle functions, substantive-change detection, save integration, rollback, and agent-delete cleanup.
- `app/(dashboard)/agents/[id]/page.tsx` — load versions, render the Versions section below `AgentDetailTabs`, wire compare/delete/rollback actions, refresh local state, and provide toast/error handling.

### Files To Inspect During Implementation

- `app/(dashboard)/agents/[id]/_components/agent-detail-tabs.tsx` — preserve the existing draft/update contract and placement boundary.
- `components/ui/alert-dialog.tsx`, `components/ui/dialog.tsx`, `components/ui/table.tsx`, `components/ui/badge.tsx`, and `components/ui/empty.tsx` — use only installed Base UI/shadcn APIs and existing composition conventions.
- `components/agent/AgentCard.tsx` — mirror existing destructive confirmation and button patterns.

### Dependencies

- None. Do not add a diff library or persistence package.

## O — Operations

### Operation 1: Create Version Snapshot

**Input:** `agentId`, partial agent updates, optional `changeReason`.

**Output:** `AgentVersion` or `null`.

**Steps:**

1. Reject invalid IDs, SSR execution, or an unknown agent.
2. Read the current agent and merge only supported snapshot fields with the requested updates.
3. Generate a UUID, choose the approved version-label policy, and set ISO timestamps.
4. Clone tools and skills (including nested skill tool ID arrays) before writing.
5. Append to the per-agent version key and return the created snapshot only after persistence succeeds.

**Edge cases:** Invalid JSON is treated as empty history; UUID/storage failures return `null`; partial updates must not erase omitted current fields; a failed version write must prevent the subsequent save from reporting a successful versioned update.

### Operation 2: Read and Delete Version History

**Input:** Agent ID; optionally version ID.

**Output:** `getVersions` returns newest-first snapshots, `getVersion` returns one snapshot or `null`, and `deleteVersion` returns a boolean.

**Steps:**

1. Resolve `agentstudio:agents:{agentId}:versions`.
2. Safely parse and validate the array shape.
3. For `getVersions`, sort by `changedAt` descending without mutating caller-owned data.
4. For `getVersion`, find by exact `versionId`.
5. For deletion, remove only the requested ID and persist the remaining array.

**Edge cases:** Unknown agent/version returns empty/`null`/`false`; malformed records are ignored or cause a safe empty result according to the existing store convention; deleting the last version removes or retains an empty key consistently and documents that choice.

### Operation 3: Integrate Versioning With Agent Save

**Input:** Existing agent ID and proposed mutable fields from `update`/`saveAgent`.

**Output:** Updated `Agent` or `null`, with a pre-update version when eligible.

**Steps:**

1. Read the existing agent and existing version count before mutation.
2. Compare system prompt, model, tools, and skills; compare tools/skills by stable IDs and relevant structure rather than array reference.
3. If history exists and the change is non-trivial, create the pre-update snapshot with the supplied/default reason before writing the agent.
4. If snapshot creation fails, abort the current-agent update to avoid a silent history gap.
5. Persist the updated agent through the existing `persist` path and preserve immutable fields.

**Edge cases:** Name/description-only changes do not version; unchanged saves do not version; reordered tools/skills must follow a documented equality rule; rollback must not recursively create an unintended snapshot unless the rollback policy explicitly requires it.

### Operation 4: Roll Back to a Version

**Input:** `agentId`, `versionId`.

**Output:** Restored `Agent` or `null`.

**Steps:**

1. Resolve the agent and selected snapshot.
2. Copy snapshot configuration fields into the current agent while preserving current ID and original creation timestamp.
3. Set the current update timestamp and apply the approved version-label/rollback policy.
4. Persist the agent; keep all version records intact.
5. Return the restored agent for page state refresh and success feedback.

**Edge cases:** Unknown IDs, malformed snapshots, or storage failure return `null`; rollback of a deleted version is impossible and must show failure; the UI must require confirmation because rollback replaces current edits.

### Operation 5: Render and Compare Versions

**Input:** Current `Agent`, newest-first `AgentVersion[]`, and selected version state.

**Output:** Versions section plus a comparison view.

**Steps:**

1. Render an empty state when history is absent; otherwise show label, formatted changed date, and reason with newest first.
2. Allow a row/detail action to select one version and show its captured fields.
3. Open the compare panel/dialog with selected version on one side and current agent on the other.
4. Show changed name, description, model, tools, and skills; show unchanged values consistently.
5. Compute line-level system-prompt additions/removals and render semantic added/removed highlighting.
6. Compute tool/skill additions and removals by ID and label them clearly.
7. Wire version deletion and rollback through confirmation dialogs and refresh the list/current agent after success.

**Edge cases:** Long prompts need bounded scrollable panels; empty tools/skills must render as empty rather than failure; missing optional reason/context must use a neutral fallback; compare must remain readable on narrow screens and accessible to keyboard/screen-reader users.

## N — Norms

- Follow existing TypeScript strict typing, PascalCase React component names, `@/*` imports, semicolon-free formatting, and current store function naming.
- Keep the page as a client component because it reads localStorage and owns event handlers; extracted interactive version components must also use the appropriate client directive.
- Use existing Base UI composition (`render`/`asChild` as demonstrated by the installed wrappers), required dialog titles, semantic Button variants, `gap-*` spacing, `Badge`, `Table`, `Empty`, and `toast.add({ title, type })`.
- Use direct imports rather than introducing a barrel or broad client dependency. Avoid new effects where state can be refreshed in event handlers; use stable derived data for comparisons.
- Store failures follow the existing silent-safe store convention and become user-facing error toasts at the page boundary. Do not add logging infrastructure.
- No test runner, test files, or testing dependencies are configured. Validate with `npm run lint`, `npm run build`, and focused manual localStorage/UI checks. If implementation introduces pure diff helpers, manually exercise empty, unchanged, added, removed, and multiline cases.
- Document any resolution of the clarification items in the implementation PR/plan update; do not silently choose incompatible version semantics.

## S — Safeguards

### Invariants

- Version records are immutable snapshots after creation; editing the current agent never mutates an older snapshot.
- Version IDs are unique per agent and all version operations are scoped to the requested agent key.
- A non-trivial save writes the snapshot before the current agent update; partial success must not be reported as a complete versioned save.
- Name/description-only saves do not add versions; unchanged saves do not add versions.
- Rollback preserves the version list and current agent identity/creation timestamp.
- Removing an agent also removes its per-agent version key to prevent orphaned data.

### Performance

- All operations remain synchronous localStorage operations appropriate for the current MVP’s small collections.
- Compare only the selected version and current agent; do not recompute a diff for every history row.
- Keep prompt panes scrollable and avoid unnecessary page-wide rerenders; refresh state directly after mutations.

### Security and Data Integrity

- Treat localStorage as client-controlled, non-sensitive MVP data; do not imply server durability or access control.
- Render prompts, reasons, names, and labels as React text; never inject HTML from snapshots.
- Validate parsed storage shapes before use and preserve current store behavior of returning safe empty/null values on malformed data.
- Escape/format dates through existing browser-safe formatting conventions and do not use untrusted values as DOM attributes without validation.

### Acceptance Verification

1. Create an agent and confirm the resolved initial-history policy through the UI and `agentstudio:agents:{id}:versions` storage key.
2. Save only name/description and verify the version count is unchanged.
3. Change the system prompt, model, tool, or skill and verify a pre-update snapshot is created with the expected fields, reason, label, and timestamps.
4. Reload the route and confirm the list remains newest first and data survives reload.
5. Open details and compare; verify scalar changes, prompt added/removed lines, and tool/skill additions/removals.
6. Cancel rollback/delete confirmations and verify no storage mutation; confirm rollback and deletion update the UI and storage correctly.
7. Test unknown IDs, malformed localStorage JSON, and simulated storage failure for safe failure feedback.
8. Run `npm run lint` and `npm run build`.

### Risks and Trade-offs

- **History bootstrap ambiguity:** Without a confirmed initial snapshot policy, the required `history > 0` guard can make automatic versioning unreachable.
- **LocalStorage quota:** Snapshotting full prompts and nested tools/skills increases storage use; failures must abort versioned saves rather than silently losing history.
- **Concurrent tabs:** This MVP has no cross-tab locking or synchronization; last writer wins and the page should reload current storage after mutations where practical.
- **Rollback semantics:** Treating rollback as a normal update can create confusing history unless the product explicitly defines whether it records a rollback snapshot.
- **Schema evolution:** Future changes to `Agent`/`Skill`/`Tool` may require version migration; keep the snapshot schema explicit and tolerate missing optional fields for old records.

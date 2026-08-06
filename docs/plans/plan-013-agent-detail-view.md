# Plan 013 — Agent Detail View (AGE-13)

## Analysis

### Current state

- `Agent` already contains the fields needed by the detail view: model, embedded `Skill[]` and `Tool[]`, version, and ISO timestamps.
- `lib/agents/store.ts` is the single localStorage boundary and already provides CRUD, duplication, and markdown serialization. Existing legacy exports must remain compatible.
- The list page loads agents from `getAll()` and renders `AgentCard`; the card currently shows only name, description, and model, with list-level deletion.
- The detail route resolves an agent once with `getById()` and delegates all UI to `AgentEditor`.
- `AgentEditor` edits name, description, and system prompt; model, skills, and tools are read-only badges. It has preview, duplicate, and a browser-generated markdown download, but no JSON export or delete action.
- The wizard persists generated agents through `store.create()`. Prompt-generator handoff enters the wizard through query parameters; the resulting saved agent should use the same persisted `Agent` shape as wizard-created agents.
- `TOOL_CANDIDATES` is the available tool catalog. Wizard-created skills are embedded `lib/agents/types.ts` `Skill` objects; they are not the separate persisted skills from `lib/skills/store.ts`.
- The dashboard currently initializes its stats once and already calls `listAgents().length` for the Agents stat. The implementation should preserve that store-backed source and decide whether live refresh is required.
- No tab, select, test-runner, backend, API route, or agent execution service exists in the repository.

### Target state

The detail route provides a complete saved-agent workspace with Overview, Configuration, Skills, and Tools tabs. It displays metadata and counts, edits all mutable agent definition fields, allows adding/removing embedded skills and catalog tools, supports duplicate/delete/test/export actions, and persists changes through the existing localStorage store. Agents created through the wizard or prompt-generator flow load by their persisted ID without shape-specific special cases.

## R — Requirements

### Problem

AGE-13 has a working list/detail shell but does not expose the complete saved-agent lifecycle. Important metadata is hidden, configuration is partially read-only, skills/tools cannot be managed, JSON export is missing, and detail-level destructive/test actions are unavailable.

### Definition of Done

- Agent cards show skill count, tool count, and created date in addition to current fields.
- Detail view shows version, created date, and last updated date.
- Model can be changed and is persisted.
- Embedded skills and tools can be added and removed, with changes persisted without mutating the source object before save.
- Detail view uses Overview, Configuration, Skills, and Tools tabs.
- Detail view supports JSON and Markdown downloads.
- Detail view supports confirmed deletion and returns to `/agents` after success.
- The requested agent test action has an implemented, verifiable behavior once its product contract is clarified.
- Dashboard Agents count reflects the same stored collection used by the agents page and refresh behavior is documented/verified.
- Agents saved by the wizard and prompt-generator path can be opened, edited, exported, duplicated, tested, and deleted.
- `npm run lint` and `npm run build` pass; manual browser acceptance covers localStorage success and failure paths.

### Scope In

- Agent list card metadata.
- Agent detail tabs and editable configuration.
- Embedded skill/tool management using existing domain shapes and catalogs.
- JSON/Markdown export UI and detail-level deletion.
- Store/API adjustments required to persist complete detail edits and serialize JSON.
- Wizard/prompt-generator compatibility verification and focused fixes.
- Dashboard count verification/refresh adjustment if required by acceptance behavior.

### Scope Out

- Backend persistence, authentication scoping, synchronization, sharing, marketplace, runtime execution, evaluation datasets, version history, and rollback.
- Importing global persisted skills into agents unless explicitly required; the current agent model stores embedded `Skill` objects.
- Introducing a new state-management library or test framework.

## E — Entities

### Agent — existing, modified through UI

- **Fields:** `id`, `name`, `description`, `model`, `system_prompt`, `skills: Skill[]`, `tools: Tool[]`, `version`, `createdAt`, `updatedAt`.
- **Relationships:** embedded skills and tools are copied into the agent; tools may be selected from `TOOL_CANDIDATES` and skills may be created using the existing wizard skill shape.
- **Domain rules:** `id`, `createdAt`, and existing `version` remain immutable during ordinary edits; `updatedAt` changes on successful save; duplicate gets a new ID/timestamps; skill/tool membership is unique by ID.

### Agent detail UI state — new presentation state, not a persisted entity

- **Fields:** active tab, editable agent definition draft, pending deletion/export/test state.
- **Rules:** draft changes are not persisted until Save; switching tabs must not discard unsaved changes; failed saves keep the draft visible.

### Tool catalog — existing

- **Fields:** `Tool { id, name, description, category, icon? }` from `TOOL_CANDIDATES`/`TOOL_MAP`.
- **Rule:** adding a tool stores the complete `Tool` object, not only its ID, matching the current `Agent` type and export behavior.

### Embedded Skill — existing agent-domain shape

- **Fields:** `Skill { id, name, description, instructions, tools }` from `lib/agents/types.ts`.
- **Rule:** adding/removing skills operates on the agent’s embedded array and prevents duplicate IDs.

## A — Approach

1. Keep localStorage and CRUD semantics in `lib/agents/store.ts`; extend the existing `update`/canonical save path only as needed for full agent definition updates.
2. Split the current monolithic editor into a detail composition with reusable tab content/components. Keep the page responsible for loading the agent, receiving updated/deleted results, and routing.
3. Reuse existing shadcn/base-nova primitives and wizard patterns. Add the shadcn Tabs primitive if the repository’s installed component set does not already provide one; do not add a runtime dependency.
4. Use a controlled draft for all editable fields. Save the complete draft (`name`, `description`, `model`, `system_prompt`, `skills`, `tools`) in one store update so changes are atomic from the UI’s perspective.
5. Use `TOOL_CANDIDATES` for tool selection and the existing inline skill form pattern for skill creation/removal. Do not silently convert between global skill records and embedded agent skills.
6. Centralize export/download formatting where practical: Markdown should call `exportAgentMarkdown` or an equivalent pure serializer, and JSON should serialize the current saved/draft agent with stable indentation and no UI-only state.
7. Mirror the existing `SkillEditor` behavior for toast feedback, confirmation, duplication, deletion, and navigation.

### Trade-offs and alternatives

- **One editor vs. separate tab components:** separate tab components reduce the current editor’s responsibility and make the four acceptance areas independently reviewable, while shared draft state keeps save behavior consistent.
- **Native select vs. new Select primitive:** use the project’s existing shadcn primitive if available; otherwise a labeled native `<select>` is lower-risk than adding a dependency. `[NEEDS CLARIFICATION: The approved model catalog and required model-picker UX are not defined.]`
- **Embedded skill creation vs. global skill picker:** embedded creation matches `Agent.skills` and the wizard. A global picker would require an explicit mapping contract that does not currently exist.
- **Test behavior:** preview is not equivalent to executing an agent. `[NEEDS CLARIFICATION: Define whether “Test” means prompt preview, a local simulated response, or a future runtime/evaluation flow, including required input/output and persistence.]`

## S — Structure

### Files to modify

- `app/(dashboard)/agents/[id]/page.tsx`
  - Keep ID loading/not-found behavior, pass detail callbacks, refresh agent after save, and navigate after delete/duplicate as appropriate.
- `components/agent/AgentEditor.tsx`
  - Replace the read-only model/skills/tools sections with the tabbed detail editor and full action bar, or reduce this component to the detail composition.
  - Add save, duplicate, delete, Markdown export, JSON export, and clarified test action feedback.
- `components/agent/AgentCard.tsx`
  - Render `agent.skills.length`, `agent.tools.length`, and formatted `agent.createdAt`, with safe handling for legacy/malformed arrays.
- `app/(dashboard)/agents/page.tsx`
  - Preserve list behavior while ensuring updated/deleted detail state is reflected on return or visibility refresh.
- `app/(dashboard)/dashboard/page.tsx`
  - Verify the Agents stat uses `listAgents().length`; add the same visibility/storage refresh pattern only if live accuracy is an acceptance requirement.
- `lib/agents/store.ts`
  - Add/standardize a pure JSON export serializer/download input contract if UI cannot safely serialize the persisted record itself; preserve existing aliases and localStorage key.
  - Ensure full updates persist model, skills, and tools and preserve immutable metadata.
- `lib/agents/types.ts`
  - Only add a narrowly scoped export/detail input type if needed; preserve existing field names and object-array types.

### Files to create

- `components/agent/AgentDetailTabs.tsx` — tab shell and shared draft/action wiring, if decomposition is chosen.
- `components/agent/AgentConfigurationTab.tsx` — name, description, model, and system-prompt fields.
- `components/agent/AgentSkillsTab.tsx` — embedded skill list, add form, duplicate prevention, and remove actions.
- `components/agent/AgentToolsTab.tsx` — catalog-backed tool picker/list and remove actions.
- `components/ui/tabs.tsx` — only if the shadcn Tabs primitive is not already present; add through the project’s shadcn workflow.

### Files to verify or modify only if compatibility requires it

- `components/agent/AgentWizard.tsx`
- `app/(dashboard)/agents/new/page.tsx`
- `components/agent/AgentOutput.tsx`
- `lib/agents/tools.ts`
- `components/agent/wizard/SkillsStep.tsx`
- `lib/ai/generate-agent.ts`

### Dependency changes

- None expected. No backend, export, state, or test dependency should be added. A local shadcn Tabs component is a source-file addition, not a runtime dependency.

## O — Operations

### Operation: Load agent detail

**Input:** route `id: string`.

**Output:** `Agent | null` and not-found UI.

**Steps:**

1. Read the route ID and call `getById`/`getAgent` once during client initialization.
2. Normalize only missing legacy array values to empty arrays at the UI boundary; do not alter valid stored objects.
3. Render not-found state for empty/unknown IDs.
4. Initialize draft state from the loaded agent and keep it synchronized after successful saves.

**Edge cases:** missing ID, malformed localStorage, agent deleted in another tab, legacy records with missing `skills`/`tools`, and route navigation between IDs.

### Operation: Save configuration and memberships

**Input:** complete draft `name`, `description`, `model`, `system_prompt`, `skills`, and `tools`.

**Output:** updated `Agent | null`, success/error toast.

**Steps:**

1. Validate required text fields and model selection.
2. Trim text fields while preserving intentional multiline prompt content.
3. Deduplicate skills/tools by ID and create fresh arrays for the store update.
4. Call `store.update(agent.id, draftFields)`; never allow draft metadata to overwrite ID/created date/version.
5. On success, update page state and show success feedback; on failure, keep the draft and show an error.

**Edge cases:** blank name/description/prompt, no skills/tools, duplicate selections, unknown tool ID, storage quota failure, agent removed before save, and unsaved edits while changing tabs.

### Operation: Add/remove skills

**Input:** embedded `Skill` values or skill form fields; skill ID for removal.

**Output:** updated draft array, persisted after Save.

**Steps:**

1. Reuse the wizard’s required name/description validation and optional instructions behavior.
2. Generate a client UUID for a new embedded skill.
3. Reject an ID already present in the draft.
4. Add or filter the draft array immutably.
5. Display empty state and count, then persist through the common Save operation.

**Edge cases:** blank fields, repeated submit, duplicate IDs, removing the last skill, and skill objects with empty `tools` arrays.

### Operation: Add/remove tools

**Input:** tool ID from `TOOL_CANDIDATES`; tool ID for removal.

**Output:** updated draft array, persisted after Save.

**Steps:**

1. Render all catalog candidates with selected state using the existing wizard card pattern.
2. Add the complete catalog object when selected and remove by ID when deselected.
3. Prevent duplicate IDs and keep array order stable.
4. Display count/empty state and persist through the common Save operation.

**Edge cases:** stale/unknown stored tool, catalog item removed in a future build, toggling the last tool, and duplicate tool records in legacy storage.

### Operation: Export Markdown and JSON

**Input:** current saved agent or explicitly defined current draft; file name derived from sanitized agent name.

**Output:** browser download and success/error toast.

**Steps:**

1. Decide whether export represents saved state or unsaved draft and make the UI label explicit.
2. Produce Markdown using the deterministic store serializer, including metadata, prompt, skills, and tools.
3. Produce JSON with `JSON.stringify(agent, null, 2)` and `application/json` MIME type.
4. Create a Blob, trigger an anchor download, remove it, and revoke the object URL.
5. Show feedback and handle browser/download failures without throwing.

**Edge cases:** missing agent, multiline/untrusted prompt text, empty arrays, special characters in names, invalid filename characters, unsaved edits, and URL/Blob APIs unavailable.

### Operation: Duplicate

**Input:** current agent ID.

**Output:** new `Agent | null`, navigation to the duplicate detail page or list, and toast.

**Steps:**

1. Call `duplicateAgent(agent.id)` rather than reconstructing the record in the component.
2. Preserve the original and verify new ID/timestamps/name suffix.
3. Navigate to the new agent detail route so the result is immediately editable.

**Edge cases:** unknown ID, UUID/storage failure, and duplicate action while a save is pending.

### Operation: Delete

**Input:** current agent ID after confirmation.

**Output:** boolean, toast, navigation to `/agents`.

**Steps:**

1. Open an AlertDialog naming the agent and warning that deletion is irreversible.
2. On confirmation call `deleteAgent`/`remove`.
3. On success navigate to the list; on failure retain the page and show an error.

**Edge cases:** cancellation, unknown/deleted ID, storage write failure, and double submission.

### Operation: Test agent

**Input:** `[NEEDS CLARIFICATION: test input, execution mechanism, expected output, and whether this is preview-only.]`

**Output:** `[NEEDS CLARIFICATION: test result UI, persistence, and error contract.]`

**Steps:**

1. Confirm the product contract before implementation.
2. Reuse `AgentOutput` for preview only if the decision is that “test” means local inspection.
3. If execution is required, define the runtime/API boundary separately; do not fake an AI response in the detail view.

**Edge cases:** empty input, unavailable model/runtime, tool execution permissions, prompt injection, timeout, and unsaved configuration.

## N — Norms

- **Naming:** retain `system_prompt`, `createdAt`, `updatedAt`, object-based `Skill[]`/`Tool[]`, and string `version`; use camelCase component/function names and `@/*` imports.
- **UI:** use existing base-nova shadcn composition, `gap-*` instead of `space-*`, `size-*` for equal dimensions, semantic color tokens, and `data-icon` for button icons.
- **Logging:** follow existing silent localStorage error handling; do not log prompts or tool metadata.
- **Error handling:** expected missing records return null/false and surface concise toast errors; validation disables Save and explains required fields.
- **Testing:** no runner is configured. Validate with `npm run lint`, `npm run build`, and a browser acceptance matrix covering wizard-created, prompt-generator-created, empty, populated, malformed-storage, and cross-tab cases. `[NEEDS CLARIFICATION: Add automated tests only if a test runner is introduced by project policy.]`
- **Documentation:** record the resolved model catalog, export state choice, and Test semantics in implementation notes/PR description; update this plan if the data contract changes.

## S — Safeguards

- **Invariants:** never mutate `id`, `createdAt`, or stored source objects during editing; duplicate must not share mutable arrays/objects with the source.
- **Data integrity:** save full agent definition fields together, preserve the existing `agentstudio:agents` key, deduplicate memberships by ID, and do not report success after a failed persistence write.
- **Compatibility:** wizard and prompt-generator saves must continue to produce records accepted by `getById`; legacy records with absent arrays should render safely and remain exportable.
- **Performance:** localStorage operations remain synchronous O(n); avoid repeated reads per action and avoid network waterfalls. Large prompts must render without eagerly duplicating content unnecessarily.
- **Security:** localStorage is not confidential; treat prompts, skill instructions, and tool metadata as untrusted text. Do not render stored content as HTML or execute tool instructions in the browser.
- **Export safety:** use text Blob MIME types, sanitized filenames, deterministic serialization, and no HTML interpretation.
- **Accessibility:** tabs must be keyboard navigable with visible selected state; all fields/actions require accessible labels; destructive actions require confirmation; empty and error states must be announced/readable.
- **Product boundaries:** do not claim that Preview is Test, or that a downloaded JSON file is an installable agent package, until those contracts are explicitly defined.

## Acceptance Criteria Mapping

| AGE-13 criterion | Implementation mapping |
|---|---|
| View saved agents | Preserve `/agents/[id]` loading/not-found route; normalize legacy arrays and verify wizard/prompt-generator records. |
| Edit name, description, system prompt | Configuration tab controlled draft and common Save operation. |
| Show skill/tool counts and created date on cards | Modify `AgentCard.tsx`; use safe array lengths and formatted `createdAt`. |
| Show version, created date, last updated on detail | Overview tab metadata block sourced from the loaded agent. |
| Change model | Editable model control in Configuration tab. `[NEEDS CLARIFICATION: approved model options.]` |
| Add/remove skills | `AgentSkillsTab.tsx`, embedded `Skill` form, immutable draft updates, store update on Save. |
| Add/remove tools | `AgentToolsTab.tsx`, `TOOL_CANDIDATES` selection, immutable draft updates, store update on Save. |
| Duplicate | Detail action calls `duplicateAgent`, then navigates to the cloned detail route. |
| Delete from detail | AlertDialog action calls `deleteAgent`/`remove`, then routes to `/agents`. |
| Export Markdown | Reuse `exportAgentMarkdown`/pure serializer and browser download helper. |
| Export JSON | Add JSON serialization/download action with explicit saved-vs-draft semantics. |
| Tabbed Overview/Configuration/Skills/Tools layout | Add local/shadcn Tabs primitive and four tab panels. |
| Test agent | Blocked pending exact semantics; implement only after product clarification, without inventing runtime behavior. |
| Accurate dashboard agent count | Keep `listAgents().length`; add visibility/storage refresh only if “accurate” means live updates, otherwise verify reload behavior. |
| Works for wizard/prompt-generator agents | Verify end-to-end persisted shape and route ID; fix only the producer or normalization boundary if a concrete mismatch is reproduced. |

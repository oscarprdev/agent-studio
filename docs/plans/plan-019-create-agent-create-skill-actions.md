# REASONS: Prompt-to-Agent and Prompt-to-Skill Actions — AGE-19

## R — Requirements

### Problem

The Prompt Generator currently exposes only Copy and Save Prompt after generation. The PRD defines Create Agent and Create Skill as the other two actions, but the prompt-to-builder pipelines are disconnected. Users otherwise must copy generated content manually and navigate to a builder without pre-populated context.

### Definition of Done

1. Generated PromptGenerator output shows Copy, Save Prompt, Create Agent, and Create Skill.
2. Create Agent and Create Skill navigate with `promptId` for a saved prompt or encoded `promptContent` for unsaved content.
3. The prompt detail editor shows both creation actions targeting the saved prompt ID.
4. `/agents/new` reads incoming prompt parameters and pre-populates AgentWizard without changing its five-step workflow.
5. `/skills/new` reads incoming prompt parameters and pre-populates SkillGenerator without changing its generator workflow.
6. Existing agent and skill stores continue to generate IDs and persist under `agentstudio:agents` and `agentstudio:skills`.
7. Dashboard statistics derive Agent, Skill, and Prompt counts from existing stores rather than hardcoded values.
8. `npm run build` and `npm run lint` pass.

### Scope In

- PromptGenerator and PromptEditor action buttons and navigation.
- Prompt parameter decoding and prompt-store lookup on the creation pages.
- Optional initialization props on AgentWizard and SkillGenerator.
- Dashboard count wiring for all three entity stores.
- Manual verification of existing localStorage keys and generated IDs.

### Scope Out

- Redesigning the agent wizard or skill generator.
- Changing prompt, agent, or skill store schemas or creating new stores.
- Backend, API routes, authentication, or cross-device persistence.
- Delete flows, automatic reverse links, or automatic saving beyond the agreed action behavior.
- A new test runner or automated test suite; none is configured.

## E — Entities

### Prompt

- Existing fields: `id`, `title`, `input`, `content: PromptSections`, `createdAt`, and `updatedAt`.
- `PromptSections` contains `role`, `objective`, `tools`, `workflow`, `rules`, and `output`.
- Prompt actions route to an AgentWizard or SkillGenerator; no persistent foreign-key relationship is added.
- Saved prompts are addressed by `promptId`; unsaved generated content is transferred as URL-encoded `promptContent`.

### Agent and WizardState

- Existing `Agent` and `WizardState` types remain unchanged.
- AgentWizard receives an optional `initialState?: Partial<WizardState>` or an equivalent narrowly typed initialization shape.
- Prompt-derived text populates at least `goal`; `context` may also be populated when the agreed mapping preserves useful context.
- Existing current step, selected tools, skills, and generated-agent defaults remain unchanged unless explicitly supplied.

### Skill and SkillGenerator input

- Existing `Skill` and `SkillContent` types remain unchanged.
- SkillGenerator receives an optional `initialInput?: string` and initializes its textarea from that value.
- Initial prompt text is not a saved Skill; the existing Save Skill action remains the persistence boundary.

### Store contracts

- `lib/agents/store.ts` remains the source of Agent persistence and `crypto.randomUUID()` IDs.
- `lib/skills/store.ts` remains the source of Skill persistence and `crypto.randomUUID()` IDs.
- Existing keys are invariants: `agentstudio:agents` and `agentstudio:skills`.
- `lib/prompts/store.ts` remains the source of saved prompt lookup and dashboard counting.

## A — Architecture & Key Decisions

### Overall strategy

Keep the existing container/presentational split. Route pages resolve URL input and existing localStorage data, then pass plain initialization props into client components. Interactive components continue to own state, generation, saving, toasts, and navigation. No new context, state library, persistence adapter, or dependency is introduced.

### Search parameter strategy

1. Saved flows use `?promptId={id}`. The destination resolves the ID with `prompts.getById` and derives initialization text from the saved prompt.
2. Unsaved flows use `?promptContent={encodeURIComponent(formattedPrompt)}`. The destination reads it through `URLSearchParams`, which decodes the value, and passes the resulting text to the builder.
3. Construct query strings with `URLSearchParams` or equivalent encoding rather than raw concatenation. This protects spaces, ampersands, question marks, and newlines.
4. If both parameters exist, `promptId` takes precedence because it is a stable local reference. Invalid or missing values fall back to an empty builder.

### Saved versus unsaved action behavior

Because the current Save Prompt handler navigates away, creation actions need a deliberate saved/unsaved rule. Preserve the current explicit Save Prompt flow. For a creation action, use `promptId` when the prompt has already been saved; otherwise use `promptContent` and do not silently create a Prompt record. This avoids duplicate prompts and keeps “Save Prompt” as the explicit persistence action.

[NEEDS CLARIFICATION: The issue says `promptId` if saved and `promptContent` if not, but does not explicitly say whether clicking Create Agent/Create Skill should auto-save. This plan assumes it should not auto-save.]

### Pre-population location

- `/agents/new` and `/skills/new` remain client pages because their builders are interactive and read browser localStorage.
- Each page reads `useSearchParams()` and resolves either `promptId` or `promptContent` before rendering its builder.
- Pages pass stable primitive props rather than making builders parse URLs or perform store lookups.
- Use lazy initial state so imported values do not reset user edits on unrelated re-renders. If mounted URL changes must be supported, use a narrowly scoped effect keyed to the resolved primitive and document its reset behavior.

### Prompt-to-builder mapping

- Skill creation uses the resolved prompt text as the initial SkillGenerator description.
- Agent creation uses the resolved prompt text as the initial AgentWizard goal. For a saved prompt, the structured role/objective/context may be mapped into `goal` and `context` only if that preserves the full user intent.
- The wizard opens at its existing first step so users can review and refine imported content before generating an Agent.

[NEEDS CLARIFICATION: Confirm whether AgentWizard should show the complete formatted prompt in Goal, split ROLE/OBJECTIVE into Goal and Context, or use only the saved prompt’s original `input` field.]

### Dashboard counts

Replace hardcoded Skill and Prompt counts with `getAll().length` from their respective stores. Preserve the existing lazy `useState` client-only localStorage read. Counts are derived display state; no count is persisted separately.

### Trade-offs

- URL transfer is simple and frontend-only, but long prompts can approach browser URL limits; saved IDs are preferable when available.
- Page-level resolution keeps builders reusable, but requires route wiring in both destinations.
- Initial props avoid builder-side URL effects and unnecessary resets, at the cost of not syncing later URL changes after mount.

## S — Structure

### Files to modify

- `components/prompt/PromptGenerator.tsx` — add actions, canonical prompt formatting, and encoded navigation.
- `components/prompt/PromptEditor.tsx` — add saved-prompt creation actions.
- `app/(dashboard)/agents/new/page.tsx` — resolve search parameters and pass initial wizard state.
- `components/agent/AgentWizard.tsx` — accept and merge optional initial state.
- `app/(dashboard)/skills/new/page.tsx` — resolve search parameters and pass initial skill input.
- `components/skill/SkillGenerator.tsx` — accept optional initial input.
- `app/(dashboard)/dashboard/page.tsx` — read Skill and Prompt counts from stores.

### Files to verify without planned changes

- `lib/prompts/store.ts` — `getById`, `getAll`, and localStorage behavior.
- `lib/agents/store.ts` — UUID creation and `agentstudio:agents` key.
- `lib/skills/store.ts` — UUID creation and `agentstudio:skills` key.
- `lib/prompts/types.ts`, `lib/agents/types.ts`, `lib/skills/types.ts` — field compatibility.

### Files to create

- None.

### Dependencies

- None. Existing Button, Link/navigation, Field, and icon primitives are sufficient.

## O — Operations and Task Breakdown

### Operation 1 — Add PromptGenerator creation actions

**Scope:** Extend the generated-output action row from two actions to four and route generated content into the selected builder.

**Files:** `components/prompt/PromptGenerator.tsx`.

**Steps:**

1. Reuse one canonical formatter for structured `PromptSections` so Copy and `promptContent` navigation are consistent.
2. Add Create Agent and Create Skill using the existing Button primitive and action-row layout.
3. Build query parameters with encoded values; use `promptId` for an explicitly saved prompt and `promptContent` otherwise.
4. Keep actions unavailable when no result exists and preserve Copy, Save Prompt, toast, and router behavior.
5. Prevent duplicate save/navigation work on repeated clicks.

**Acceptance criteria:** Four actions appear after generation; destinations are correct; special characters and multiline content survive the round trip; no result leaves actions unavailable.

**Verification:** Generate a prompt, inspect both destination URLs, test `&`, `?`, spaces, and newlines, then run lint/build.

### Operation 2 — Add PromptEditor creation actions

**Scope:** Add saved-prompt actions to the prompt detail view.

**Files:** `components/prompt/PromptEditor.tsx`.

**Steps:**

1. Add Create Agent and Create Skill beside Save Changes and Back to List.
2. Navigate to `/agents/new?promptId={prompt.id}` and `/skills/new?promptId={prompt.id}` through the existing Button/Link composition pattern.
3. Keep the not-found state limited to its existing Back to List action.

**Acceptance criteria:** A valid detail view shows both actions and each URL contains the current prompt ID; title saving remains unchanged.

**Verification:** Open a stored prompt detail page and activate both actions; verify both builders receive that prompt.

### Operation 3 — Pre-populate AgentWizard

**Scope:** Resolve destination input in the route and support optional initial wizard values.

**Files:** `app/(dashboard)/agents/new/page.tsx`, `components/agent/AgentWizard.tsx`, existing prompt store/types for lookup.

**Steps:**

1. Read `promptId` and `promptContent` with the App Router search-parameter API.
2. Resolve `promptId` through `lib/prompts/store.ts`; use decoded content when no valid saved prompt is available.
3. Convert resolved data into the agreed goal/context mapping without mutating the Prompt entity.
4. Add optional `initialState` and initialize `WizardState` from defaults plus supplied fields using lazy state initialization.
5. Keep `currentStep: 0`, empty tool/skill selections, and existing generation/save behavior intact.

**Acceptance criteria:** Both parameter forms populate the wizard; no parameters render the existing empty wizard; edits persist through the normal flow.

**Verification:** Test valid ID, missing ID, malformed content, and no parameters; confirm generated Agents still save with new IDs.

### Operation 4 — Pre-populate SkillGenerator

**Scope:** Resolve destination input in the route and initialize the description textarea.

**Files:** `app/(dashboard)/skills/new/page.tsx`, `components/skill/SkillGenerator.tsx`, existing prompt store/types for lookup.

**Steps:**

1. Read `promptId` and `promptContent` from search parameters.
2. Resolve a valid prompt ID through the prompt store, otherwise use decoded prompt content.
3. Add `initialInput?: string` and use it only as the initial textarea value.
4. Preserve generation, copy, save, toast, and navigation behavior.

**Acceptance criteria:** Both parameter forms prefill the textarea; no parameters preserve an empty textarea; users can edit imported content; saved Skills receive generated IDs.

**Verification:** Test multiline and special-character content, generate and save a Skill, and verify `agentstudio:skills`.

### Operation 5 — Wire dashboard counts to stores

**Scope:** Replace hardcoded Skill and Prompt values with localStorage-backed counts.

**Files:** `app/(dashboard)/dashboard/page.tsx`.

**Steps:**

1. Import `getAll` from Skill and Prompt stores with unambiguous aliases.
2. Extend the existing lazy stats calculation to derive all three counts.
3. Keep cards, links, labels, and responsive layout unchanged.

**Acceptance criteria:** Dashboard cards show current Agent, Skill, and Prompt counts and show zero for empty stores.

**Verification:** Create/remove records through existing flows, reload dashboard, and compare cards with localStorage arrays.

### Operation 6 — Verify stores and production checks

**Scope:** Confirm existing store contracts and run required checks; no store changes are expected.

**Files:** No planned modifications; inspect `lib/agents/store.ts` and `lib/skills/store.ts`.

**Steps:**

1. Verify exact keys `agentstudio:agents` and `agentstudio:skills` remain unchanged.
2. Verify `crypto.randomUUID()` is used for new Agent and Skill IDs.
3. Verify malformed/missing storage remains safely handled.
4. Run `npm run lint` and `npm run build`.

**Acceptance criteria:** Store invariants remain true and both commands pass.

**Verification:** Record command results in the implementation handoff and manually exercise the primary action/prefill paths.

## N — Norms

### Naming and structure

- Follow existing PascalCase components, camelCase handlers, `@/*` imports, and route-group structure.
- Keep pages as thin client route wrappers and builder state inside builder components.
- Do not add a helper file unless existing formatter reuse cannot avoid duplication.

### UI and shadcn composition

- Use existing `Button` and Link/render composition; do not add raw styled action controls.
- Use `gap-*`, never `space-*`; use `size-*` for equal dimensions.
- Use `data-icon="inline-start|inline-end"` for button icons and omit manual icon sizing.
- Keep forms composed with `FieldGroup` and `Field`.
- Use semantic tokens and existing Button variants, not raw color values.
- UI copy is English and uses “Copy”, “Save Prompt”, “Create Agent”, and “Create Skill”.

### React and Next.js

- Preserve client boundaries where hooks, event handlers, or browser APIs are used.
- Put navigation and other interaction side effects in click handlers, not effects.
- Use primitive dependencies and lazy initialization to avoid unnecessary rerenders and state resets.
- Avoid introducing module-level mutable request state or broad imports.
- Check the repository’s Next.js 16 guidance if App Router search-param APIs require a version-specific adjustment.

### Logging and errors

- No logging infrastructure exists; do not add logging for this frontend-only flow.
- Preserve existing toast-based user feedback for copy/save/generation failures.
- Invalid or absent prompt parameters fail safely to an empty builder; do not throw during render.
- Existing store try/catch behavior remains authoritative.

### Testing and documentation

- No test runner is configured, so no test files or dependencies are added.
- Verification consists of manual route/persistence checks plus `npm run lint` and `npm run build`.
- Update this plan only if implementation deviates from the decisions or clarification assumptions.

## S — Safeguards

### Invariants

- Raw prompt content is URL-encoded before navigation and rendered as text, never HTML.
- `promptId` is used only to look up an existing local prompt; it is never trusted as an Agent or Skill ID.
- Existing localStorage keys and store-generated UUID behavior remain unchanged.
- No action creates a duplicate Prompt unintentionally.
- No prompt parameter can overwrite user edits after the builder has initialized.

### Performance

- Prompt lookup and count reads are local synchronous operations and acceptable for the existing MVP data volume.
- Do not add network requests, polling, Suspense waterfalls, or new client data libraries.
- Prefer saved IDs over large URL payloads when a prompt is already persisted.

### Security and compatibility

- Treat URL parameters as untrusted text; decode defensively and avoid HTML injection.
- Keep prompt data local to the browser; no server or external transmission is introduced.
- Preserve compatibility with existing localStorage records and empty/corrupted storage fallbacks.
- If URL length limits become relevant, the saved-prompt ID path is the compatible fallback; no backend transfer mechanism is in scope.

### Plan-level clarification gate

Implementation should confirm the two marked decisions before coding: whether creation actions auto-save prompts, and how structured prompt content maps into AgentWizard fields. If no clarification is provided, use the assumptions stated in this plan and document that choice in the implementation summary.

# Plan AGE-14: Prompt Storage Layer — Remaining Implementation

## R — Requirements

Complete the gaps around the existing prompt localStorage CRUD and page scaffolding without replacing the current frontend-only architecture.

## Definition of Done

- `getAll()` returns prompts ordered by `updatedAt` descending.
- `/prompts` renders ordered cards, an empty state, and search matching title or tags.
- Prompt data supports `tags` and `version`; existing stored records remain readable with safe defaults.
- Cards render tags as badges and wire Delete to `store.remove()` with confirmation/feedback.
- `/prompts/[id]` displays every prompt section and provides Copy, Edit, Save, Back, and Delete actions.
- Missing IDs render the existing not-found state as a clear 404-style result.
- Dashboard Prompts count is read from `getAll()` and Recent Activity shows the latest three prompts.
- `npm run build` and `npm run lint` remain successful.

## Scope In

- Sorting, backward-compatible normalization, tags/version defaults, and prompt search support in `lib/prompts/`.
- List filtering, card badges/delete wiring, detail actions/edit mode, and dashboard prompt metrics/activity.
- Existing shadcn components and toast patterns only.

## Scope Out

- Backend/database persistence, authentication, cross-device sync, sharing, export, version history, and real AI generation.
- Full editing of generated section content unless explicitly required; current editor behavior remains title-focused.

## E — Environment

- Next.js 16.2 App Router with client-only localStorage access, React 19.2, strict TypeScript, Tailwind v4, base-nova shadcn/ui.
- Existing storage key: `agentstudio:prompts`; no new dependencies or test runner are configured.
- Required implementation skills: `.agents/skills/shadcn/SKILL.md` and `.agents/skills/vercel-react-best-practices/SKILL.md`.

## S — Structure (Architecture)

Data flow remains `localStorage → lib/prompts/store.ts → client page state → prompt components`. Pages continue as client components because browser storage is the source of truth.

### Files to modify

- `lib/prompts/types.ts` — add `tags: string[]` and `version: string`; update creation input/default expectations.
- `lib/prompts/store.ts` — normalize legacy records, default new records, sort `getAll()`, and expose title/tag search if consistent with the skills store.
- `components/prompt/PromptCard.tsx` — render tags and retain optional delete callback.
- `components/prompt/PromptEditor.tsx` — add read-only/detail mode, Copy, Edit/Save, Delete, and user feedback while preserving `PromptOutput`.
- `app/(dashboard)/prompts/page.tsx` — add query state, title/tag filtering, delete handling, and separate “no prompts” versus “no matches” states.
- `app/(dashboard)/prompts/[id]/page.tsx` — wire detail callbacks, refresh/remove navigation, and the missing-prompt 404-style presentation.
- `app/(dashboard)/dashboard/page.tsx` — derive prompt count and latest three prompts from the prompt store.

### Files to create

- None expected; reuse installed `AlertDialog`, `Input`, `Badge`, `Button`, `Card`, and toast primitives.

### Dependencies

- None.

## O — Operation (Edge cases)

### 1. Harden prompt model and retrieval

**Input:** Existing JSON records and `CreatePromptInput`.

**Output:** Valid `Prompt[]` with `tags`, `version`, and newest-first ordering.

1. Add the fields to `Prompt` and define creation defaults (`tags: []`, `version: "1.0.0"`).
2. Normalize parsed records so AGE-2 records missing the new fields do not break rendering or search.
3. Return a new sorted array from `getAll()` by valid `updatedAt` descending, with deterministic fallback for malformed dates.
4. Ensure update preserves immutable identity/creation fields and refreshes `updatedAt`.

**Edge cases:** missing/corrupt storage, absent tags/version, malformed timestamps, duplicate IDs, storage quota/private-mode failures, and empty arrays.

### 2. List, search, and delete prompts

**Input:** Query text and prompt IDs from `/prompts`.

**Output:** Filtered cards or the appropriate empty/no-match state.

1. Initialize and refresh prompts using the existing visibility listener.
2. Match a case-insensitive trimmed query against title and each tag; preserve store ordering.
3. Pass `handleDelete` to every `PromptCard`, confirm destructive deletion with the existing shadcn dialog pattern, remove from state, and toast success/failure.
4. Render tags as bounded, semantic `Badge` elements and retain accessible View/Delete controls.

**Edge cases:** whitespace-only query, no matches while records exist, legacy empty tags, delete of an already-removed ID, and failed persistence.

### 3. Detail actions and edit mode

**Input:** Prompt ID, prompt content, title edits, and user actions.

**Output:** Read-only full detail view; updated, copied, or deleted prompt.

1. Keep the detail page client-side and load via `getById`.
2. Show title, metadata/tags/version, and all `PromptOutput` sections before editing.
3. Add Copy using the same formatted section serialization as the generator and toast clipboard failures.
4. Enter edit mode for the editable title, save through `store.update`, update local state, and exit edit mode on success.
5. Confirm Delete, call `store.remove`, toast the result, and navigate to `/prompts` after success.
6. Render a clear “404 / Prompt not found” state with a Back to List action when `getById` returns null.

**Edge cases:** clipboard unavailable, empty title, prompt deleted in another tab, stale detail state after visibility changes, and save/delete storage failures.

### 4. Dashboard metrics and recent activity

**Input:** Current prompt storage contents.

**Output:** Real count and latest three prompt entries.

1. Import prompt `getAll()` alongside the existing agent store.
2. Initialize prompt count from the sorted prompt list rather than the static zero.
3. Render up to three recent prompts as links/cards using `updatedAt` ordering; retain the no-activity state for an empty store.
4. Refresh dashboard values when the document becomes visible so changes from prompt pages are reflected.

**Edge cases:** fewer than three prompts, deleted prompts, malformed legacy records, and storage unavailable.

## N — Navigability

- Follow the existing `components/prompt` and `lib/prompts` boundaries; keep persistence free of React dependencies.
- Mirror the search/delete/visibility/toast conventions already implemented in `app/(dashboard)/skills/page.tsx`.
- Use `FieldGroup`/`Field` for editable form controls, `gap-*` for layout, `size-*` for equal dimensions, semantic colors, and `data-icon` for button icons.
- Keep browser API access inside client components or the existing store boundary; do not introduce server actions or API routes.
- No logging infrastructure exists; use toast feedback for user-facing failures and silent store fallbacks for storage errors.
- No test runner is configured; verification is lint/build plus manual browser checks for CRUD, search, copy, delete, missing IDs, and dashboard refresh.

## S — Sign-off (Checklist)

- [ ] Legacy AGE-2 records load with empty tags and version `1.0.0`.
- [ ] New and updated records are ordered newest-first by `updatedAt`.
- [ ] List search matches title and tags and preserves empty/no-match states.
- [ ] Card tags, list delete, and confirmation/toasts work.
- [ ] Detail view shows all sections and Copy/Edit/Delete actions.
- [ ] Missing prompt shows the 404-style state and does not crash.
- [ ] Dashboard count and latest-three activity are derived from stored prompts.
- [ ] Existing generator save flow remains compatible with the expanded type.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

`[NEEDS CLARIFICATION: If AGE-14 requires a real HTTP 404 response or editing of generated sections/tags, confirm before implementation; both exceed the current client-only/title-editing scaffolding.]`

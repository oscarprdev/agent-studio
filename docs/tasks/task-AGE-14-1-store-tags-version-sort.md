# Task AGE-14-1: Store — Add Tags/Version Fields + Sort `getAll()`

## Reference

Plan: `docs/plans/plan-AGE-14-prompt-storage-missing.md`, Sections E (Environment), S (Structure), O (Operation §1)

## Description

Add `tags: string[]` and `version: string` to the `Prompt` type, normalize legacy AGE-2 records that lack these fields, sort `getAll()` by `updatedAt` descending, and ensure `create()` and `update()` assign sensible defaults. Store and API surface remain unchanged — this is a backward-compatible schema upgrade for `lib/prompts/`.

A single `normalize()` helper transforms raw parsed records: missing `tags` → `[]`, missing `version` → `"1.0.0"`, malformed `updatedAt` → `"1970-01-01T00:00:00.000Z"` (safe fallback for sort). The `create()` function populates `tags: []` and `version: "1.0.0"` automatically. `update()` preserves existing tags/version via the existing spread pattern.

## Acceptance Criteria

- `Prompt` type has `tags: string[]` and `version: string` fields.
- Every prompt read through `getAll()` carries `tags: string[]` and `version: string` (normalized if absent from storage).
- `getAll()` returns prompts sorted by `updatedAt` descending; ties broken by `createdAt` descending.
- New prompts created via `store.create()` default to `tags: []` and `version: "1.0.0"`.
- `update()` preserves existing `tags` and `version` (already handled by spread, no extra mutation needed).
- `npm run lint` passes (no TS errors).
- Existing stored prompts with no `tags`/`version` remain readable and render without crashes.

## Out of Scope

- Editing tags or version through the UI (Task 3 handles detail view; tags editing is explicitly out per plan).
- Version history or diffing (out of scope in plan).
- Exporting or sharing prompts.
- Tests (no test runner configured).

## Domain

Persistence layer — `lib/prompts/types.ts`, `lib/prompts/store.ts`

## Mermaid Graph

```mermaid
graph LR
  A[localStorage raw JSON] --> B[readAll]
  B --> C[normalize legacy records]
  C --> D[getAll sort by updatedAt DESC]
  D --> E[caller receives sorted Prompt[]]
```

## Structure

| File | Change |
|---|---|
| `lib/prompts/types.ts` | Add `tags: string[]` and `version: string` to `Prompt`. |
| `lib/prompts/store.ts` | Add `normalize()`, call it in `readAll()`, sort in `getAll()`, fill defaults in `create()`. |

## Operation

1. **`normalize(prompt: Prompt) → Prompt`**: If `tags` is absent/invalid → `[]`. If `version` is absent/invalid → `"1.0.0"`. If `updatedAt` fails `new Date()` → `"1970-01-01T00:00:00.000Z"`.
2. **`readAll()`**: Parse, filter `Array.isArray`, `.map(normalize)`.
3. **`getAll()`**: Return a **new array** from `[...prompts].sort(...)` descending by `updatedAt`, then `createdAt`.
4. **`create()`**: Spread defaults into returned `Prompt`.
5. **`update()`**: No code change needed — current spread already preserves `tags`/`version`.

### Edge cases handled

- Corrupt JSON → empty array (current behavior unchanged).
- `tags` present but not an array (e.g. a string) → `[]`.
- `version` present but empty string → `"1.0.0"`.
- `updatedAt` is a number or boolean → `"1970-01-01T00:00:00.000Z"`.
- Private-mode / full-ls quota exceptions in `create()` → still returns prompt object (current behavior unchanged).
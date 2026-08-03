# Task 002 — Implement Prompt Store CR

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 3: PromptStore CRUD

---

## Description

Build the localStorage persistence layer for prompts. This is a pure data layer module with no React dependencies — it can be unit-tested in isolation and later replaced by a real backend with a one-file swap.

Implements read/write operations with defensive error handling so localStorage failures (private browsing, quota exceeded, corrupted data) never crash the application. All operations return default values (empty array / null) on error.

---

## Acceptance Criteria

- `lib/prompts/store.ts` exists and exports six functions: `getAll`, `getById`, `create`, `update`, `remove`
- `STORAGE_KEY` constant is defined as `"agentstudio:prompts"`
- `getAll()` returns `Prompt[]` — empty array on missing/invalid localStorage
- `getById(id)` returns `Prompt | null` — null if not found
- `create(input)` returns a `Prompt` with auto-generated UUID, `createdAt` and `updatedAt` set to `new Date().toISOString()`
- `update(id, updates)` returns the updated `Prompt` — merges `updates` into existing, overwrites `updatedAt`
- `remove(id)` returns `boolean` — true if removal happened, false if not found
- All six functions handle errors gracefully (try/catch + return defaults)
- No functions throw unhandled exceptions — the module is exception-proof
- Imports types from `./types.ts`
- Private helper function `persist(prompts: Prompt[])` performs the single JSON.stringify → localStorage.setItem operation used by create/update/remove

---

## Out Of Scope

- React hooks or client-side integration
- Debounced or batched writes
- Undo/redo / history
- Validation of input data (store receives already-validated inputs from callers)
- Any UI components

---

## Domain

### localStorage Persistence Layer

A namespaced store that serializes prompt objects to the browser's localStorage under `agentstudio:prompts`.

Importance:

Acts as the single point of truth for prompt data. The abstraction lets the app swap localStorage for IndexedDB or an API later without touching components.

### Defensive Failure Mode

Every store function must return a sensible default on error rather than throwing.

Importance:

localStorage is unreliable (private mode, quota, corrupted data). A crash here would break every page regardless of whether prompts are actually affected.

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/prompts/store.ts` |
# Task 011 - Skill Store (localStorage CRUD)

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 2: SkillStore CRUD

---

## Description

Create the localStorage persistence layer for skills at `lib/skills/store.ts`.

This follows the exact pattern from `lib/prompts/store.ts` with the same API surface extended with `search()` and `duplicate()` operations. The store is a pure data layer with zero React dependencies, making it easy to swap for a real backend later.

Functions:

- `getAll()` — read all skills from localStorage
- `getById(id)` — find a skill by ID
- `create(input)` — create a new skill with UUID and timestamps
- `update(id, updates)` — merge updates, refresh `updatedAt`
- `remove(id)` — delete a skill
- `duplicate(id)` — clone a skill (new id, " (copy)" suffix, new timestamps)
- `search(query)` — filter by name, description, or tags

All functions wrap in try/catch and return safe defaults on localStorage failure.

---

## Acceptance Criteria

- File `lib/skills/store.ts` is created
- Exports: `getAll`, `getById`, `create`, `update`, `remove`, `duplicate`, `search`
- `STORAGE_KEY` constant equals `"agentstudio:skills"`
- `getAll()` returns `[]` on missing/invalid localStorage
- `getById(id)` returns the found skill or `null`
- `create(input)` generates UUID via `crypto.randomUUID()`, sets timestamps, persists, and returns the skill
- `update(id, updates)` merges updates preserving `id` and `createdAt`, refreshes `updatedAt`, persists, and returns the updated or `null`
- `remove(id)` deletes if found (returns `true`) or returns `false` if not found; persists filtered array
- `duplicate(id)` clones the skill with new UUID, name suffixed with " (copy)", fresh timestamps — original untouched
- `search(query)` filters by name, description, or tags (case-insensitive); empty query returns all
- All functions wrapped in try/catch with safe fallbacks (no throws to callers)
- Import types from `lib/skills/types.ts`
- JSDoc on all exported functions matching the store-style comments in prompts/store.ts

---

## Out Of Scope

- No React hooks or client-side state management
- No UI or component integration
- Real backend — this is localStorage only
- Pagination or sorting (not needed for MVP < 100 skills)

---

## Domain

### Storage Abstraction

`agentstudio:skills` is a namespaced localStorage key that prevents collisions with other app data (e.g., prompts use `agentstudio:prompts`). The abstraction is decoupled from React — when adding a real backend, only this file changes.

### Duplicate Operation

Duplicates create a fully independent copy. The original skill is never mutated. The clone gets a new UUID, fresh timestamps, and the suffix " (copy)" on the name.

Importance: Users iterate on skills by branching off existing ones without losing the original.

### Search Operation

Client-side substring matching across name, description, and tags using lowercase comparison. Empty query returns all skills.

Importance: Enables responsive search UX without a database — acceptable for MVP scale (< 100 skills).
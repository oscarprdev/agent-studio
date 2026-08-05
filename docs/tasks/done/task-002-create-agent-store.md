# Task 002 — Agent Store CRUD

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 3: AgentStore CRUD

---

## Description

Implement a localStorage-based persistence layer for agent data. The store is a pure data layer with no React dependencies — it can be swapped for a real backend later by changing one file.

Provides five operations: `getAll`, `getById`, `create`, `update`, `remove`. Uses the key `agentstudio:agents` to namespace from other features.

---

## Acceptance Criteria

- `lib/agents/store.ts` exists as a pure TypeScript file (no React imports, no `"use client"`)
- Defines `STORAGE_KEY = "agentstudio:agents"` constant
- Exports `getAll(): Agent[]` — returns all agents, empty array on missing/invalid localStorage
- Exports `getById(id: string): Agent | null` — finds agent by id or returns null
- Exports `create(input: CreateAgentInput): Agent` — generates UUID, sets timestamps, persists, returns agent
- Exports `update(id: string, updates: Partial<Agent>): Agent | null` — merges updates, sets updatedAt, persists
- Exports `remove(id: string): boolean` — filters out by id, persists, returns true/false
- All public functions wrap in try/catch and return safe defaults on failure
- `create` uses `crypto.randomUUID()` for id generation
- `create` sets `createdAt` and `updatedAt` to current ISO timestamp
- `update` preserves `createdAt` and generates new `updatedAt`
- `update` preserves `id` field (never overwritten by caller)
- Has a private `persist(agents: Agent[])` helper that JSON.stringify and setItem
- Has a private `readAll()` helper that JSON.parse with error handling
- Follows existing patterns from `lib/prompts/store.ts`

---

## Out Of Scope

- React hooks or hooks integration
- React state management
- Toast notifications
- Error boundary wrapping

---

## Domain

### localStorage Persistence

The MVP uses browser localStorage for persistence. The store abstracts away the persistence mechanism so a future backend swap requires changing only this one file.

Importance:

Provides data durability across page refreshes while keeping the React layer unchanged. The store pattern means components call the same API regardless of storage backend.

### Namespace Isolation

Data for agents is stored under the key `agentstudio:agents` to prevent collisions with other feature data (e.g., prompts, settings).

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/agents/store.ts` |
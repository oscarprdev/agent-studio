# Task 018 — Canonical Skill Types

## Reference

Plan document:

docs/plans/plan-001-skills-feature.md

Relevant section:

Phase 1 — Normalize the domain and store (steps 1–3)

---

## Description

Replace the existing generator-oriented `Skill` entity in `lib/skills/types.ts` with the canonical MVP shape defined in the PRD. The new shape has flat fields (`name`, `description`, `instructions`, `tools`, `created_by`) plus immutable metadata (`id`, `createdAt`, `updatedAt`).

Create a `CreateSkillInput` type that includes only the mutable/domain fields — callers must not supply `id`, `createdAt`, or `updatedAt`.

Then remove the competing `Skill` declaration from `lib/agents/types.ts` and re-export the canonical `Skill` type from `lib/skills/types` so existing agent code that imports from `lib/agents/types` still compiles.

This task is purely type definition — no store logic, no UI changes.

---

## Acceptance Criteria

- `lib/skills/types.ts` exports:
  - `Skill` interface with exactly these fields: `id: string`, `name: string`, `description: string`, `instructions: string`, `tools: string[]`, `created_by: string`, `createdAt: string`, `updatedAt: string`
  - `CreateSkillInput` type that omits `id`, `createdAt`, and `updatedAt` from `Skill`
- `lib/agents/types.ts` no longer defines its own `Skill` interface
- `lib/agents/types.ts` re-exports `Skill` and `CreateSkillInput` from `@/lib/skills/types` so existing imports continue to resolve
- `npm run lint` passes (no TypeScript errors)
- `npm run build` passes (no type errors anywhere in the repo)
- All existing imports of `Skill` from `lib/agents/types` still resolve (verified by build)
- `SkillContent` interface and `SkillContentKey` type are removed from `lib/skills/types.ts` (the old generator shape is fully replaced)

---

## Out Of Scope

- Store implementation — handled in Task 019
- UI component updates — handled in Tasks 020–024
- SkillGenerator / SkillOutput updates — handled in later tasks
- Migration of existing localStorage data — handled as a separate concern if approved
- `created_by` value resolution — the plan marks `[NEEDS CLARIFICATION]`; for this task, use a placeholder string `"local-user"` as the sentinel value

---

## Domain

### Canonical Skill Entity

The canonical Skill is a first-class reusable AI capability. It is independent from agents — an agent references a snapshot of skills, but does not own them.

```
Skill {
  id: string            // unique, immutable, store-generated
  name: string          // required, user-provided
  description: string   // required, user-provided
  instructions: string  // user-provided, may be empty
  tools: string[]       // tool IDs from TOOL_CANDIDATES
  created_by: string    // "local-user" sentinel for MVP
  createdAt: string     // ISO 8601, generated on create, immutable
  updatedAt: string     // ISO 8601, updated on every successful update
}

CreateSkillInput {
  name: string
  description: string
  instructions: string
  tools: string[]
  created_by?: string   // optional, defaults to "local-user"
}
```

Importance: This is the single source of truth for the Skill entity. All components, stores, and agent integration must use this type. The old generator-oriented shape (with `input`, `content: SkillContent`, `tags`, `triggers`, `expectedOutput`, `rules`) is replaced entirely.

---

## Files

| Action | Path |
|--------|------|
| Modify | `lib/skills/types.ts` |
| Modify | `lib/agents/types.ts` |
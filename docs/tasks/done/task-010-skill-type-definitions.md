# Task 010 - Skill Type Definitions

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 1: GetSkillTypes

---

## Description

Create the TypeScript type definitions for the Skill domain in `lib/skills/types.ts`.

This is the foundational layer — every other task (store, mock generator, components, pages) depends on these types. The structure mirrors the existing `Prompt`/`PromptSections` types from `lib/prompts/types.ts` for consistency with the established pattern.

Types to define:

- `SkillContent` — the structured sections of a generated skill
- `Skill` — the full persisted entity with metadata
- `CreateSkillInput` — the subset of `Skill` fields required for creation
- `SkillContentKey` — a union literal type for iterating over skill content sections

---

## Acceptance Criteria

- File `lib/skills/types.ts` is created with kebab-case naming
- Exports `SkillContent` interface with fields: `name` (string), `description` (string), `instructions` (string), `triggers` (string[]), `tools` (string[]), `expectedOutput` (string), `rules` (string)
- Exports `Skill` interface with fields: `id` (string), `name` (string), `description` (string), `input` (string), `content` (SkillContent), `tags` (string[]), `createdAt` (string), `updatedAt` (string)
- Exports `CreateSkillInput` covering at minimum `name`, `input`, `content`, and `tags`
- Exports `SkillContentKey` as a union of the 7 `SkillContent` keys (e.g., `"name" | "description" | "instructions" | "triggers" | "tools" | "expectedOutput" | "rules"`)
- `triggers`, `tools`, and `tags` are typed as `string[]` (never optional/undefined)
- `rules` and `instructions` are typed as `string` (newline-separated, not arrays)
- All TypeScript compiles cleanly with strict mode
- JSDoc comments present on all exported types

---

## Out Of Scope

- Store implementation is handled in task 011
- Mock AI generation is handled in task 012
- No UI components in this task
- No runtime validation — types only, TypeScript-level guarantees

---

## Domain

### Skill

A reusable AI capability definition. A skill describes what an AI agent should do, how it should do it, what tools it needs, and what output it produces.

Importance: Skills are one of the three core MVP pillars of AI Agent Studio (alongside Prompts and Agents). They represent structured, reusable knowledge that developers can generate, save, edit, duplicate, and export.

### SkillContent

The structured, machine-readable representation of a generated skill. It breaks a skill into named sections that map directly to UI components and the markdown export format.

Importance: `SkillContent` is the core data structure the app generates from user input. Each section renders in the SkillOutput component, is editable in SkillEditor, and is exportable as formatted markdown.

### CreateSkillInput

The minimal data set required to create a new skill. It is a subset of `Skill` that excludes auto-generated fields like `id`, `createdAt`, and `updatedAt`.

Importance: Separates user-provided data from system-managed metadata, following the same `CreatePromptInput` pattern from the prompt generator.
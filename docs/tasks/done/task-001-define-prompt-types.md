# Task 001 — Define Prompt Types

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 1: GetPromptTypes

---

## Description

Create the TypeScript type definitions for the Prompt domain model. This is the foundation file that all subsequent tasks depend on — every component, store, and route imports types from here.

Defines three exported types:

- `PromptSections` — the structured prompt sections (role, objective, tools, workflow, rules, output)
- `Prompt` — the full prompt entity with metadata (id, title, input, content, timestamps)
- `CreatePromptInput` — a write-only subset used by the store's create method

The `PromptSectionKey` union type is exported as a helper for iterating over sections without hardcoding strings elsewhere.

---

## Acceptance Criteria

- `lib/prompts/types.ts` exists and exports `PromptSections`, `Prompt`, `CreatePromptInput`, and `PromptSectionKey`
- `PromptSections` has all six section keys: `role`, `objective`, `tools`, `workflow`, `rules`, `output`
- `Prompt` has six required fields: `id` (string), `title` (string), `input` (string), `content` (PromptSections), `createdAt` (string), `updatedAt` (string)
- `tools` and `workflow` are typed as `string[]` (arrays, never `null` or `undefined`)
- `CreatePromptInput` omits `id`, `content`, `createdAt`, `updatedAt` — only has `title` and `input`
- `PromptSectionKey` equals `"role" | "objective" | "tools" | "workflow" | "rules" | "output"`
- File compiles with no TypeScript errors

---

## Out Of Scope

- Store persistence logic
- Validation logic (types only, no schema validation)
- Any React components
- JSDoc comments (not required per plan norms)

---

## Domain

### Prompt

Represents a single AI-generated prompt with a natural-language description and structured output sections.

Importance:

The Prompt is the core domain entity. Every page, component, and store operation revolves around it.

### PromptSections

The six-section breakdown of a professional AI prompt: ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, OUTPUT.

Importance:

This structured format is the value proposition — transforming a rough description into a production-ready prompt.

### CreatePromptInput

Write-only shape for creating prompts without auto-generated metadata.

Importance:

Prevents callers from supplying `id` or timestamps, which the system must generate.

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/prompts/types.ts` |
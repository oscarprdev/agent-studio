# Task 014 - SkillGenerator Component

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 5: SkillGenerator Component

---

## Description

Create the main skill generation UI component at `components/skill/SkillGenerator.tsx`. This is the primary interaction point where users describe a skill and receive structured output.

Mirrors the pattern from `components/prompt/PromptGenerator.tsx` exactly:

- `FieldGroup` + `Field` + `Textarea` for user input
- `Button` with `Spinner` + `disabled` during generation
- `SkillOutput` renders the generated result
- `Copy` button using `navigator.clipboard.writeText()` with toast feedback
- `Save Skill` button using `store.create()` with toast + navigation to `/skills`
- Uses `useRouter()` for navigation
- Guards against double-click: ignores second call while first is in progress

The component manages local state for input, loading, and the generated result. On save, it creates a title from the first 60 chars of the input text and navigates to the skills list.

---

## Acceptance Criteria

- File `components/skill/SkillGenerator.tsx` is created
- Has `"use client"` directive
- Exports `SkillGenerator` with optional prop `{ onGenerate?: (skill: Skill) => void }`
- Imports `FieldGroup`, `Field`, `FieldLabel` from `@/components/ui/field`
- Imports `Textarea` from `@/components/ui/textarea`
- Imports `Button` from `@/components/ui/button`
- Imports `Spinner` from `@/components/ui/spinner`
- Imports `toast` from `@/components/ui/toast`
- Imports `SkillOutput` from `@/components/skill/SkillOutput`
- Imports `generateSkill` from `@/lib/ai/generate-skill`
- Imports store from `@/lib/skills/store`
- Imports `useRouter` from `next/navigation`
- Render `FieldGroup` > `Field` > `FieldLabel` + `Textarea` with example placeholder
- Placeholder text: "e.g. Create a skill that reviews code for security vulnerabilities..."
- Button disabled when input is empty or generation is in progress
- Button shows `Spinner` with `data-icon="inline-start"` during loading
- On generate: calls `generateSkill({ description })`, stores result in state, shows success toast
- On error: shows error toast "Generation failed"
- Generates title as `input.trim().slice(0, 60)` when saving
- Copy button formats skill as markdown and writes to clipboard via `navigator.clipboard.writeText()`
- Copy on success: toast "Copied to clipboard" (type: success)
- Copy on error: toast "Failed to copy" (type: error)
- Save button calls `store.create({ title, input, content, tags: [] })`
- Save on success: toast "Skill saved", navigates to `/skills`
- Save on error: toast "Failed to save" (type: error)
- `SkillOutput` renders only when result is available
- Double-click guard: second generate call ignored while in progress

---

## Out Of Scope

- Skill editing (handle in SkillEditor, task 016)
- Skill list display (handled in SkillCard + pages, tasks 015/018)
- Duplicate/export operations (handled in SkillEditor, task 016)
- Tag editing UI (tags default to empty array in MVP)

---

## Domain

### SkillGenerator

The core interaction point for skill creation. Users describe what they want in natural language, the mock AI generates structured content, and the user can preview, copy, or save it.

Importance: This is the primary feature page — the "Skill Generator" that users will use most frequently. It follows the exact PromptGenerator pattern so existing developers can work on it without relearning the interaction model.

### Title Derivation

When saving, the skill's title defaults to the first 60 characters of the user's input text. This mirrors the PromptGenerator behavior and ensures every saved skill has a meaningful name even if the user never explicitly edits it.
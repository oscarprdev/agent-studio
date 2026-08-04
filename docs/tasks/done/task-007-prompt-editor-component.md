# Task 007 — PromptEditor Component

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 7: PromptEditor Component

---

## Description

Create the full prompt detail/editor view. This component renders an editable form with the prompt title and the structured content sections. Users can modify the title and save changes back to the store.

The content sections are rendered read-only via `PromptOutput` (editing content is a future enhancement). The title is editable via an `Input` field. Save triggers `store.update()` with the modified title.

---

## Acceptance Criteria

- `components/prompt/PromptEditor.tsx` exists with `"use client"` directive
- Imports and uses: `FieldGroup`, `Field`, `Input`, `Textarea`, `Button`, `Link` from next.js
- Imports `store` from `@/lib/prompts/store`
- Imports `PromptOutput` from `./PromptOutput`
- Accepts props: `{ prompt: Prompt onSave?: (prompt: Prompt) => void }`
- Renders an editable `Input` for the prompt title with `Field` wrapper
- Renders read-only `PromptOutput` showing all six content sections
- "Save Changes" button calls `store.update(prompt.id, { title: updatedTitle })`, shows toast on success
- "Back to List" link navigates to `/prompts`
- Uses `useState` for local title edits, syncs to store only on explicit save
- `updatedAt` is set by the store on update (component does not manipulate timestamps)
- If prompt is missing/null → shows a "Prompt not found" message instead of the editor
- Uses `cn()` for class merging
- Uses `gap-*` for spacing (never `space-*`)
- Save with no title changes still triggers an update (refreshes `updatedAt`)

---

## Out Of Scope

- Editing individual content sections (role, objective, etc.) — content is read-only in this MVP
- Content validation — title is the only editable field
- Autosave or draft logic
- Delete from within the editor (handled on list page)
- Version history or undo

---

## Domain

### Prompt Editor

A detail view where users can read the full generated prompt and modify its title.

Importance:

After saving a prompt from the generator, users need a place to revisit and rename it. The editor provides read-only access to the generated content with editable metadata.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/prompt/PromptEditor.tsx` |
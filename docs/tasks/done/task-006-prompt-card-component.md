# Task 006 — PromptCard Component

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 6: PromptCard Component

---

## Description

Create a card component used on the prompt list page to display saved prompts at a glance. Each card shows the prompt title (truncated), creation date, a snippet of the original input, and action buttons (View and Delete).

This is a pure presentational component that delegates interactivity to parent handlers. It never calls the store directly — all mutations flow through callbacks.

---

## Acceptance Criteria

- `components/prompt/PromptCard.tsx` exists with `"use client"` directive
- Imports and uses: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge`, `Link` from next.js
- Accepts props: `{ prompt: Prompt onDelete?: (id: string) => void }`
- Renders `CardHeader` with truncated title (max 60 chars) and created date
- Renders `CardContent` with a snippet of the original `input` (max 120 characters, `line-clamp-2`)
- Footer area contains:
  - "View" button that wraps in `Link` navigating to `/prompts/[prompt.id]`
  - "Delete" button that calls `onDelete(prompt.id)` when clicked
- Long title uses CSS `truncate` class
- Uses `gap-*` for spacing (never `space-*`)
- Uses `cn()` for class merging
- Delete action is delegated — the component does not call the store directly
- No console.log, no side effects

---

## Out Of Scope

- Confirmation dialog for delete (parent handles this)
- Bulk delete actions
- Sorting or filtering
- Pagination (handled by list page)
- Inline editing from the card

---

## Domain

### PromptCard

A compact card representation of a saved prompt, used in list views.

Importance:

This is how users browse their saved prompts — the card must quickly communicate what each prompt is about (title, date, snippet) so the user can decide which one to open.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/prompt/PromptCard.tsx` |
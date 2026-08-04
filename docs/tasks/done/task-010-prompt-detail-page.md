# Task 010 — Prompt Detail Page (`/prompts/[id]`)

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 8: Pages

---

## Description

Create the dynamic route page for viewing and editing a specific prompt. This page reads the `id` from the URL params, loads the prompt from the store, and renders the `PromptEditor` component.

If the prompt is not found (deleted, corrupted ID), the page shows a "prompt not found" message with a link back to the list.

---

## Acceptance Criteria

- `app/prompts/[id]/page.tsx` exists
- Page is a client component (`"use client"`) because it reads params and loads data
- Reads dynamic segment using `useParams()` from `next/navigation`
- Imports `store` from `@/lib/prompts/store`
- On mount, calls `store.getById(params.id)` to load the prompt
- Renders `<PromptEditor prompt={prompt} />` when prompt is found
- Shows a "Prompt not found" message with a "Back to List" link when prompt is null/not found
- Handles loading/async state gracefully (params resolution is synchronous in Next.js App Router with useParams)
- Page has a title/header with the prompt title
- Uses `gap-*` for spacing (never `space-*`)
- Responsive layout — works on mobile and desktop
- The page structure exports a default component (standard Next.js pattern)

---

## Out Of Scope

- Editable content sections (title is the only editable field — handled in PromptEditor)
- Delete button on the detail page
- Loading skeleton (store is synchronous)
- Breadcrumb navigation
- Share links with deep links

---

## Domain

### Prompt Detail

A single prompt's full view where users can read the generated content and edit the title.

Importance:

This is the deep-dive view — the landing page when a user clicks into a saved prompt. It must provide full context (all sections) plus a way to save any changes.

---

## Files

| Action | Path |
|--------|------|
| Create | `app/prompts/[id]/page.tsx` (creates `app/prompts/[id]/` dir) |
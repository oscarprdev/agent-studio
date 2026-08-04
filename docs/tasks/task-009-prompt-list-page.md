# Task 009 — Prompt List Page (`/prompts`)

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 8: Pages

---

## Description

Create the prompt list page. This is a client component that loads prompts from the store on mount, renders a grid of `PromptCard` components, and shows an `Empty` state when no prompts exist.

The page also provides a "New Prompt" button that navigates to the generator page.

---

## Acceptance Criteria

- `app/prompts/page.tsx` exists
- Page is a client component (`"use client"`) because it loads data from the store on mount
- Imports `useEffect` and `useState` from React
- Imports `store` from `@/lib/prompts/store`
- On mount (`useEffect`), loads prompts via `store.getAll()` and stores in state
- Renders `PromptCard` for each prompt in a responsive grid layout
- Renders an `Empty` component with a message and CTA when the store returns an empty array
- "New Prompt" button links to `/prompts/new`
- Page has a title/header "My Prompts" (or similar)
- Uses `gap-*` for spacing (never `space-*`)
- Responsive layout: single column on mobile, multi-column grid on desktop
- Loading state not required (store is synchronous, data is available immediately)
- Handles render gracefully if store returns null (defensive — though store always returns array)

---

## Out Of Scope

- Pagination (acceptable to list all prompts — localStorage is MVP)
- Sorting or filtering by date/title
- Delete from the list page (PromptCard delegates to parent, but delete confirmation on list is a future enhancement)
- Bulk actions
- Prompt search

---

## Domain

### Prompt List

A browsable list of all saved prompts with quick-glance information.

Importance:

This is the hub where users manage their prompts. Without a list page, saved prompts have no discoverability.

---

## Files

| Action | Path |
|--------|------|
| Create | `app/prompts/page.tsx` |
| shadcn install | `npx shadcn@latest add empty` (runs before this task) |
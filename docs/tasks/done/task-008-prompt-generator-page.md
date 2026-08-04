# Task 008 — Prompt Generator Page (`/prompts/new`)

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 8: Pages

---

## Description

Create the RSC wrapper page for the prompt generator route. This page is a thin React Server Component that sets metadata and renders the client-side `PromptGenerator` component.

---

## Acceptance Criteria

- `app/prompts/new/page.tsx` exists
- Page is a React Server Component (no `"use client"` directive on the page itself)
- Sets page metadata: `title = "New Prompt | AI Agent Studio"`, with appropriate description
- Renders `<PromptGenerator />` client component inside the page
- Uses the `PromptGenerator` component from `@/components/prompt/PromptGenerator`
- The page structure follows app router patterns (export default function)
- Layout wrapper provides a clean container: centered max-width, padding, proper spacing
- Responsive layout — works on mobile (single column) and desktop (reasonable max-width)

---

## Out Of Scope

- PromptGenerator component content (handled in task 005)
- Page loading states
- SEO metadata beyond basic title/description
- Auth guards

---

## Domain

### Page Route

The `/prompts/new` route is where users start a new prompt generation session.

Importance:

This is the entry point for the feature — the first page a user lands on when they want to generate a prompt.

---

## Files

| Action | Path |
|--------|------|
| Create | `app/prompts/new/page.tsx` (creates `app/prompts/new/` dir) |
# Task 011 — Navigation Link on Homepage

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 8: Pages → Files To Modify

---

## Description

Add a navigation link on the homepage that routes users to the new `/prompts/new` page. The homepage already has a layout with buttons — this task adds a new link styled consistently with the existing ones.

This is the final integration step: all routes exist, all components are built, and the navigation link connects the existing homepage to the new feature.

---

## Acceptance Criteria

- `app/page.tsx` has a new navigation link to `/prompts/new`
- Link text says something appropriate (e.g., "Generate a Prompt" or "AI Prompt Generator")
- Link is styled consistently with existing navigation buttons on the homepage (same `h-12`, `rounded-full`, `px-5` sizes)
- Uses `Link` from `next/link` for client-side navigation rather than plain `<a>` tag
- Link appears in the existing navigation row (the `<div>` with `flex flex-col gap-4 sm:flex-row`)
- Homepage still compiles without errors after modification
- No other existing functionality is broken by the change

---

## Out Of Scope

- Sidebar navigation (out of scope for AGE-2)
- Multiple navigation items
- Navigation highlighting / active state
- Header / navbar component creation

---

## Domain

### Homepage Integration

The existing Next.js scaffold homepage becomes the entry point to the AI Prompt Generator feature.

Importance:

Without navigation, users have no way to discover the new feature from the landing page. This links the existing entry point to the new `/prompts/new` route.

---

## Files

| Action | Path |
|--------|------|
| Modify | `app/page.tsx` |
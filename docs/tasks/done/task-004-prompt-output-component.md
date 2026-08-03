# Task 004 — PromptOutput Component

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 4: PromptOutput Component

---

## Description

Create a presentational-only component that renders structured prompt sections (ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, OUTPUT) with consistent styling. This is the display layer used by both the generator output preview and the editor view.

Each section renders with a `Badge` label and content area. Lists use numbered items for workflow and bullet items for rules. Long text uses `whitespace-pre-wrap` to preserve line breaks. Empty sections show "Not specified" in muted text.

This component has no state and no interactivity — it owns only rendering logic.

---

## Acceptance Criteria

- `components/prompt/PromptOutput.tsx` exists with `"use client"` directive
- Accepts props: `{ content: PromptSections; className?: string }`
- Uses `cn()` for class merging from `@/lib/utils`
- Renders six section blocks in order: ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, OUTPUT
- ROLE renders as a single paragraph
- OBJECTIVE renders as a single paragraph
- TOOLS renders as an inline list of `Badge` components
- WORKFLOW renders as a numbered list with `Separator` between items
- RULES renders as a bulleted list
- OUTPUT renders as a single paragraph
- Any section with empty/whitespace-only content displays "Not specified" in muted text
- Text content uses `whitespace-pre-wrap` for long passages
- Uses `flex flex-col gap-4` for section spacing (never `space-y-*`)
- Works with `cn()` passed className
- Uses shadcn `Badge` component for section labels
- No `console.log`, no side effects, no state

---

## Out Of Scope

- Markdown rendering (content is plain text)
- Copy-to-clipboard (handled by parent)
- Editing capability (handled by PromptEditor)
- Loading states (handled by Skeleton in parent)

---

## Domain

### PromptOutput

A pure display component that visualizes the six structured sections of an AI prompt.

Importance:

This is the visual representation of the product's output — it must clearly render ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, and OUTPUT so the user can read and use the generated prompt.

### Section Rendering Patterns

Each section type has a distinct visual treatment: paragraphs for prose, badges for tool tags, numbered lists for steps, bullets for rules.

Importance:

Visual distinction between section types helps the user scan and understand the structured prompt quickly.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/prompt/PromptOutput.tsx` (creates `components/prompt/` dir) |
| shadcn install | `npx shadcn@latest add badge separator` (runs before this task) |
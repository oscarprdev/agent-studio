# Task 005 — PromptGenerator Component

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 5: PromptGenerator Component

---

## Description

Build the main generator UI — the heart of the AGE-2 feature. This container component manages the user interaction flow: textarea input → generate button → loading state → structured output preview → save/copy actions.

It composes `PromptOutput`, `Textarea` (from shadcn), and provides the interactive states (idle → loading → result). On generate, it calls the mock AI function, shows loading UI, then renders the output. On save, it persists to the store and navigates to the list page. On copy, it writes to clipboard and shows a toast.

---

## Acceptance Criteria

- `components/prompt/PromptGenerator.tsx` exists with `"use client"` directive
- Imports and uses: `FieldGroup`, `Field`, `Textarea`, `Button`, `PromptOutput` from the project
- Imports `generatePrompt` from `@/lib/ai/generate-prompt`
- Imports `store` from `@/lib/prompts/store`
- Imports `useRouter` from `next/navigation`
- Renders a `Textarea` inside `FieldGroup`/`Field` with example placeholder text
- "Generate Prompt" button is disabled when textarea is empty (whitespace-only counts as empty)
- Clicking "Generate" calls `generatePrompt(textareaValue)`, stores result in state, and disables the button during loading
- While loading: button shows a `Spinner` icon and is disabled (or equivalent loading indicator)
- After generate: renders `PromptOutput` with the generated content and class
- Copy-to-clipboard button: calls `navigator.clipboard.writeText()` with the full prompt content as formatted text, shows toast on success
- Save Prompt button: calls `store.create({ title, input: textareaValue })`, shows toast, navigates to `/prompts` after save
- If copy fails → shows error toast
- If save fails → shows error toast with retry
- Accepts optional `onGenerate?: (prompt: Prompt) => void` callback prop
- Uses `cn()` for class merging
- Uses `gap-*` for spacing (never `space-*`)

---

## Out Of Scope

- Title editing (prompt title is derived from input or editable in the editor page)
- History of previous generations
- Prompt versioning
- Real AI API calls
- Markdown rendering within the output

---

## Domain

### Prompt Generator

The primary interaction flow where users input a natural-language description and receive a structured, professional prompt.

Importance:

This is the top-of-funnel experience — the feature's core value. If generation doesn't work, nothing else functions.

### Copy-and-Save Actions

Post-generation utilities that let the user capture the generated prompt immediately.

Importance:

The generated prompt has no value unless the user can export it. Copy and Save are the two primary capture mechanisms.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/prompt/PromptGenerator.tsx` |
| shadcn install | `npx shadcn@latest add textarea` (runs before this task) |
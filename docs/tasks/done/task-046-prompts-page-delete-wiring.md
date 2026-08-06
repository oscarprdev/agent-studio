# Task 046 — Prompts Page Delete Wiring (handleDelete, toast, refresh)

## Reference

Plan document:
`docs/plans/plan-046-add-delete-prompt-functionality.md`

Relevant sections:
- Operation 2: Delete Prompt From List
- R — Requirements (Definition of Done 4–6)
- A — Approach (step 3–5)
- R — Scope In: "Wire prompt deletion, list refresh, and success/error toasts in the prompts page"

---

## Description

Wire the `handleDelete` function on the prompts list page, connecting the `remove()` call from `@/lib/prompts/store` with success/error toast feedback and React state refresh. Pass the callback as `onDelete` to every rendered `PromptCard`.

This mirrors the exact pattern in `app/(dashboard)/agents/page.tsx` for agent deletion, adapted for prompts.

---

## Files

| Action | Path |
|--------|------|
| Modify | `app/(dashboard)/prompts/page.tsx` |
| Read (reference) | `app/(dashboard)/agents/page.tsx` |
| Read (source) | `lib/prompts/store.ts` |
| Read (reference) | `components/ui/toast.tsx` |

---

## Exact Changes Required

### File: `app/(dashboard)/prompts/page.tsx`

1. **Add imports** alongside existing imports:

```tsx
import { getAll, remove } from "@/lib/prompts/store"
```
Change existing `import { getAll } from "@/lib/prompts/store"` to include `remove`.

Add new import:
```tsx
import { toast } from "@/components/ui/toast"
```

2. **Add `handleDelete` function** inside the `PromptsPage` component, after the `useEffect` and before the `return`:

```tsx
function handleDelete(id: string) {
  const prompt = prompts.find((p) => p.id === id)
  try {
    const removed = remove(id)
    if (removed) {
      setPrompts(getAll())
      toast.add({ title: `Deleted "${prompt?.title ?? "prompt"}"`, type: "success" })
    } else {
      toast.add({ title: "Failed to delete prompt", type: "error" })
    }
  } catch {
    toast.add({ title: "Failed to delete prompt", type: "error" })
  }
}
```

This logic:
- Finds the prompt by ID in current React state before removal (so title is available for the success message)
- Calls `remove(id)` from the store (returns `boolean` — `true` if a prompt was removed, `false` if not found)
- On success (`true`): refreshes list via `setPrompts(getAll())` and shows success toast with title "Deleted "{prompt title}""
- On failure (`false`): shows error toast "Failed to delete prompt"
- On unexpected error: shows error toast "Failed to delete prompt"
- Uses agents-page fallback title `"prompt"` when the prompt is not found in state

3. **Pass `onDelete` to each PromptCard** in the mapping section:

Change:
```tsx
<PromptCard key={prompt.id} prompt={prompt} />
```
To:
```tsx
<PromptCard key={prompt.id} prompt={prompt} onDelete={handleDelete} />
```

---

## Acceptance Criteria

- [ ] `remove` imported from `@/lib/prompts/store` alongside existing `getAll` import
- [ ] `toast` imported from `@/components/ui/toast`
- [ ] `handleDelete(id: string)` function defined inside `PromptsPage` component
- [ ] `handleDelete` finds the prompt by ID from React state before calling `remove()` (needed for title in toast)
- [ ] `handleDelete` calls `remove(id)` inside a `try/catch` block
- [ ] On `remove()` returning `true`: refreshes list with `setPrompts(getAll())` and shows `toast.add({ title: \`Deleted "${prompt?.title ?? "prompt"}"\`, type: "success" })`
- [ ] On `remove()` returning `false`: shows `toast.add({ title: "Failed to delete prompt", type: "error" })`
- [ ] On exception caught: shows `toast.add({ title: "Failed to delete prompt", type: "error" })`
- [ ] `onDelete={handleDelete}` passed to every `PromptCard` in the map
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

---

## Out Of Scope

- AlertDialog composition on PromptCard (Task 046-1)
- Store layer changes
- Changes to agents / skills pages
- Adding a test runner or automated tests (none is configured)

---

## Domain

### Prompt List (Deletion Wiring)

The list page owns the collection state and delegates per-card actions to child components. When a user confirms delete on a card, the page must:
1. Remove the prompt from persistent storage (localStorage via store)
2. Update React state to reflect the change in the UI
3. Communicate the outcome to the user via toast

The pattern must follow the agents page exactly to maintain consistency. A missing prompt in React state (e.g. another tab modified localStorage) should result in a failure toast, not a crashed page.
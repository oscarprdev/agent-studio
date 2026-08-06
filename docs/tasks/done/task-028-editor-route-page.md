# Task 028: Editor Route Page

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **S — Structure** (Files to create), **O — Operations** /Operation 6

## Objective

Create a client-side route at `/prompts/[id]/editor/page.tsx` that loads the prompt by route ID, renders the `PromptEditor` component, and handles the missing-prompt state with a stable not-found message.

## Context

- **New file**: `app/prompts/[id]/editor/page.tsx`
- The plan explicitly notes: "It is intentionally outside `(dashboard)` per the issue; confirm whether it must still share dashboard shell/auth before implementation."
- The existing dashboard layout `(dashboard)/layout.tsx` provides auth guard, sidebar, and mobile header.
- Since this is `app/prompts/` (no `(dashboard)` group), the editor page will NOT be wrapped by the dashboard layout.
- This means the editor page is a **standalone route** without dashboard chrome (sidebar/auth).
- The plan asks for confirmation: "confirm whether it must still share dashboard shell/auth boundary despite its required filesystem location." This ambiguity is noted as a product decision in the plan.
- For MVP: implement the page **outside** the dashboard group (no sidebar, no auth guard). If dashboard shell is needed later, move the route under `(dashboard)/prompts/` — the code structure will be identical.
- The page must be a **client component** (`export default function ... "use client"` is not correct for Next.js App Router — the file just needs `"use client"` at the top, and components inside it need `"use client"` unless they're client components by themselves).

Wait, in Next.js App Router, a page file is a component. To make it a client component, add `"use client"` as the first line. Then the page loads data and passes it to the `PromptEditor`.

### Route structure

```
app/prompts/[id]/editor/page.tsx
```

### Data loading

The prompt data is read from localStorage on the client (synchronous store). No server-side fetching needed.

```tsx
"use client"

import { useParams } from "next/navigation"
import { getById } from "@/lib/prompts/store"
import { PromptEditor } from "@/components/prompt/PromptEditor"

export default function EditorPage() {
  const params = useParams<{ id: string }>()
  const prompt = getById(params.id)

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-5xl flex-col gap-6">
        {prompt ? (
          <PromptEditor prompt={prompt} />
        ) : (
          <MissingPromptState />
        )}
      </div>
    </div>
  )
}
```

## Steps

1. Create `app/prompts/[id]/editor/page.tsx`.
2. Add `"use client"` directive as the first line.
3. Import `useParams` from `next/navigation`.
4. Import `getById` from `@/lib/prompts/store`.
5. Import `PromptEditor` from `@/components/prompt/PromptEditor`.
6. Import `Button` from `@/components/ui/button` and `Link` from `next/link` for missing state.
7. Create an internal `MissingPromptState` component that renders:
   - A message: "Prompt not found"
   - A "Back to Prompts" button linking to `/prompts`
8. Implement the page component:
   - Read `params.id` from `useParams()`.
   - Load prompt via `getById(params.id)`.
   - Render `PromptEditor` with the loaded prompt.
   - Render `MissingPromptState` if prompt is null.
9. Do NOT wrap in a dashboard shell (no sidebar, no auth guard).
10. Use existing `cn` for class composition if needed.

## Files

- **Create**: `app/prompts/[id]/editor/page.tsx`

## Acceptance Criteria

- [ ] The route file is at `app/prompts/[id]/editor/page.tsx`.
- [ ] The page is a client component (`"use client"`).
- [ ] Navigating to `/prompts/{promptId}/editor` loads and displays the editor for that prompt.
- [ ] A missing/invalid prompt ID renders a stable not-found state (no crash or error).
- [ ] Not-found state includes a link back to `/prompts`.
- [ ] The editor content fills the viewport width (full width or max-width wrapper).
- [ ] No dashboard shell (sidebar/auth) is rendered — this route is standalone.
- [ ] `npm run build` passes.

## Dependencies

- Task 027 (refactored PromptEditor component)
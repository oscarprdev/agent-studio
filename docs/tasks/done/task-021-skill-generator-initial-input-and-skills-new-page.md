# Task 021 - SkillGenerator + /skills/new: Accept Initial Input from Search Params

## Reference

Plan document:

[docs/plans/plan-019-create-agent-create-skill-actions.md](../../plans/plan-019-create-agent-create-skill-actions.md)

Relevant section:

Operation 4 — Pre-populate SkillGenerator

---

## Description

Wire the `/skills/new` route page to read incoming search parameters (`promptId` and `promptContent`), resolve the saved prompt from the prompt store when applicable, and pass an optional initial input string to the `SkillGenerator` component.

The `SkillGenerator` gains an optional `initialInput` prop that initializes its description textarea field instead of starting empty.

---

## Acceptance Criteria

### `/skills/new/page.tsx`

- File is modified (already exists).
- Has `"use client"` directive (already present).
- Imports `useSearchParams` from `next/navigation` and `Suspense` from `react`.
- Wraps the search-params reading logic in a `<Suspense fallback={null}>` boundary (required by Next.js 16 App Router for `useSearchParams`).
- Reads `promptId` and `promptContent` search params.
- When `promptId` is present, resolves the prompt via `prompts.getById(promptId)`.
  - If the prompt exists: uses `prompt.input` as the initial skill description.
  - If the prompt does not exist: falls back to an empty generator (no pre-population).
- When no `promptId` but `promptContent` is present: decodes with `decodeURIComponent` and uses as the initial textarea value.
- When neither parameter is present: renders the existing empty generator.
- `promptId` takes precedence over `promptContent` when both are present.
- Passes resolved input to `<SkillGenerator initialInput={…}>`.
- No errors or crashes on malformed/missing parameters.

### `components/skill/SkillGenerator.tsx`

- Interface gains optional `initialInput?: string`.
- The `input` state uses lazy initialization: `useState(() => initialInput ?? "")`.
- When `initialInput` is provided, the textarea is pre-filled on mount.
- When `initialInput` is `""` or not provided, the textarea starts empty (existing behavior).
- Users can edit the pre-filled content freely.
- Generation, copy, save, toast, and navigation behavior remains unchanged.
- The `onGenerate` callback signature is unchanged.

---

## Implementation Details

### File: `app/(dashboard)/skills/new/page.tsx`

```tsx
"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SkillGenerator } from "@/components/skill/SkillGenerator"
import { TopBar } from "@/components/layout/top-bar"
import * as promptsStore from "@/lib/prompts/store"

function SkillGeneratorPage() {
  const searchParams = useSearchParams()
  const promptId = searchParams.get("promptId")
  const promptContent = searchParams.get("promptContent")

  let initialInput: string | undefined

  if (promptId) {
    const prompt = promptsStore.getById(promptId)
    if (prompt) {
      initialInput = prompt.input
    }
  } else if (promptContent) {
    initialInput = decodeURIComponent(promptContent)
  }

  return (
    <>
      <TopBar title="New Skill" />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <SkillGenerator initialInput={initialInput} />
        </div>
      </div>
    </>
  )
}

export default function NewSkillPage() {
  return (
    <>
      <TopBar title="New Skill" />
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
          <Suspense fallback={null}>
            <SkillGeneratorPage />
          </Suspense>
        </div>
      </div>
    </>
  )
}
```

### File: `components/skill/SkillGenerator.tsx`

Add to the existing interface:

```ts
interface SkillGeneratorProps {
  onGenerate?: (skill: Skill) => void
  initialInput?: string
}
```

Change the existing state initialization:

```ts
const [input, setInput] = useState(() => initialInput ?? "")
```

---

## Out Of Scope

- Mapping structured prompt fields (role, objective, etc.) — only the raw prompt `input` text is used as the skill description.
- Pre-selecting tools or tags on SkillGenerator.
- Auto-saving the skill on generation.

---

## Verification

1. Run `npm run build` — must complete with exit code 0.
2. Run `npm run lint` — must complete with exit code 0.
3. Manual: Navigate to `/skills/new` with no params → textarea is empty.
4. Manual: Navigate to `/skills/new?promptContent=Hello%20World` → textarea pre-filled with "Hello World".
5. Manual: Save a prompt → open prompt detail → click "Create Skill" → textarea pre-filled with the prompt's original input.
6. Manual: Navigate to `/skills/new?promptId=nonexistent-id` → generator renders empty (no crash).
7. Manual: Pre-fill textarea → edit content → generate → verify generated skill is created with a fresh UUID.
8. Manual: Verify multiline and special-character content survives URL encoding round trip.
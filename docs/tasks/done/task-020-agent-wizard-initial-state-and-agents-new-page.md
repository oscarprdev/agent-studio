# Task 020 - AgentWizard + /agents/new: Accept Initial State from Search Params

## Reference

Plan document:

[docs/plans/plan-019-create-agent-create-skill-actions.md](../../plans/plan-019-create-agent-create-skill-actions.md)

Relevant section:

Operation 3 — Pre-populate AgentWizard

---

## Description

Wire the `/agents/new` route page to read incoming search parameters (`promptId` and `promptContent`), resolve the saved prompt from the prompt store when applicable, and pass an optional initial state to the `AgentWizard` component.

The `AgentWizard` component gains an optional `initialState` prop that merges with its default wizard state. When a prompt is provided, the prompt's original `input` text becomes the wizard's initial `goal` and the structured `role` + `objective` fields are merged into the wizard's `context` field.

---

## Acceptance Criteria

### `/agents/new/page.tsx`

- File is modified (already exists).
- Has `"use client"` directive (already present).
- Imports `useSearchParams` from `next/navigation` and `Suspense` from `react`.
- Wraps the search-params reading logic in a `<Suspense fallback={null}>` boundary (required by Next.js 16 App Router for `useSearchParams`).
- Reads `promptId` and `promptContent` search params.
- When `promptId` is present, resolves the prompt via `prompts.getById(promptId)`.
  - If the prompt exists: extracts `goal` from `prompt.input` and `context` from the structured fields.
  - If the prompt does not exist: falls back to an empty wizard (no pre-population).
- When no `promptId` but `promptContent` is present: decodes with `decodeURIComponent` and uses as the initial `goal`.
- When neither parameter is present: renders the existing empty wizard.
- `promptId` takes precedence over `promptContent` when both are present.
- Passes resolved initial state to `<AgentWizard initialState={…}>`.
- No errors or crashes on malformed/missing parameters.

### `components/agent/AgentWizard.tsx`

- Interface gains optional `initialState?: Partial<WizardState>`.
- The `useState` for `state` uses lazy initialization: `useState<WizardState>(() => ({ defaults, ...initialState }))` so unrelated re-renders don't reset user edits.
- Only the fields present in `initialState` override defaults; all other fields (currentStep, selectedTools, skills, generatedAgent) keep their defaults.
- The wizard still opens at step 0 regardless of pre-population.
- All existing behavior (step navigation, generation, save, tool/skill toggling, reset) remains unchanged.
- The `onSave` callback signature is unchanged.

---

## Implementation Details

### File: `app/(dashboard)/agents/new/page.tsx`

```tsx
"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AgentWizard } from "@/components/agent/AgentWizard"
import { TopBar } from "@/components/layout/top-bar"
import * as promptsStore from "@/lib/prompts/store"
import type { WizardState } from "@/lib/agents/types"

function AgentWizardPage() {
  const searchParams = useSearchParams()
  const promptId = searchParams.get("promptId")
  const promptContent = searchParams.get("promptContent")

  let initialState: Partial<WizardState> | undefined

  if (promptId) {
    const prompt = promptsStore.getById(promptId)
    if (prompt) {
      initialState = {
        goal: prompt.input,
        context: `${prompt.content.role}\n\n${prompt.content.objective}`,
      }
    }
  } else if (promptContent) {
    initialState = {
      goal: decodeURIComponent(promptContent),
    }
  }

  return (
    <>
      <TopBar title="Create Agent" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AgentWizard initialState={initialState} />
      </div>
    </>
  )
}

export default function CreateAgentPage() {
  return (
    <>
      <TopBar title="Create Agent" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Suspense fallback={null}>
          <AgentWizardPage />
        </Suspense>
      </div>
    </>
  )
}
```

### File: `components/agent/AgentWizard.tsx`

Add to the existing interface:

```ts
interface AgentWizardProps {
  onSave?: (agent: Agent) => void
  initialState?: Partial<WizardState>
}
```

Change the existing state initialization to use lazy form with merge:

```ts
const [state, setState] = useState<WizardState>(() => ({
  currentStep: 0,
  goal: initialState?.goal ?? "",
  selectedTools: initialState?.selectedTools ?? [],
  skills: initialState?.skills ?? [],
  context: initialState?.context ?? "",
}))
```

Note: `generatedAgent` is not included because it is only set during generation (step 4) and is not an initialization concern.

---

## Out Of Scope

- Redesigning the wizard steps.
- Mapping additional structured fields beyond `goal` and `context`.
- Handling URL changes after mount (initial props only).
- Auto-saving the prompt before navigating.

---

## Verification

1. Run `npm run build` — must complete with exit code 0.
2. Run `npm run lint` — must complete with exit code 0.
3. Manual: Navigate to `/agents/new` with no params → wizard is empty.
4. Manual: Navigate to `/agents/new?promptContent=Hello%20World` → goal field pre-filled with "Hello World".
5. Manual: Save a prompt → open prompt detail → click "Create Agent" → wizard pre-populated with the prompt's input as goal.
6. Manual: Navigate to `/agents/new?promptId=nonexistent-id` → wizard renders empty (no crash).
7. Manual: Navigate to `/agents/new?promptId=real-id&promptContent=override` → `promptId` takes precedence.
8. Manual: Generate and save an agent through the wizard → verify new agent is created with a fresh UUID.
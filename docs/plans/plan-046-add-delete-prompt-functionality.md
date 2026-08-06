# REASONS: Add Delete Prompt Functionality — AGE-46

## R — Requirements

### Problem

Prompt cards already expose an optional `onDelete` callback and delete button, but the prompts list does not provide the callback. Deletion is therefore neither confirmed nor wired to the prompt localStorage store.

### Definition of Done

1. Every prompt card on `/prompts` exposes a destructive Delete action when wired by the page.
2. Delete opens an `AlertDialog` containing the prompt title, with Cancel and destructive Delete actions.
3. Cancel leaves the prompt and storage unchanged.
4. Confirming removes the prompt from localStorage, refreshes the list, and shows a success toast using the existing toast manager API.
5. A failed or unsuccessful removal shows an error toast and does not report success.
6. `npm run build` and `npm run lint` pass.

### Scope In

- Update `PromptCard` to compose the existing Base UI/shadcn `AlertDialog` pattern used by `AgentCard`.
- Wire prompt deletion, list refresh, and success/error toasts in the prompts page.

### Scope Out

- Changes to the prompt store contract, prompt editor, routing, persistence schema, or shared UI primitives.
- Adding a test runner or automated tests; none is configured in this repository.

### PRD References

- Section 6, Use Case 1: prompts are generated and retained as reusable developer assets.
- Section 8, Prompt Editor: prompts are managed artifacts with an editor/lifecycle surface.
- Section 13, principle 4: “Prompts need lifecycle management.”

## E — Entities

### Prompt

- **Fields:** Existing `id`, `title`, `input`, `content`, `createdAt`, and `updatedAt`; no field changes.
- **Relationships:** `PromptCard` receives one `Prompt`; the prompts page owns the collection and deletion callback.
- **Domain rules:** `remove(id: string): boolean` filters the prompt from the `agentstudio:prompts` localStorage array. `true` means a matching prompt was persisted as removed; `false` means no prompt was removed or storage failed.

## A — Approach

Follow the established agents-page implementation rather than introducing new abstractions.

1. In `PromptCard`, preserve the existing optional `onDelete` guard and replace the direct destructive Button click with `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, header/title/description, footer, `AlertDialogCancel`, and destructive `AlertDialogAction`.
2. Use the exact existing Base UI composition: `AlertDialogTrigger` accepts the `render={<Button ... />}` prop, so the issue’s suggested render-prop pattern is valid in this repository and matches `AgentCard`.
3. In the prompts page, import `remove` alongside `getAll` and import `toast` from `@/components/ui/toast`. Implement `handleDelete(id)` using the agents-page flow: find the prompt before removal, call `remove`, refresh with `setPrompts(getAll())` on success, and call `toast.add({ title, type })` for success or failure.
4. Pass `onDelete={handleDelete}` to every `PromptCard`.

The success title should follow the agents convention, `Deleted "${prompt?.title ?? "prompt"}"`; the failure title should be `Failed to delete prompt`. No changes to `toast.tsx` are required.

## S — Structure

### Files To Modify

- `components/prompt/PromptCard.tsx` — add AlertDialog imports and confirmation composition around the existing conditional Delete action.
- `app/(dashboard)/prompts/page.tsx` — import `remove` and `toast`, add `handleDelete`, and pass the callback to `PromptCard`.

### Files To Create

- None.

### Dependencies

- None. Existing `@base-ui/react/alert-dialog`, shadcn wrappers, and toast manager are already installed and used.

## O — Operations

### Operation 1: Confirm Prompt Deletion

**Input:** `PromptCard`’s existing `prompt` and optional `onDelete(id)` callback.

**Output:** A confirmation dialog that invokes the callback only after confirmation.

**Steps:**

1. Import the AlertDialog primitives/wrappers used by `AgentCard`.
2. Keep the action conditional on `onDelete` being provided.
3. Render the destructive small Button through `AlertDialogTrigger render={...}`.
4. Set the dialog title to `Delete prompt`.
5. Set the description to `Are you sure you want to delete "{prompt.title}"? This action cannot be undone.`.
6. Render Cancel and destructive Delete actions; invoke `onDelete(prompt.id)` only from the confirmed action.

**Edge Cases:** Cancel must not invoke the callback; titles containing quotes must remain text content; the dialog must remain inaccessible when no `onDelete` is passed.

### Operation 2: Delete Prompt From List

**Input:** Prompt ID from the confirmed card action.

**Output:** Updated React list state and toast feedback.

**Steps:**

1. Import `getAll, remove` from `@/lib/prompts/store` and `toast` from `@/components/ui/toast`.
2. Find the current prompt by ID before calling `remove` so its title is available for the success message.
3. Call `remove(id)` inside the existing agents-style `try/catch` flow.
4. When it returns `true`, call `setPrompts(getAll())` and `toast.add({ title: `Deleted "${prompt?.title ?? "prompt"}"`, type: "success" })`.
5. When it returns `false`, or throws unexpectedly, show `toast.add({ title: "Failed to delete prompt", type: "error" })`.
6. Pass `handleDelete` to each rendered `PromptCard`.

**Edge Cases:** The ID may no longer exist because another tab changed localStorage; removal must then show failure rather than success. If the prompt cannot be found in React state, use the agents fallback title. The existing visibility-change refresh remains unchanged.

## N — Norms

- Follow the existing PascalCase component/import conventions and `@/*` aliases.
- Use Base UI `render` composition, not Radix-only `asChild`; `AlertDialogTrigger` and `AlertDialogCancel` already use this project convention.
- Use `toast.add(...)` from the shared manager, not `toast({...})` or a React `useToast` hook.
- Preserve semantic Button variants, existing `gap-*` layout, and current client-component directives.
- No logging infrastructure exists; user-facing failures use error toasts.
- No test runner, test files, or test dependencies exist. Validate with `npm run build` and `npm run lint`.
- Keep documentation limited to this plan; update it if implementation deviates.

## S — Safeguards

### Invariants

- No storage mutation occurs before the user confirms.
- Only the requested prompt ID is removed; the store remains the source of truth.
- A success toast is shown only when `remove` returns `true`.
- The list is refreshed from `getAll()` after successful deletion, rather than manually reconstructing persistence state.
- No new localStorage keys, entities, or dependencies are introduced.

### Performance

- Deletion remains synchronous and local; one store removal and one list reload are acceptable for the existing small client-side collection.
- Do not add effects, polling, or network requests.

### Security and Data Integrity

- Prompt title is rendered as React text, not HTML.
- The destructive operation is protected by the existing accessible AlertDialog primitive.
- LocalStorage failures are surfaced as failure feedback through the existing store boolean/exception handling.

### Validation

1. Run `npm run lint`.
2. Run `npm run build`.
3. Manually verify Delete opens the prompt-specific dialog, Cancel preserves the card, Confirm removes it from localStorage/list, and success/error toasts use the expected titles.

### API Findings / Deviation Check

- `AlertDialogTrigger` **does support** the `render` prop in this repo: its wrapper exposes `AlertDialogPrimitive.Trigger.Props`, and `AgentCard` already uses `render={<Button ... />}` successfully.
- The issue’s suggested AlertDialog composition does not need an API correction; it should mirror `AgentCard` exactly.
- The toast API is the Base UI toast manager exported as `toast`; callers use `toast.add({ title, type })`, as shown in the agents and skills pages. Do not use a `toast({...})` call.
- `remove(id)` returns a boolean and catches localStorage failures internally, so the page must treat `false` as an error and retain the defensive `try/catch` used by the agents page.

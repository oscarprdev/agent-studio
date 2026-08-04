# Plan AGE-2: AI Prompt Generator Page

## R — Requirements

### Problem

AI Agent Studio needs its first functional feature: an AI Prompt Generator. Developers currently write prompts from scratch with no structured workflow. This page transforms a natural language description into a professional, structured prompt with ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, and OUTPUT sections.

### Definition of Done

1. `/prompts/new` renders a prompt generator page with a `Textarea`, example placeholder text, and a "Generate Prompt" button
2. Clicking "Generate" calls a mock AI function, shows loading state via `Spinner` + `disabled`, and returns a structured prompt output
3. The generated output renders as sections: ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, OUTPUT
4. Copy-to-clipboard button copies the full prompt as formatted text
5. "Save Prompt" persists the prompt to `localStorage` under `agentstudio:prompts`
6. `/prompts` shows saved prompts as cards with title, date, and snippet
7. Empty state on `/prompts` when no prompts are saved (uses `Empty` component)
8. `/prompts/[id]` renders a prompt detail/editor view with title, content, and edit capabilities
9. Responsive layout works on mobile (1-col) and desktop (2-col where applicable)
10. All components follow shadcn conventions: `gap-*`, `size-*`, semantic colors, `FieldGroup`/`Field` for forms, `data-icon` for button icons

### Scope In

- Prompt generator page (`/prompts/new`)
- Prompt list page (`/prompts`)
- Prompt detail/editor page (`/prompts/[id]`)
- `PromptGenerator`, `PromptCard`, `PromptEditor`, `PromptOutput` components
- `lib/ai/generate-prompt.ts` mock AI generation
- `lib/prompts/store.ts` localStorage persistence
- `lib/prompts/types.ts` type definitions
- Navigation from homepage to `/prompts/new`

### Scope Out

- Real AI API integration (mock only)
- Authentication / user accounts
- Database persistence (localStorage only)
- Agent/skill creation from prompts
- Version history
- Sharing / collaboration features
- Sidebar navigation (not part of AGE-2)

---

## E — Entities

```
Prompt {
  id: string            // crypto.randomUUID()
  title: string         // derived from user input or editable
  input: string         // original user description
  content: PromptSections  // generated structured prompt
  createdAt: string     // ISO 8601
  updatedAt: string     // ISO 8601
}

PromptSections {
  role: string
  objective: string
  tools: string[]
  workflow: string[]
  rules: string[]
  output: string
}
```

### Relationships

- `Prompt` owns one `PromptSections`
- `Prompt` is stored as an array in localStorage

### Domain Rules

- Prompt `id` must be unique (`crypto.randomUUID()`)
- `title` defaults to first 60 chars of `input` if not explicitly set
- `updatedAt` must refresh on every edit
- localStorage key is `agentstudio:prompts` — namespace prevents collisions
- Mock generator always returns a valid `PromptSections` structure

---

## A — Approach

### Design Pattern

**Component composition** with container/presentational split:
- Pages (`app/prompts/*`) are thin RSC wrappers that delegate to client components
- Components (`components/prompt/*`) own all client-side state and interactivity
- `lib/prompts/store.ts` is a pure data layer with no React dependencies — easy to swap for a real backend later

### Strategy

1. **Types first** — define `Prompt` and `PromptSections` in `lib/prompts/types.ts`
2. **Store second** — build localStorage CRUD in `lib/prompts/store.ts`
3. **Mock AI third** — create `lib/ai/generate-prompt.ts` with a realistic mock
4. **Components fourth** — build `PromptOutput`, `PromptGenerator`, `PromptCard`, `PromptEditor`
5. **Pages last** — wire up routes and page shells

### Why This Approach

- Store layer is decoupled from React — when we add a real backend, we replace one file, not every component
- Mock AI function has the same interface as a real provider — single-file swap later
- Component-first approach lets us build and test UI in isolation
- Pages are RSC by default in Next.js 16 — only components that need `useState` get `"use client"`

### Trade-offs

**Advantages:**
- localStorage is zero-config for MVP — no backend needed
- Mock generator with structured output is testable and realistic
- Store abstraction means backend migration is a one-file change

**Disadvantages:**
- localStorage has a ~5MB limit (irrelevant for MVP with a handful of prompts)
- No cross-device sync (acceptable for Phase 1)
- Mock generator doesn't produce genuinely useful prompts (acceptable — real AI comes later)

**Alternatives Considered:**
- In-memory store (rejected — data lost on refresh)
- JSON file in `public/` (rejected — read-only, no CRUD)
- IndexedDB (overkill for MVP)

---

## S — Structure

### Location

```
app/
  prompts/
    new/
      page.tsx          # Prompt generator page (RSC wrapper)
    page.tsx            # Prompt list page (RSC wrapper)
    [id]/
      page.tsx          # Prompt detail page (RSC wrapper)
components/
  prompt/
    PromptGenerator.tsx # Main generator UI (client component)
    PromptCard.tsx      # Card for prompt list
    PromptEditor.tsx    # Full prompt editor view
    PromptOutput.tsx    # Rendered markdown output with sections
lib/
  ai/
    generate-prompt.ts  # AI generation interface (mock)
  prompts/
    store.ts            # localStorage CRUD
    types.ts            # Prompt types
```

### Files To Create

```
Create:
- app/prompts/new/page.tsx
- app/prompts/page.tsx
- app/prompts/[id]/page.tsx
- components/prompt/PromptGenerator.tsx
- components/prompt/PromptCard.tsx
- components/prompt/PromptEditor.tsx
- components/prompt/PromptOutput.tsx
- lib/ai/generate-prompt.ts
- lib/prompts/store.ts
- lib/prompts/types.ts
```

### shadcn Components To Install

```
npx shadcn@latest add textarea card badge separator empty skeleton toast
```

These are needed for:
- `Textarea` — user input in generator
- `Card` — prompt cards in list view
- `Badge` — section labels in output
- `Separator` — visual dividers
- `Empty` — empty state on list page
- `Skeleton` — loading state placeholder
- `Toast` — save/copy feedback

### Files To Modify

```
Modify:
- app/page.tsx          # Add navigation link to /prompts/new
```

### Dependencies

New dependencies: None.

Affected existing dependencies: None.

---

## O — Operations

### Operation 1: GetPromptTypes

Define type system.

**Input:** None (types only).

**Output:** TypeScript types for `Prompt` and `PromptSections`.

**Steps:**
1. Create `lib/prompts/types.ts`
2. Export `PromptSections` interface with `role`, `objective`, `tools`, `workflow`, `rules`, `output`
3. Export `Prompt` interface with `id`, `title`, `input`, `content`, `createdAt`, `updatedAt`
4. Export `CreatePromptInput` type (subset of Prompt fields for creation)

**Edge Cases:**
- `tools` and `workflow` must be arrays (never undefined)

---

### Operation 2: GeneratePrompt

Mock AI generation.

**Input:**
```ts
{ description: string } // user's natural language request
```

**Output:**
```ts
Promise<PromptSections>  // structured prompt
```

**Steps:**
1. Create `lib/ai/generate-prompt.ts`
2. Export `generatePrompt` async function
3. Parse `description` to extract keywords (simple regex/split approach)
4. Map keywords to structured sections using a template system
5. Add artificial delay (`await new Promise(r => setTimeout(r, 800))`) for realistic loading
6. Return a `PromptSections` object with all sections populated

**Mock Template Logic:**
- **ROLE**: Extract role-related words (engineer, reviewer, analyst, etc.)
- **OBJECTIVE**: Use the description directly, cleaned up
- **TOOLS**: Scan for tool keywords (GitHub, Linear, Slack, etc.)
- **WORKFLOW**: Generate 3-5 numbered steps based on context
- **RULES**: Default set of 2-3 professional rules
- **OUTPUT**: Default to "Markdown report" unless specified

**Edge Cases:**
- Empty description → return generic prompt with "Describe your needs" placeholder
- Very long description → truncate to first 500 chars for processing
- Unknown tools → default to generic tool list

---

### Operation 3: PromptStore CRUD

localStorage persistence layer.

**Input/Output:**
```ts
getAll(): Prompt[]
getById(id: string): Prompt | null
create(input: CreatePromptInput): Prompt
update(id: string, updates: Partial<Prompt>): Prompt
remove(id: string): boolean
```

**Steps:**
1. Create `lib/prompts/store.ts`
2. Define `STORAGE_KEY = "agentstudio:prompts"` constant
3. Implement `getAll()`: read from localStorage, JSON.parse, return array (empty if missing/invalid)
4. Implement `getById(id)`: filter array by id
5. Implement `create(input)`: generate UUID, set timestamps, push to array, save
6. Implement `update(id, updates)`: find by id, merge updates, set `updatedAt`, save
7. Implement `remove(id)`: filter out by id, save
8. All functions wrap in try/catch — localStorage can throw in private browsing or quota exceeded
9. Helper `persist(prompts: Prompt[])`: JSON.stringify and localStorage.setItem

**Edge Cases:**
- localStorage unavailable (SSR, private browsing) → functions return defaults silently
- Corrupted JSON → `JSON.parse` in try/catch → return empty array
- Duplicate IDs → impossible with `crypto.randomUUID()`, but defensive check on create

---

### Operation 4: PromptOutput Component

Render structured prompt sections.

**Input:**
```ts
{ content: PromptSections; className?: string }
```

**Output:** JSX with labeled sections.

**Steps:**
1. Create `components/prompt/PromptOutput.tsx`
2. Add `"use client"` directive
3. Render each section with a `Badge` label and content area
4. ROLE: single paragraph
5. OBJECTIVE: single paragraph
6. TOOLS: comma-separated badges or list
7. WORKFLOW: numbered list with `Separator` between items
8. RULES: bulleted list
9. OUTPUT: single paragraph
10. Use `flex flex-col gap-4` for section spacing (never `space-y-*`)
11. Use `cn()` for conditional class merging

**Edge Cases:**
- Empty section content → render "Not specified" in muted text
- Long content → preserve line breaks, use `whitespace-pre-wrap`

---

### Operation 5: PromptGenerator Component

Main generation UI.

**Input:**
```ts
{ onGenerate?: (prompt: Prompt) => void }
```

**Output:** JSX with textarea, generate button, and output preview.

**Steps:**
1. Create `components/prompt/PromptGenerator.tsx`
2. Add `"use client"` directive
3. Import `Textarea`, `Button`, `Spinner`, `PromptOutput`
4. Render `FieldGroup` with `Field` containing `Textarea` and label
5. Add example placeholder text matching PRD
6. Render "Generate Prompt" button with `Spinner` + `disabled` during loading
7. On generate: call `generatePrompt()`, store result in state
8. Show `PromptOutput` when result is available
9. Add "Copy" button with `clipboard.writeText()` — show toast on success
10. Add "Save Prompt" button — call `store.create()`, show toast, navigate to `/prompts`
11. Use `useRouter()` for navigation after save

**Edge Cases:**
- Empty textarea → disable generate button
- Generate called twice → second call cancels first (abort controller or ignore)
- Copy fails → show error toast
- Save fails → show error toast with retry

---

### Operation 6: PromptCard Component

Card for prompt list.

**Input:**
```ts
{ prompt: Prompt; onDelete?: (id: string) => void }
```

**Output:** Card with title, date, snippet, and actions.

**Steps:**
1. Create `components/prompt/PromptCard.tsx`
2. Add `"use client"` directive
3. Import `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Badge`
4. Render card with:
   - `CardHeader`: prompt title (truncated to 60 chars) + created date
   - `CardContent`: first 120 chars of `input` as snippet
   - Footer: "View" button (links to `/prompts/[id]`), "Delete" button
5. Use `Link` from `next/link` for "View" navigation
6. Delete calls `onDelete` prop (parent handles confirmation)

**Edge Cases:**
- Very long title → `truncate` class
- Very long snippet → `line-clamp-2`
- Deleted prompt → card removed from DOM via parent re-render

---

### Operation 7: PromptEditor Component

Full prompt editor view.

**Input:**
```ts
{ prompt: Prompt; onSave?: (prompt: Prompt) => void }
```

**Output:** Editable form with all prompt fields.

**Steps:**
1. Create `components/prompt/PromptEditor.tsx`
2. Add `"use client"` directive
3. Import `FieldGroup`, `Field`, `FieldLabel`, `Input`, `Textarea`, `Button`, `PromptOutput`
4. Render editable title field
5. Render read-only `PromptOutput` showing current sections
6. Add "Save Changes" button calling `store.update()`
7. Add "Back to List" link
8. Use `useState` for local edits, sync to store on save

**Edge Cases:**
- Prompt not found → show "not found" message
- Save with no changes → still persist (updatedAt refreshes)
- Concurrent edits → last write wins (acceptable for localStorage)

---

### Operation 8: Pages

Wire up routes.

**Files:**
- `app/prompts/new/page.tsx` — renders `PromptGenerator`
- `app/prompts/page.tsx` — renders list of `PromptCard` components
- `app/prompts/[id]/page.tsx` — renders `PromptEditor` for the given ID

**Steps for `/prompts/new/page.tsx`:**
1. RSC wrapper that renders `PromptGenerator`
2. Set page metadata: title "New Prompt", description

**Steps for `/prompts/page.tsx`:**
1. Client component that loads prompts from store on mount
2. Renders `PromptCard` for each prompt
3. Shows `Empty` component when no prompts exist
4. Add "New Prompt" button linking to `/prompts/new`

**Steps for `/prompts/[id]/page.tsx`:**
1. Client component that reads `id` from `useParams()`
2. Loads prompt from store by ID
3. Renders `PromptEditor` with loaded prompt
4. Shows 404-style message if prompt not found

---

## N — Norms

### Naming

- Components: `PascalCase` (e.g., `PromptGenerator`, `PromptCard`)
- Functions: `camelCase` (e.g., `generatePrompt`, `getAll`, `getById`)
- Types/Interfaces: `PascalCase` (e.g., `Prompt`, `PromptSections`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `STORAGE_KEY`)
- Files: `kebab-case` for lib files, `PascalCase.tsx` for components
- CSS classes: Tailwind utility classes only — no custom CSS needed

### Logging

Not applicable for MVP. No logging infrastructure exists.

### Error Handling

- Store functions: try/catch with silent fallback to defaults
- Component errors: toast notifications for user-facing errors
- No error boundaries needed for MVP (single-feature scope)

### Testing

No test runner is configured (per AGENTS.md). Testing is out of scope for this plan.

### Documentation

- JSDoc on `generatePrompt` function explaining mock behavior
- JSDoc on store functions explaining localStorage contract
- No separate documentation files needed

---

## S — Safeguards

### Invariants

- Never store raw user input as HTML — all content rendered as text
- Prompt IDs must be generated by `crypto.randomUUID()`, never user-provided
- localStorage key must be `agentstudio:prompts` — never hardcoded elsewhere
- Mock generator must always return a complete `PromptSections` (never partial)

### Performance

- localStorage operations are synchronous but fast (< 1ms for < 100 prompts)
- Mock generator has 800ms artificial delay — do not remove (provides realistic UX)
- No API calls, no network requests, no streaming

### Security

- No authentication required (MVP)
- Content stored in localStorage — user's browser only
- No external data transmission
- Copy-to-clipboard uses `navigator.clipboard` API (requires HTTPS or localhost)

### Data Integrity

- `createdAt` set once on creation, never modified
- `updatedAt` set on every save, always fresh
- Array operations (push/filter) must persist the full array — never partial writes
- Corrupted localStorage data → graceful fallback to empty array, never crash

---

## Implementation Order

| Step | Files | Rationale |
|------|-------|-----------|
| 1 | `lib/prompts/types.ts` | Foundation — everything depends on types |
| 2 | `lib/prompts/store.ts` | Data layer — components need CRUD |
| 3 | `lib/ai/generate-prompt.ts` | Mock AI — generator depends on this |
| 4 | `components/prompt/PromptOutput.tsx` | Pure display — no dependencies |
| 5 | `components/prompt/PromptGenerator.tsx` | Core feature — depends on store + mock + output |
| 6 | `components/prompt/PromptCard.tsx` | List display — depends on types |
| 7 | `components/prompt/PromptEditor.tsx` | Detail view — depends on store + output |
| 8 | `app/prompts/new/page.tsx` | Route — depends on generator |
| 9 | `app/prompts/page.tsx` | Route — depends on card + store |
| 10 | `app/prompts/[id]/page.tsx` | Route — depends on editor + store |
| 11 | `app/page.tsx` (modify) | Add nav link — last, after routes exist |

---

## Summary

**Architecture decisions:**
- Store abstraction (`lib/prompts/store.ts`) decouples persistence from React — backend swap is a one-file change
- Mock AI function (`lib/ai/generate-prompt.ts`) has the same signature as a real provider — swap is trivial
- All interactive components are `"use client"` — pages are RSC wrappers
- localStorage namespaced as `agentstudio:prompts` to avoid collisions
- shadcn components installed via CLI, not hand-written

**Recommended implementation order:** Types → Store → Mock AI → Components (bottom-up: Output → Generator → Card → Editor) → Pages → Navigation

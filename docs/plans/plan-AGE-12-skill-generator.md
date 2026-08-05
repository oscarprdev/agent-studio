# Plan AGE-12: Skill Generator Page

## R — Requirements

### Problem

AI Agent Studio needs its Skill Generator feature — one of the three core MVP pillars alongside the Prompt Generator (AGE-2) and Agent Builder (AGE-3). The Skill Generator allows developers to describe a reusable AI capability in natural language and receive a structured skill definition containing instructions, required tools, trigger patterns, expected output, and rules. Currently the `/skills` route shows a "Coming soon" placeholder and there is no skill creation, storage, viewing, editing, or export workflow.

### Definition of Done

1. `/skills/new` renders a skill generator page with a `Textarea`, example placeholder text, and a "Generate Skill" button
2. Clicking "Generate" calls a mock AI function, shows loading state via `Spinner` + `disabled`, and returns a structured skill output
3. The generated output renders as sections: NAME, DESCRIPTION, INSTRUCTIONS, TRIGGERS, TOOLS, EXPECTED_OUTPUT, RULES
4. Copy-to-clipboard button copies the full skill as formatted markdown text
5. "Save Skill" persists the skill to `localStorage` under `agentstudio:skills`
6. `/skills` shows saved skills as a card grid with name, date, snippet, and tags
7. Empty state on `/skills` when no skills are saved (uses `Empty` component)
8. `/skills/[id]` renders a skill detail/editor view with full content, edit capabilities, duplicate, delete, and export as markdown
9. Responsive layout works on mobile (1-col) and desktop (3-col grid where applicable)
10. All components follow shadcn conventions: `gap-*`, `size-*`, semantic colors, `FieldGroup`/`Field` for forms, `data-icon` for button icons

### Scope In

- Skill generator page (`/skills/new`)
- Skill list page (`/skills`) — replaces "Coming soon" placeholder
- Skill detail/editor page (`/skills/[id]`)
- `SkillGenerator`, `SkillCard`, `SkillEditor`, `SkillOutput` components
- `lib/ai/generate-skill.ts` mock AI generation
- `lib/skills/store.ts` localStorage persistence
- `lib/skills/types.ts` type definitions
- Duplicate skill operation
- Export skill as markdown operation
- Search/filter on skill list page

### Scope Out

- Real AI API integration (mock only)
- Authentication / user accounts
- Database persistence (localStorage only)
- Skill versioning
- Skill sharing / collaboration
- Skill marketplace integration
- Agent-to-skill linking (future feature)
- Skill testing / execution

---

## E — Entities

```
Skill {
  id: string              // crypto.randomUUID()
  name: string            // derived from user input or editable
  description: string     // short summary of what the skill does
  input: string           // original user description
  content: SkillContent   // generated structured skill
  tags: string[]          // categorization tags
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}

SkillContent {
  name: string            // skill display name
  description: string     // one-line purpose
  instructions: string    // detailed step-by-step instructions
  triggers: string[]      // when to activate this skill
  tools: string[]         // required external tools/MCPs
  expectedOutput: string  // what the skill produces
  rules: string           // constraints and guidelines
}
```

### Relationships

- `Skill` owns one `SkillContent`
- `Skill` has a `tags` array for categorization
- `Skill` is stored as an array in localStorage

### Domain Rules

- Skill `id` must be unique (`crypto.randomUUID()`)
- `name` defaults to first 60 chars of `input` if not explicitly set
- `updatedAt` must refresh on every edit
- localStorage key is `agentstudio:skills` — namespace prevents collisions
- Mock generator always returns a complete `SkillContent` structure
- Duplicate creates a new skill with same content but new `id`, `createdAt`, `updatedAt`, and name suffixed with " (copy)"
- Export generates a markdown-formatted string from skill content

---

## A — Approach

### Design Pattern

**Component composition** with container/presentational split, mirroring the AGE-2 Prompt Generator pattern exactly:

- Pages (`app/skills/*`) are thin RSC wrappers that delegate to client components
- Components (`components/skill/*`) own all client-side state and interactivity
- `lib/skills/store.ts` is a pure data layer with no React dependencies — easy to swap for a real backend later
- `lib/ai/generate-skill.ts` mirrors `lib/ai/generate-prompt.ts` interface

### Strategy

1. **Types first** — define `Skill` and `SkillContent` in `lib/skills/types.ts`
2. **Store second** — build localStorage CRUD in `lib/skills/store.ts`
3. **Mock AI third** — create `lib/ai/generate-skill.ts` with a realistic mock
4. **Components fourth** — build `SkillOutput`, `SkillGenerator`, `SkillCard`, `SkillEditor`
5. **Pages last** — wire up routes, replacing placeholders

### Why This Approach

- Follows the exact proven pattern from AGE-2 — zero learning curve for anyone who worked on prompts
- Store layer is decoupled from React — when we add a real backend, we replace one file, not every component
- Mock AI function has the same interface as a real provider — single-file swap later
- Component-first approach lets us build and test UI in isolation
- Pages are RSC by default in Next.js 16 — only components that need `useState` get `"use client"`

### Trade-offs

**Advantages:**
- Consistency with AGE-2 — same architecture, same patterns, same file structure
- localStorage is zero-config for MVP — no backend needed
- Mock generator with structured output is testable and realistic
- Store abstraction means backend migration is a one-file change
- Skill tags enable filtering without a database

**Disadvantages:**
- localStorage has a ~5MB limit (irrelevant for MVP with a handful of skills)
- No cross-device sync (acceptable for Phase 1)
- Mock generator doesn't produce genuinely useful skills (acceptable — real AI comes later)
- Tags are flat strings — no hierarchical taxonomy (acceptable for MVP)

**Alternatives Considered:**
- In-memory store (rejected — data lost on refresh)
- JSON file in `public/` (rejected — read-only, no CRUD)
- IndexedDB (overkill for MVP)
- Shared store with prompts (rejected — different entities, different lifecycles)

---

## S — Structure

### Location

```
app/(dashboard)/
  skills/
    new/
      page.tsx              # Skill generator page (RSC wrapper)
    page.tsx                # Skill list page (replaces "Coming soon")
    [id]/
      page.tsx              # Skill detail page (RSC wrapper)
components/
  skill/
    SkillGenerator.tsx      # Main generator UI (client component)
    SkillCard.tsx           # Card for skill list
    SkillEditor.tsx         # Full skill editor view
    SkillOutput.tsx         # Rendered markdown output with sections
lib/
  ai/
    generate-skill.ts       # AI generation interface (mock)
  skills/
    store.ts                # localStorage CRUD
    types.ts                # Skill types
```

### Files To Create

```
Create:
- app/(dashboard)/skills/new/page.tsx
- app/(dashboard)/skills/[id]/page.tsx
- components/skill/SkillGenerator.tsx
- components/skill/SkillCard.tsx
- components/skill/SkillEditor.tsx
- components/skill/SkillOutput.tsx
- lib/ai/generate-skill.ts
- lib/skills/store.ts
- lib/skills/types.ts
```

### Files To Modify

```
Modify:
- app/(dashboard)/skills/page.tsx    # Replace "Coming soon" with skill list
```

### Dependencies

New dependencies: None.

Affected existing dependencies: None.

---

## O — Operations

### Operation 1: GetSkillTypes

Define type system.

**Input:** None (types only).

**Output:** TypeScript types for `Skill` and `SkillContent`.

**Steps:**
1. Create `lib/skills/types.ts`
2. Export `SkillContent` interface with `name`, `description`, `instructions`, `triggers`, `tools`, `expectedOutput`, `rules`
3. Export `Skill` interface with `id`, `name`, `description`, `input`, `content`, `tags`, `createdAt`, `updatedAt`
4. Export `CreateSkillInput` type (subset of Skill fields for creation)
5. Export `SkillContentKey` type for section iteration

**Edge Cases:**
- `triggers`, `tools`, and `tags` must be arrays (never undefined)
- `rules` is a string (newline-separated), not an array — matches Prompt pattern

---

### Operation 2: SkillStore CRUD

localStorage persistence layer.

**Input/Output:**
```ts
getAll(): Skill[]
getById(id: string): Skill | null
create(input: CreateSkillInput): Skill
update(id: string, updates: Partial<Skill>): Skill | null
remove(id: string): boolean
duplicate(id: string): Skill | null
search(query: string): Skill[]
```

**Steps:**
1. Create `lib/skills/store.ts`
2. Define `STORAGE_KEY = "agentstudio:skills"` constant
3. Implement `getAll()`: read from localStorage, JSON.parse, return array (empty if missing/invalid)
4. Implement `getById(id)`: filter array by id
5. Implement `create(input)`: generate UUID, set timestamps, push to array, save
6. Implement `update(id, updates)`: find by id, merge updates, set `updatedAt`, save
7. Implement `remove(id)`: filter out by id, save
8. Implement `duplicate(id)`: find skill, create new with same content, new id, name + " (copy)", new timestamps
9. Implement `search(query)`: filter by name, description, or tags containing query (case-insensitive)
10. All functions wrap in try/catch — localStorage can throw in private browsing or quota exceeded
11. Helper `persist(skills: Skill[])`: JSON.stringify and localStorage.setItem

**Edge Cases:**
- localStorage unavailable (SSR, private browsing) → functions return defaults silently
- Corrupted JSON → `JSON.parse` in try/catch → return empty array
- Duplicate IDs → impossible with `crypto.randomUUID()`, but defensive check on create
- Search with empty query → return all skills
- Search with special characters → escape for safe string matching

---

### Operation 3: GenerateSkill

Mock AI generation.

**Input:**
```ts
{ description: string } // user's natural language request
```

**Output:**
```ts
Promise<SkillContent>  // structured skill
```

**Steps:**
1. Create `lib/ai/generate-skill.ts`
2. Export `generateSkill` async function
3. Parse `description` to extract keywords (simple regex/split approach)
4. Map keywords to structured sections using a template system
5. Add artificial delay (`await new Promise(r => setTimeout(r, 800))`) for realistic loading
6. Return a `SkillContent` object with all sections populated

**Mock Template Logic:**
- **NAME**: Derive from description — capitalize first words, truncate to 60 chars
- **DESCRIPTION**: First sentence or first 100 chars of description
- **INSTRUCTIONS**: 3-5 step instructions based on context keywords
- **TRIGGERS**: Extract trigger phrases (e.g., "when reviewing code", "on pull request")
- **TOOLS**: Scan for tool keywords (GitHub, Linear, Slack, etc.) — same logic as `generate-prompt.ts`
- **EXPECTED_OUTPUT**: Default to "Markdown report" unless context suggests otherwise
- **RULES**: Default set of 2-3 professional rules

**Edge Cases:**
- Empty description → return generic skill with "Describe your needs" placeholder
- Very long description → truncate to first 500 chars for processing
- Unknown tools → default to generic tool list

---

### Operation 4: SkillOutput Component

Render structured skill sections.

**Input:**
```ts
{ content: SkillContent; className?: string }
```

**Output:** JSX with labeled sections.

**Steps:**
1. Create `components/skill/SkillOutput.tsx`
2. Add `"use client"` directive
3. Import `Badge`, `Separator`, `cn` from existing components
4. Render each section with a `Badge` label and content area
5. NAME: single paragraph
6. DESCRIPTION: single paragraph
7. INSTRUCTIONS: paragraph with whitespace-pre-wrap
8. TRIGGERS: comma-separated badges or list items
9. TOOLS: comma-separated badges (same pattern as `PromptOutput`)
10. EXPECTED_OUTPUT: single paragraph
11. RULES: bulleted list (same pattern as `PromptOutput`)
12. Use `flex flex-col gap-4` for section spacing (never `space-y-*`)
13. Use `cn()` for conditional class merging

**Edge Cases:**
- Empty section content → render "Not specified" in muted text
- Long content → preserve line breaks, use `whitespace-pre-wrap`
- Empty triggers/tools arrays → render "Not specified"

---

### Operation 5: SkillGenerator Component

Main generation UI.

**Input:**
```ts
{ onGenerate?: (skill: Skill) => void }
```

**Output:** JSX with textarea, generate button, and output preview.

**Steps:**
1. Create `components/skill/SkillGenerator.tsx`
2. Add `"use client"` directive
3. Import `Textarea`, `Button`, `Spinner`, `SkillOutput`, `toast`
4. Import `FieldGroup`, `Field`, `FieldLabel` from `@/components/ui/field`
5. Render `FieldGroup` with `Field` containing `Textarea` and label
6. Add example placeholder text: "e.g. Create a skill that reviews code for security vulnerabilities, checks for common OWASP Top 10 issues, and generates a detailed security report..."
7. Render "Generate Skill" button with `Spinner` + `disabled` during loading
8. On generate: call `generateSkill()`, store result in state
9. Show `SkillOutput` when result is available
10. Add "Copy" button with `navigator.clipboard.writeText()` — format as markdown, show toast on success
11. Add "Save Skill" button — call `store.create()`, show toast, navigate to `/skills`
12. Use `useRouter()` for navigation after save

**Edge Cases:**
- Empty textarea → disable generate button
- Generate called twice → ignore second call while first is in progress
- Copy fails → show error toast
- Save fails → show error toast with retry

---

### Operation 6: SkillCard Component

Card for skill list.

**Input:**
```ts
{ skill: Skill; onDelete?: (id: string) => void }
```

**Output:** Card with name, date, snippet, tags, and actions.

**Steps:**
1. Create `components/skill/SkillCard.tsx`
2. Add `"use client"` directive
3. Import `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `Button`, `Badge`
4. Render card with:
   - `CardHeader`: skill name (truncated to 60 chars) + created date badge
   - `CardContent`: first 120 chars of `description` as snippet + tags as badges
   - `CardFooter`: "View" button (links to `/skills/[id]`), "Delete" button
5. Use `Link` from `next/link` for "View" navigation
6. Delete calls `onDelete` prop (parent handles confirmation)

**Edge Cases:**
- Very long name → `truncate` class
- Very long snippet → `line-clamp-2`
- No tags → hide tags section
- Deleted skill → card removed from DOM via parent re-render

---

### Operation 7: SkillEditor Component

Full skill editor view.

**Input:**
```ts
{ skill: Skill | null; onSave?: (skill: Skill) => void; onDelete?: (id: string) => void; onDuplicate?: (id: string) => void }
```

**Output:** Editable form with all skill fields.

**Steps:**
1. Create `components/skill/SkillEditor.tsx`
2. Add `"use client"` directive
3. Import `FieldGroup`, `Field`, `FieldLabel`, `Input`, `Textarea`, `Button`, `SkillOutput`
4. Import `toast`, `AlertDialog` for delete confirmation
5. Render editable name field
6. Render editable description field (textarea)
7. Render read-only `SkillOutput` showing current content
8. Add "Save Changes" button calling `store.update()`
9. Add "Duplicate" button calling `store.duplicate()` then navigating to new skill
10. Add "Delete" button with `AlertDialog` confirmation, then navigate to `/skills`
11. Add "Export as Markdown" button — format skill as markdown, trigger download
12. Add "Back to List" link
13. Use `useState` for local edits, sync to store on save

**Edge Cases:**
- Skill not found → show "not found" message with back link
- Save with no changes → still persist (updatedAt refreshes)
- Delete confirmation → use `AlertDialog` (shadcn component)
- Export → create Blob, trigger download via anchor element
- Duplicate → create new skill, navigate to `/skills/[id]` of new skill

---

### Operation 8: Export Skill as Markdown

Format skill content for export.

**Input:**
```ts
{ skill: Skill }
```

**Output:** markdown string and triggers download.

**Steps:**
1. Create helper function `exportSkillAsMarkdown` in `components/skill/SkillEditor.tsx` (or inline)
2. Format each section as markdown with headers:
   ```markdown
   # {skill.name}

   {skill.description}

   ## Instructions

   {skill.content.instructions}

   ## Triggers

   - {trigger 1}
   - {trigger 2}

   ## Tools

   - {tool 1}
   - {tool 2}

   ## Expected Output

   {skill.content.expectedOutput}

   ## Rules

   {skill.content.rules}

   ---

   *Generated by AI Agent Studio*
   ```
3. Create Blob with `text/markdown` type
4. Create temporary anchor element, set `href` to Blob URL, set `download` attribute
5. Click anchor, revoke Blob URL
6. Show success toast

**Edge Cases:**
- Empty sections → omit section header or show "Not specified"
- Special characters in name → sanitize for filename
- Download fails → show error toast

---

### Operation 9: Pages

Wire up routes.

**Files:**
- `app/(dashboard)/skills/new/page.tsx` — renders `SkillGenerator`
- `app/(dashboard)/skills/page.tsx` — renders list of `SkillCard` components (replaces placeholder)
- `app/(dashboard)/skills/[id]/page.tsx` — renders `SkillEditor` for the given ID

**Steps for `/skills/new/page.tsx`:**
1. Add `"use client"` directive
2. Render `TopBar` with title "New Skill"
3. Render `SkillGenerator` in centered layout (same pattern as `/prompts/new`)
4. Wrap in `<div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8"><div className="w-full max-w-3xl">...</div></div>`

**Steps for `/skills/page.tsx`:**
1. Add `"use client"` directive
2. Load skills from store on mount via `useState(() => getAll() ?? [])`
3. Add `useEffect` with `visibilitychange` listener to refresh on tab focus (same pattern as `/prompts`)
4. Add search input with `useState` for filter query
5. Filter skills by query using `store.search()` or inline filtering
6. Render `TopBar` with title "Skills"
7. Render header with "My Skills" title and "New Skill" button
8. Render search input (shadcn `Input`)
9. Render `SkillCard` grid (3-col on desktop, 1-col on mobile) when skills exist
10. Render `Empty` component when no skills exist
11. Handle delete: call `store.remove()`, refresh list, show toast

**Steps for `/skills/[id]/page.tsx`:**
1. Add `"use client"` directive
2. Read `id` from `useParams()`
3. Load skill from store by ID via `useState(() => getById(params.id))`
4. Render `TopBar` with skill name or "Skill Detail"
5. Render `SkillEditor` with loaded skill
6. Show 404-style message with back link if skill not found

---

## N — Norms

### Naming

- Components: `PascalCase` (e.g., `SkillGenerator`, `SkillCard`)
- Functions: `camelCase` (e.g., `generateSkill`, `getAll`, `getById`)
- Types/Interfaces: `PascalCase` (e.g., `Skill`, `SkillContent`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `STORAGE_KEY`)
- Files: `kebab-case` for lib files, `PascalCase.tsx` for components
- CSS classes: Tailwind utility classes only — no custom CSS needed
- Directory: `components/skill/` (singular, matching `components/prompt/`)

### Logging

Not applicable for MVP. No logging infrastructure exists.

### Error Handling

- Store functions: try/catch with silent fallback to defaults
- Component errors: toast notifications for user-facing errors (via `toast.add()`)
- No error boundaries needed for MVP (single-feature scope)
- Delete operation: confirmation via `AlertDialog` before destructive action

### Testing

No test runner is configured (per AGENTS.md). Testing is out of scope for this plan.

### Documentation

- JSDoc on `generateSkill` function explaining mock behavior
- JSDoc on store functions explaining localStorage contract
- No separate documentation files needed

---

## S — Safeguards

### Invariants

- Never store raw user input as HTML — all content rendered as text
- Skill IDs must be generated by `crypto.randomUUID()`, never user-provided
- localStorage key must be `agentstudio:skills` — never hardcoded elsewhere
- Mock generator must always return a complete `SkillContent` (never partial)
- Duplicate always creates a new entity — never mutates the original
- Export never exposes internal IDs or timestamps in markdown output

### Performance

- localStorage operations are synchronous but fast (< 1ms for < 100 skills)
- Mock generator has 800ms artificial delay — do not remove (provides realistic UX)
- No API calls, no network requests, no streaming
- Search is client-side filtering — acceptable for < 100 skills

### Security

- No authentication required (MVP)
- Content stored in localStorage — user's browser only
- No external data transmission
- Copy-to-clipboard uses `navigator.clipboard` API (requires HTTPS or localhost)
- Export creates local Blob download — no server roundtrip

### Data Integrity

- `createdAt` set once on creation, never modified
- `updatedAt` set on every save, always fresh
- Array operations (push/filter) must persist the full array — never partial writes
- Corrupted localStorage data → graceful fallback to empty array, never crash
- Duplicate creates independent copy — original unchanged

---

## Implementation Order

| Step | Files | Rationale |
|------|-------|-----------|
| 1 | `lib/skills/types.ts` | Foundation — everything depends on types |
| 2 | `lib/skills/store.ts` | Data layer — components need CRUD |
| 3 | `lib/ai/generate-skill.ts` | Mock AI — generator depends on this |
| 4 | `components/skill/SkillOutput.tsx` | Pure display — no dependencies |
| 5 | `components/skill/SkillGenerator.tsx` | Core feature — depends on store + mock + output |
| 6 | `components/skill/SkillCard.tsx` | List display — depends on types |
| 7 | `components/skill/SkillEditor.tsx` | Detail view — depends on store + output |
| 8 | `app/(dashboard)/skills/new/page.tsx` | Route — depends on generator |
| 9 | `app/(dashboard)/skills/page.tsx` | Route — depends on card + store (replaces placeholder) |
| 10 | `app/(dashboard)/skills/[id]/page.tsx` | Route — depends on editor + store |

---

## Summary

**Architecture decisions:**
- Store abstraction (`lib/skills/store.ts`) decouples persistence from React — backend swap is a one-file change
- Mock AI function (`lib/ai/generate-skill.ts`) has the same signature as a real provider — swap is trivial
- All interactive components are `"use client"` — pages are thin wrappers
- localStorage namespaced as `agentstudio:skills` to avoid collisions
- Skill tags enable client-side filtering without a database
- Duplicate and Export operations are pure functions in the store/component layer
- Follows the exact AGE-2 pattern — same file structure, same component composition, same store abstraction

**Recommended implementation order:** Types → Store → Mock AI → Components (bottom-up: Output → Generator → Card → Editor) → Pages

**Key files:**
- `lib/skills/types.ts` — Skill and SkillContent type definitions
- `lib/skills/store.ts` — localStorage CRUD with search and duplicate
- `lib/ai/generate-skill.ts` — Mock AI generation (template-based)
- `components/skill/SkillOutput.tsx` — Rendered skill sections with Badge labels
- `components/skill/SkillGenerator.tsx` — Main generation UI with textarea + output
- `components/skill/SkillCard.tsx` — Card component for skill list
- `components/skill/SkillEditor.tsx` — Full editor with save/duplicate/delete/export
- `app/(dashboard)/skills/page.tsx` — Skill list with search/filter (replaces placeholder)
- `app/(dashboard)/skills/new/page.tsx` — Skill generator route
- `app/(dashboard)/skills/[id]/page.tsx` — Skill detail route

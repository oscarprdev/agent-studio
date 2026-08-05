# Task 017 - Skill Routes and Pages

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 9: Pages

---

## Description

Wire up all three skill routes by creating and modifying page files in `app/(dashboard)/skills/`.

This task touches 4 files:

1. **`app/(dashboard)/skills/new/page.tsx`** (create) — The generator page wrapper
2. **`app/(dashboard)/skills/page.tsx`** (modify) — Replace "Coming soon" placeholder with full skills list
3. **`app/(dashboard)/skills/[id]/page.tsx`** (create) — The skill detail/editor page wrapper

### 1. `/skills/new/page.tsx` — Generator Page

- Client RSC wrapper with `"use client"`
- Renders `TopBar` with title "New Skill"
- Renders `SkillGenerator` in centered layout:
  ```
  <div className="flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
    <div className="w-full max-w-3xl">
      <SkillGenerator />
    </div>
  </div>
  ```
- Same layout pattern as `/prompts/new`

### 2. `/skills/page.tsx` — Skills List Page (replaces "Coming soon")

- Client RSC with `"use client"`
- Loads skills from store on mount: `useState(() => getAll() ?? [])`
- `useEffect` with `visibilitychange` listener to refresh on tab focus (same pattern as `/prompts`)
- Search input with `useState` for filter query string
- Filtered list uses store.search() or inline filtering
- `TopBar` with title "Skills"
- Header row: "My Skills" `<h1>` + "New Skill" button linking to `/skills/new`
- Search input using shadcn `Input` component
- Grid rendering: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` with `SkillCard`
- Empty state: renders `Empty` component when no skills exist, with "No skills yet" title
- Delete: calls `store.remove(id)`, refreshes list, shows toast

### 3. `/skills/[id]/page.tsx` — Skill Detail Page

- Client RSC with `"use client"`
- Reads `id` from `useParams()`
- Loads skill on mount: `useState(() => getById(params.id))`
- Renders `TopBar` with skill name or "Skill Detail" as title
- Renders `SkillEditor` with loaded skill
- 404-style message with back link if skill not found

---

## Acceptance Criteria

### `/skills/new/page.tsx`
- File is created
- Has `"use client"` directive
- Imports and renders `TopBar` with title "New Skill"
- Imports and renders `SkillGenerator`
- Layout matches `/prompts/new` pattern: centered, `max-w-3xl`, `px-4 py-12 sm:px-6 lg:px-8`

### `/skills/page.tsx`
- File is modified (replaces existing "Coming soon" content)
- Has `"use client"` directive
- Imports and renders `TopBar` with title "Skills"
- Imports `getAll` from `@/lib/skills/store` and `Skill` type from `@/lib/skills/types`
- Imports `SkillCard` from `@/components/skill/SkillCard`
- Imports `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`
- Imports `TopBar`, `Button`, `Input`
- Skills loaded on mount via lazy `useState(() => getAll() ?? [])`
- `visibilitychange` listener refreshes skills on tab focus
- Search input controls a query state
- Skills filtered by `skill.name`, `skill.description`, or `skill.tags` containing query (case-insensitive)
- Header shows "My Skills" heading and "New Skill" button linking to `/skills/new`
- Renders `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` with `SkillCard` for each skill
- Empty state renders `Empty` component with "No skills yet" / "Create your first skill to get started."
- Delete calls `store.remove(id)`, updates state, shows toast
- Search input rendered using shadcn `Input` component

### `/skills/[id]/page.tsx`
- File is created
- Has `"use client"` directive
- Imports `useParams` from `next/navigation`
- Imports `getById` from `@/lib/skills/store`
- Imports `Skill` type from `@/lib/skills/types`
- Imports `SkillEditor` from `@/components/skill/SkillEditor`
- Imports `TopBar` from `@/components/layout/top-bar`
- Reads `id` from `useParams<{ id: string }>()`
- Loads skill on mount: `useState<Skill | null>(() => getById(params.id))`
- Renders `TopBar` with skill name or "Skill Detail" fallback
- Wraps `SkillEditor` in centered layout matching `/prompts/[id]` pattern
- Shows "skill not found" message with "Back to List" when skill is null
- Layout: `flex flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8` with `max-w-3xl`

---

## Out Of Scope

- Component implementation (skills components are handled in tasks 013–016)
- Store implementation (task 011)
- Mock generator (task 012)
- Types (task 010)
- Sidebar navigation updates (out of scope — plan doesn't mention adding to sidebar)
- Route guards or redirects

---

## Domain

### Pages as Thin Wrappers

Pages are thin React Server Components (or Client Components only for stateful needs) that delegate to client components for interactivity. This follows the Next.js App Router convention and the exact pattern from the prompt generator routes.

Importance: Keeps page logic minimal — navigation, loading state, and layout are page concerns; everything else lives in client components.

### Skills List

The list page is the hub of the skills feature. Users browse skills, search/filter, create new skills via a "New Skill" button, and perform CRUD actions on existing skills.

It mirrors the `/prompts` list page pattern: lazy store loading, visibility refresh, search input, card grid, and empty state.
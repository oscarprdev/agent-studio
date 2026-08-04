# Task 014 — Agent Route Pages

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 14: Pages

Also modifies existing placeholder pages at `app/(dashboard)/agents/page.tsx` and `app/(dashboard)/agents/new/page.tsx`.

---

## Description

Wire up three route pages that expose the agent builder components in the app's navigation structure:

1. `app/(dashboard)/agents/page.tsx` — Replace the existing "Coming soon" placeholder with the agent list view
2. `app/(dashboard)/agents/new/page.tsx` — Replace the existing "Coming soon" placeholder with the agent builder wizard
3. `app/(dashboard)/agents/[id]/page.tsx` — New dynamic route for editing a single agent

---

## Acceptance Criteria

### `/agents` page (app/(dashboard)/agents/page.tsx)
- Replaces existing placeholder with an actual agent list implementation
- Client component (`"use client"`)
- Loads agents from `store.getAll()` on mount using `useState` / `useEffect`
- Renders `AgentCard` for each agent in a responsive grid layout (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`)
- Shows a shadcn `Empty` component with "No agents yet" message when no agents exist
- "Create Agent" `Button` that links to `/agents/new` (placed above or in the grid)
- Delete handler on each `AgentCard` that calls `store.remove(id)` and re-fetches the list
- TopBar rendering from `@/components/layout/top-bar` is maintained
- Uses shadcn `Card`, `Badge` for display

### `/agents/new` page (app/(dashboard)/agents/new/page.tsx)
- Replaces existing placeholder with the `AgentWizard` component
- Client component (`"use client"`)
- Wraps `AgentWizard` in a `Suspense` or direct render
- Handles save callback: navigates to `/agents` after successful save
- Uses `useRouter` from `next/navigation` for redirection
- TopBar from `@/components/layout/top-bar` is maintained
- Sets proper page metadata (title: "Create Agent")

### `/agents/[id]` page (app/(dashboard)/agents/[id]/page.tsx)
- Client component (`"use client"`)
- Reads `id` from `useParams()` (or `usePathname` parsing — use whichever is standard for the project's App Router patterns)
- Loads agent from `store.getById(id)` on mount
- Renders `AgentEditor` with the loaded agent
- Shows "not found" message (or redirect) if agent is not found
- TopBar from `@/components/layout/top-bar` is maintained

### Common
- All pages import `TopBar` from `@/components/layout/top-bar`
- All page components are RSC wrappers delegating to client-side components
- No custom CSS needed (Tailwind classes only)
- Consistent layout with existing pages

---

## Out Of Scope

- Route-level error boundaries
- Search/filter on agent list
- Pagination for large agent lists
- Agent list sorting options
- Breadcrumb navigation

---

## Domain

### Route Pages

Next.js App Router route pages serve as thin RSC wrappers that delegate to client components. They handle data loading (from localStorage store), layout composition with TopBar, and navigation coordination via `useRouter`.

Importance:

Pages are the entry points into the feature. Without them, the components have no way to be reached from the app's navigation structure.

### Placeholder Replacement

The dashboard already has placeholder pages for agents. These tasks replace them with real implementations, making the feature accessible through the existing sidebar navigation.

---

## Graph

```mermaid
graph TD
    A[User navigates to /agents] --> B[List loads from store.getAll]
    B --> C{Agents exist?}
    C -->|No| D[Show Empty state]
    C -->|Yes| E[Show AgentCard grid]
    D --> F[User clicks 'Create Agent']
    E --> F
    F --> G[Navigate to /agents/new]
    G --> H[AgentWizard mounts]
    H --> I[User completes wizard]
    I --> J[Agent saved to store]
    J --> K[Redirect to /agents]
    K --> E
    E --> L[User clicks View on a card]
    L --> M[Navigate to /agents/[id]]
    M --> N[AgentEditor renders with loaded agent]
    N --> O[User edits and saves]
    O --> E
```

---

## Files

| Action | Path |
|--------|------|
| Modify | `app/(dashboard)/agents/page.tsx` — Replace placeholder with agent list |
| Modify | `app/(dashboard)/agents/new/page.tsx` — Replace placeholder with wizard |
| Create | `app/(dashboard)/agents/[id]/page.tsx` — New dynamic edit route |
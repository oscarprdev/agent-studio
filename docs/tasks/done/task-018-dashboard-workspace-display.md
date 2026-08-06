# Task 018.3 — Dashboard: Show Workspace Name

## Reference

Plan document:

docs/plans/plan-018-auth-types-and-store.md

Relevant sections:

- Operation: Dashboard workspace display
- Structure → Existing files to modify (dashboard/page.tsx)
- N → Norms (no direct localStorage reads in UI)
- E → AuthState — dashboard reads workspace from context

---

## Description

Wire the dashboard page to read the current workspace from `useAuth()` and display its name. The page currently has zero awareness of auth state.

### Current State

`app/(dashboard)/dashboard/page.tsx` is a `"use client"` component that:

- Renders a `TopBar` with title "Dashboard"
- Displays agent/skills/prompts stats cards
- Shows quick action buttons
- Shows a "Recent Activity" section
- Does **not** import `useAuth` from `@/lib/auth-context`
- Does **not** display any workspace information

### What to Add

1. **Import** `useAuth` from `@/lib/auth-context`
2. **Consume** workspace: `const { workspace } = useAuth();`
3. **Render** workspace name below the `TopBar` but above the stats section:
   - When `workspace` is not null: show an `<h2>` or `<p>` with the workspace name
   - When `workspace` is null: show an onboarding/empty-state label
4. **Style** the workspace heading to match existing dashboard typography (use existing `h2` with `text-lg font-semibold` pattern seen in "Quick Actions" and "Recent Activity")

### Suggested Layout

The workspace info should appear after the `TopBar` and before the stats grid:

```
<TopBar title="Dashboard" />

{/* Workspace name */}
<div className="px-6 py-4">
  <h2 className="text-lg font-semibold">
    {workspace?.name ?? "No workspace"}
  </h2>
</div>

{/* Stats — existing content unchanged */}
...
```

### Do NOT Remove

- Any existing stats cards
- Quick actions section
- Recent activity section
- Any existing layout classes or structure

### Do NOT Add

- Workspace editing from the dashboard (beyond display — `updateWorkspace` is available in context but no UI control is required)
- Redirects, gating, or navigation changes
- New components

---

## Acceptance Criteria

- `useAuth` is imported from `@/lib/auth-context` in `app/(dashboard)/dashboard/page.tsx`
- Workspace name is rendered when `workspace` is not null
- A null-safe label is shown when `workspace` is null (e.g., "No workspace")
- No `localStorage` reads exist in the page component
- Existing stats, quick actions, and recent activity sections are unchanged
- No new components are created
- The page still renders without errors

---

## Out Of Scope

- Workspace editing controls on the dashboard
- `useAuth()` changes (handled in task 018.2)
- `getToken()` usage (handled in task 018.1)
- Sidebar or layout changes
- Tests or lint/build verification (handled in task 018.4)
- Empty-state component usage (simple string is sufficient)

---

## Domain

### Dashboard Workspace Display

The dashboard is a client RSC that should reflect the current authenticated workspace when one exists. This reflects the plan's requirement for "a neutral onboarding/empty-state label" before the user has completed workspace creation.

### No Direct Storage

The page must never read `localStorage` directly. All auth state flows through `useAuth()` from the context, matching the existing architectural pattern used across the codebase.

(No mermaid graph needed — this is a UI rendering addition, not a flow or state transition.)
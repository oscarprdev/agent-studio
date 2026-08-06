# Task 058 — Dashboard Agent Count Verification and Polish

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Dashboard agent count stays accurate (verify listAgents().length)"
- Operations: "Dashboard agent count verification and polish"

---

## Description

Verify and, if necessary, correct the agent count displayed on the dashboard at `app/(dashboard)/dashboard/page.tsx`. The dashboard already calls `listAgents().length` for the "Agents" stat during initial `useState` initialization, but the count does not refresh after agents are created, updated, or deleted from the detail view.

This task also performs a quick pass on polish items across the agent detail flow to ensure consistency and correctness (naming, shadcn compliance, accessibility).

---

## Acceptance Criteria

### Dashboard count
- The dashboard "Agents" stat shows `listAgents().length` at the time the dashboard page loads
- If the dashboard should refresh on navigation back from `/agents` or `/agents/[id]`, add a `visibilitychange` or `focus` event listener (same pattern currently used in `app/(dashboard)/agents/page.tsx`)
- If a visibility/focus refresh is not an acceptance requirement, document that the dashboard shows a static count per page-load and move on

### Polish items
- All agent detail components use `@/*` imports (no relative imports like `../lib/agents`)
- No unused imports remain in any modified file
- `npm run lint` passes with no errors (warnings are acceptable but should be reviewed)
- `npm run build` succeeds (no type errors or build failures)
- All buttons have accessible labels (no icon-only buttons without `aria-label`)
- Tab panels have correct `role="tab"` / `role="tabpanel"`/`role="tablist"` structure

### Final verification
- Navigate to dashboard → verify Agents count reflects stored agents
- Create an agent (wizard) → navigate to dashboard → count reflects creation
- Delete an agent → return to agents list → delete → navigate to dashboard → count reflects deletion
- Open an agent detail → verify all four tabs render correctly
- Test all six actions (Save, Duplicate, Delete, Export MD, Export JSON, Test/P review, at minimum verify they don't crash)
- `npm run build` succeeds

---

## Out of Scope

- Introducing a state management library or real-time syncing
- Adding navigation guards or "unsaved changes" modals
- Adding unit tests or end-to-end tests (no test runner is configured)
- Adding a "last viewed" or "recently edited" section on the dashboard

---

## Domain

### Dashboard Agent Count

The dashboard is the landing page users see after authentication. It shows three stats: Agents, Skills, and Prompts — each sourced from their respective stores. The Agents count must reflect the current `listAgents().length` at all times during the user's session, not just at initial page load.

The `app/(dashboard)/dashboard/page.tsx` uses `useState(() => baseStats.map(...))` which captures the count once on first render. If the acceptance requirement is "live accurate", it needs a refresh mechanism.

---

## Files

| Action | Path |
|--------|------|
| Verify/Modify | `app/(dashboard)/dashboard/page.tsx` |
| Verify | `app/(dashboard)/agents/[id]/page.tsx` |
| Verify | `components/agent/AgentCard.tsx` |
| Verify | `components/agent/*.tsx` (if new tab components were created) |
| Verify | `components/ui/tabs.tsx` |

---

## Implementation Notes

### Dashboard refresh strategy

Option 1 (lightweight — recommended): Add a `useEffect` that refreshes the agent count on `visibilitychange`:

```ts
useEffect(() => {
  function handleVisibility() {
    if (document.visibilityState === "visible") {
      setStats((prev) => prev.map((s) => {
        if (s.label === "Agents") return { ...s, count: listAgents().length }
        return s
      }))
    }
  }
  document.addEventListener("visibilitychange", handleVisibility)
  return () => document.removeEventListener("visibilitychange", handleVisibility)
}, [])
```

Option 2 (document as acceptable): Keep the static count. Note in the PR description that the dashboard shows per-page-load counts and add `focus` event listener to match the agents page pattern if a PR reviewer flags it.

### Lint pass

Run `npm run lint` after all tasks are complete. Fix any errors that arise:
- Unused imports
- Console.log calls
- Typo in component names
- Incorrect import paths

### Build pass

Run `npm run build` to verify TypeScript compilation, JSX, and all imports resolve.

### Accessibility check

- Tab panels: verify `role` attributes match shadcn Tabs implementation
- AlertDialog: verify it has proper labels (should be auto-included by shadcn AlertDialog)
- Export buttons: verify they have text labels ("Export JSON", "Export Markdown")
- Delete button: verify AlertDialog confirms the agent name (from task 057)
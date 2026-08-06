# Task 051 — Agent Card Metadata Enhancement

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Agent cards show skill count, tool count, and created date"
- Scope In: "Agent list card metadata"
- Structure: "Modify `AgentCard.tsx`"
- Norms: "use camelCase component/function names and `@/*` imports"

---

## Description

Add three metadata values to the existing `AgentCard` component so every card in the agents list shows:

1. **Skills count** — number of embedded skills (`agent.skills.length`)
2. **Tools count** — number of assigned tools (`agent.tools.length`)
3. **Created date** — formatted `agent.createdAt` date string (e.g. "Jan 15, 2025")

The current card only shows name, description, and model. These values render as small inline badges below the description text, before the footer actions.

---

## Acceptance Criteria

- `AgentCard` renders a skills count badge, tools count badge, and formatted created date
- Created date uses `Intl.DateTimeFormat` with locale `en-US` and displays like "Jan 15, 2025"
- If `skills` or `tools` is missing or not an array (legacy agents), the count shows `0` (safe handling)
- The date shows "—" or "Unknown" when `createdAt` is falsy or not a valid date string
- The `AgentCard` still shows name, description, and model exactly as before
- Layout: badges render inline (or in a flex row) beneath the description, above the footer
- `npm run lint` passes — no new lint errors

---

## Out of Scope

- Clicking badges to filter the list
- Sorting or filtering agents by these counts
- Any changes to the detail view
- Date formatting libraries — use native `Intl.DateTimeFormat` only

---

## Domain

### Agent Card Metadata

The card is the primary agents list component shown in `app/(dashboard)/agents/page.tsx`. Every stored agent flows through this component.

This enhancement increases informational density so users can evaluate an agent's scope at a glance before navigating to its detail view.

---

## Files

| Action | Path |
|--------|------|
| Modify | `components/agent/AgentCard.tsx` |

---

## Implementation Notes

- Use `Intl.DateTimeFormat` for date formatting — no date library:

```ts
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}
```

- Safe array length pattern for legacy agents:

```ts
const skillCount = Array.isArray(agent.skills) ? agent.skills.length : 0
const toolCount = Array.isArray(agent.tools) ? agent.tools.length : 0
```

- Use existing shadcn `Badge` component for the counts; reuse the project's `gap-*` and `text-xs` conventions.
- The created date can be plain text (no badge needed) or a subtle badge — match the base-nova visual style.
- Follow shadcn skill rules: `gap-*` not `space-*`, `size-*` for equal dimensions.

---

## Dependencies

None — standalone task.
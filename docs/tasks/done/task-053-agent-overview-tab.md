# Task 053 — Overview Tab

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Overview tab: agent name, description, model (read-only display), version, dates, skills/tools counts"
- Acceptance Criteria: "Detail view shows version badge, created date, last updated date"
- Operations: "Load agent detail"

---

## Description

Implement the **Overview** tab content that displays all non-editable metadata for the current agent. This is a read-only information panel showing what the agent is, when it was created, and its current composition.

The tab renders a structured metadata card that includes:

- **Agent name** (primary display)
- **Description**
- **Model** (read-only — shown as a badge, matching current `AgentEditor` behavior)
- **Version** (read-only badge, e.g. "1.0.0")
- **Created date** (formatted, e.g. "Jan 15, 2025 at 3:30 PM")
- **Last updated date** (formatted, e.g. "Jan 20, 2025 at 10:00 AM")
- **Skills count** (number, links to/indicates the Skills tab content)
- **Tools count** (number, links to/indicates the Tools tab content)

---

## Acceptance Criteria

- The Overview tab renders inside the tab panel in the detail page
- Agent name displays as a heading (H2 or H3 level)
- Description displays as body text below the name
- Model is shown as a read-only badge (same style as current `AgentEditor`)
- Version is shown as a read-only badge (secondary variant)
- Both created date and last updated date display in `en-US` locale with date and time
- Skills count and tools count render as numeric values with labels
- Dates are handled gracefully: if `createdAt` / `updatedAt` is invalid, show "—" or "Unknown"
- The existing `AgentOutput` component is NOT used — this is a flat metadata display
- `npm run lint` and `npm run build` pass

---

## Out of Scope

- Editing any fields from the Overview tab (Configuration tab handles that)
- Clicking the skill/tool counts to jump to those tabs (navigation is separate)
- Markdown rendering of description or system prompt — plain text only in overview

---

## Domain

### Agent Metadata Display

The Overview tab is the first thing a user sees when opening an agent detail. It provides an instant snapshot of the agent's identity and composition without requiring navigation to other tabs.

This mirrors the metadata section in the existing `exportAgentMarkdown` serializer but presents it in an interactive UI context.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentOverviewTab.tsx` |
| Modify | `app/(dashboard)/agents/[id]/page.tsx` (wire Overview tab into tab layout) |

---

## Implementation Notes

### Use a consistent layout

Create a metadata grid or list layout. Use shadcn `Card` or a `FieldGroup` with `Field` for each property:

```
AgentName (heading)
  |
  Description (paragraph)
  |
  Model    [badge]
  Version  [badge]
  Created  [date]
  Updated  [date]
  Skills   [N]
  Tools    [N]
```

### Date formatting

Reuse the same `Intl.DateTimeFormat` pattern from task 051 for consistency:

```ts
const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}
```

### Type safety

The tab receives the full `Agent` object from the page. No type changes needed — all required fields exist on `Agent` per `lib/agents/types.ts`.

### Follow patterns

- Use `@/*` imports
- Use shadcn `Badge` for model and version
- Use existing `cn()` from `@/lib/utils` if composing className
- Use `gap-*` utility classes, not `space-*`
# Task 047-007 — AgentVersionCompare Component

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- O, Operation 5: Render and Compare Versions
  - Steps 3–7: compare panel/dialog with selected version and current agent, scalar changes, prompt added/removed lines, tool/skill additions/removals
- S, Structure — Files To Create: `components/agent/AgentVersionCompare.tsx`
  - "client comparison panel/dialog for current versus selected version, scalar changes, prompt diff, and tool/skill changes"

---

## Description

Create a standalone client-side component that renders a **side-by-side comparison view** between an `AgentVersion` snapshot and the current `Agent`. This component is designed to work inside a `Dialog` (opened when the user clicks "Compare" on a version row).

### Component API

```typescript
type AgentVersionCompareProps = {
  version: AgentVersion | null;
  current: Agent | null;
  onClose: () => void;
}
```

When `version` or `current` is `null`, show an empty/alert state. In normal usage both are non-null.

### Layout (Dialog)

The component opens as a Dialog (not AlertDialog — it's a read-only view, not a confirmation). Use existing `Dialog` component from Task 047-001:
- `DialogHeader` with title "Version Comparison" + version label
- `DialogContent` with a two-column comparison layout
- `DialogFooter` with "Close" button

### Two-Column Side-by-Side

Each column shows the version's or current agent's values:

| Scalar Field | Display |
|---|---|
| Name | `"Current"` vs  `"v1.2"` with visual distinction if changed |
| Description | Full text, line-wrap |
| Model | `"gpt-4"` vs `"gpt-3.5-turbo"` |

### System Prompt Diff

Render the system prompt as a unified-style diff:
- Lines present in both → shown as-is (muted/neutral)
- Lines in current only → highlighted green/addition style (using `Badge` variant or `className` with `bg-emerald-500/10 text-emerald-700`)
- Lines in version only → highlighted red/removal style (`bg-red-500/10 text-red-700`)
- Scrollable container (`<pre>` with `max-h` and `overflow-y-auto`)
- Use a simple heading like "System Prompt Changes" with an `Alert` or descriptive text above

### Tools & Skills Diffs

For each collection (tools, skills), show what was added and removed:
- **Added tools/skills**: render as a list with name and description
- **Removed tools/skills**: render as a list with name and description, strikethrough or muted
- Grouped under "Tools" and "Skills" subheadings

### Changed/Unchanged Fields

Fields that are identical show a subtle indicator:
- `✓` badge or text for unchanged fields
- Fields not affected (e.g., `name` not changed) → show as `unchanged` rather than duplicating the value

### Scrollable Content

The dialog content should be scrollable when long:
- Use `max-h-[60vh]` overflow on the content area
- Prompt diff section specifically needs bounded scrollability per plan §S, Performance: "Keep prompt panes scrollable"

### Style & Composition

- Two-column layout: side-by-side for scalar fields, full-width for diffs
- Use `Card` for each comparison column
- Use `Badge` for status indicators
- Use `Separator` between sections
- Use `gap-*` for spacing, `cn()` for class merging
- Semantic tokens: never raw colors — use `text-muted-foreground` for unchanged, `text-emerald-600` only via existing color tokens if available, otherwise `bg-emerald-100`/`bg-red-100` for diff highlighting
- Add `data-icon` on relevant icons per shadcn skill

---

## Acceptance Criteria

- `components/agent/AgentVersionCompare.tsx` exists with `"use client"` directive
- Component accepts `version`, `current`, and `onClose` props
- Opens inside a `Dialog` with a header showing version label (e.g., "Comparing v1.2 with current")
- Scalar fields (name, description, model) shown side-by-side in two columns
- Changed scalar fields are visually distinct from unchanged ones (visual indicator)
- System prompt diff shows added lines with green highlighting and removed lines with red highlighting
- Prompt diff area is scrollable (bounded height)
- Tools section shows added tools and removed tools separately
- Skills section shows added and removed skills separately
- When `version` is `null` → shows an empty state (uses existing `Empty` component)
- When `current` is `null` → same empty state
- "Close" button triggers `onClose`
- Dialog uses `DialogTitle`, `DialogDescription` pattern (accessible)
- Composes `gap-*` spacing, never `space-*`
- Uses diff computation from `@/lib/agents/version-diff` (`compareVersion`)
- TypeScript compiles cleanly

---

## Out Of Scope

- Integration into any page (this is a standalone component; integration in Task 047-008)
- Three-way comparisons (version ↔ version ↔ current) — only single version vs current
- Merging diffs or conflict resolution
- Keyboard navigation within the diff view (mvp: accessible dialog with close button; per plan accessibility is for the dialog trigger, not the diff content area)

---

## Domain

### Diff Integration

This component uses the `compareVersion()` function from `lib/agents/version-diff.ts` (Task 047-005) as its data source. The component receives the raw `AgentVersion` + `Agent` and performs the diff internally by calling the helper. This keeps the diff logic pure and testable while the component handles presentation.

### Dialog vs Sheet vs Modal

The plan mentions "modal or inline" — the Dialog is the right choice for a side-by-side comparison because:
- It provides a clear visual separation from the page content
- It supports keyboard dismissal (Escape)
- It has built-in focus trapping and ARIA attributes
- The compare view can be wide (two columns) and a Dialog constrains it to a readable width

### Scrollable Prompts

Agent system prompts can be long. The diff area must be scrollable (`max-h-[60vh]`) so the dialog doesn't overflow the viewport. The two-column scalar section can be shorter and doesn't need separate scroll.

---

## Dependencies

- Task 047-002 (`AgentVersion`, `Agent`, `Tool`, `Skill` types)
- Task 047-003 (`AgentVersion` type in store)
- Task 047-001 (Dialog UI component)
- Task 047-005 (`version-diff.ts` comparison functions)

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentVersionCompare.tsx` |
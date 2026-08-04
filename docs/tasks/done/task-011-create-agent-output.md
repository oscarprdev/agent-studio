# Task 011 — Agent Output Component

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 11: AgentOutput Component

---

## Description

Implement a reusable component that displays a generated `AgentDefinition` in a formatted card layout. Used by both the wizard's generate step and the agent editor.

---

## Acceptance Criteria

- `components/agent/AgentOutput.tsx` exists
- Has `"use client"` directive
- Accepts props: `agent: AgentDefinition`, `className?: string`
- Imports `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Badge`, `Separator` from `@/components/ui/`
- Renders agent name as large bold heading
- Renders agent description as paragraph text
- Renders agent model as a `Badge` (e.g., "claude-sonnet-4-20250514")
- Renders system prompt in a scrollable or collapsible area
  - System prompt is scrollable by default (max-height with overflow)
  - Or uses a collapsible pattern with "Show more" / "Show less" toggle if it exceeds ~200 chars
  - Uses shadcn `Collapsible` or custom toggle approach
- Renders tools list as `Badge` items (one per tool name)
- Renders skills list as small cards or badges (one per skill name)
- Uses `flex flex-col gap-4` for layout
- Uses `cn()` for conditional class merging via `className` prop
- Empty tools array → shows muted text "None"
- Empty skills array → shows muted text "None"
- Uses semantic colors (`text-muted-foreground`, `bg-muted`, etc.)
- Uses `gap-*` for spacing

---

## Out Of Scope

- Editing agent data from output view
- Copying individual fields
- Agent versioning display
- JSON export format options

---

## Domain

### Agent Output

A read-only visual representation of a complete agent definition. It presents the AI-generated content in a scannable card format.

Importance:

The output component is what the user sees when deciding whether to save or regenerate. A clear, well-formatted output is essential for agent review.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentOutput.tsx` |
# Task 012 — Agent Card Component

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 12: AgentCard Component (adapted from existing PromptCard pattern)

---

## Description

Implement a card component for displaying a saved agent in the agent list view. Shows the agent's name, description, model, and provides navigation and delete actions.

Heavily inspired by the existing `PromptCard` component in `components/prompt/PromptCard.tsx`.

---

## Acceptance Criteria

- `components/agent/AgentCard.tsx` exists
- Has `"use client"` directive
- Accepts props: `agent: Agent`, `onDelete?: (id: string) => void`
- Imports `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`, `Button`, `Badge` from `@/components/ui/`
- Imports `Link` from `next/link`
- Imports `Agent` type from `@/lib/agents/types`
- CardHeader contains:
  - Agent name truncated to 60 chars with `truncate` class (uses `title` attribute for full name)
  - Model name as a Badge (e.g., "claude-sonnet-4-20250514")
- CardContent contains:
  - Agent description truncated to 120 chars with `line-clamp-2`
  - Text styled as muted foreground
- CardFooter contains:
  - "View" `Button` (outline variant, size "sm") that links to `/agents/[agent.id]`
  - "Delete" `Button` (destructive variant, size "sm") that calls `onDelete(agent.id)`
- Delete button only renders when `onDelete` prop is provided
- Uses `gap-2` in CardFooter
- Uses `cn()` for conditional classes
- Uses semantic colors
- Uses `gap-*` for spacing

---

## Out Of Scope

- Agent preview on hover
- Bulk delete
- Edit button (edit is handled by the detail page)
- Sorting/filtering agents

---

## Domain

### Agent Card

A compact visual summary of an agent suitable for the list view. It provides enough information at a glance and immediate access to view and delete actions.

Importance:

The agent card is the primary entry point for browsing saved agents. A clear, consistent card layout makes it easy to scan and compare agents.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentCard.tsx` |
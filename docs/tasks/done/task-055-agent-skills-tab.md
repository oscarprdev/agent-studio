# Task 055 — Skills Tab

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Skills tab: list embedded skills, add new skill form, remove skill button"
- Operations: "Add/remove skills"
- Structure: "Create `components/agent/AgentSkillsTab.tsx`"

---

## Description

Implement the **Skills** tab with three capabilities:

1. **List embedded skills** — render each skill (name + description) as a card or list item with a remove button
2. **Add new skill form** — form with name (required), description (required), instructions (optional), and an Add button
3. **Remove skill** — each skill in the list has a remove button; clicking it removes the skill from the draft array

All changes are draft state only and persist only when the global Save action is pressed. The tab uses the existing `Skill` type from `lib/agents/types.ts` and deduplicates by skill `id`.

---

## Acceptance Criteria

- The Skills tab renders inside the tab layout in the detail page
- When an agent has skills, each skill renders with its name and description in a list or card layout
- Each skill card has a remove button (destructive icon or text)
- The add form has fields: Name (required, text input), Description (required, textarea), Instructions (optional, textarea)
- The Add button is disabled when Name or Description is empty after trimming
- Adding a skill: validates required fields, generates a client UUID via `crypto.randomUUID()`, adds to draft, clears form
- Adding a skill: rejects if a skill with the same `id` already exists (dedup)
- Removing a skill: removes from draft array immutably (spread + filter)
- When no skills are present, show an "No skills added yet. Add a skill to get started." message
- The skill count badge in the Overview tab updates to reflect the draft count (not persisted yet)
- `npm run lint` and `npm run build` pass

---

## Out of Scope

- Saving skills to the store (handled by the Save action)
- Editing an existing skill inline (only add/remove)
- Importing from the global `lib/skills/store.ts` skills
- Skill templates or presets

---

## Domain

### Embedded Skill Management

Agents store skills as embedded `Skill[]` objects (not references to a global skill store). Adding/removing skills mutates the agent's embedded array, which is then persisted through the common Save operation.

This mirrors the wizard's skill creation flow but operates on draft state rather than creating persistently on each add.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentSkillsTab.tsx` |

---

## Implementation Notes

### Draft state integration

The component should integrate with the shared draft pattern. Accept:

```ts
interface AgentSkillsTabProps {
  agent: Agent
  draft: AgentDefinition
  onChange: (draft: AgentDefinition) => void
}
```

The `onChange` callback receives the full `AgentDefinition` so the parent can merge this tab's state changes with other tabs' changes.

### Skill add form validation

Reuse the wizard's required field pattern: name and description are required, instructions is optional. Use `crypto.randomUUID()` for client-generated skill IDs (no server-side ID generation).

### Remove action

The remove button calls a callback that returns the filtered draft array:

```ts
function handleRemoveSkill(skillId: string) {
  const filtered = draft.skills.filter((s) => s.id !== skillId)
  onChange({ ...draft, skills: filtered })
}
```

### UI pattern

- Skill list items: render using a `Card` or simple list row with the skill name as heading and description as text
- Remove button: small destructive button (X icon or "Remove" text) aligned to the right
- Empty state: centered muted text
- Form: use existing `FieldGroup` + `Field` components

### Shadcn conventions

- Use `gap-*` classes (not `space-*`)
- Use `Badge` for the skill count
- Follow base-nova visual style (muted text for empty states, consistent spacing)
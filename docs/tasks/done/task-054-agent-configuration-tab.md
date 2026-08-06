# Task 054 — Configuration Tab

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Configuration tab: editable name, description, model (free-text input), system prompt"
- Operations: "Save configuration and memberships"
- Structure: "Create `components/agent/AgentConfigurationTab.tsx`"
- Trade-offs: "Use a controlled draft for all editable fields"

---

## Description

Implement the **Configuration** tab with editable fields for all mutable agent definition properties:

- **Name** — text input (required)
- **Description** — textarea (required)
- **Model** — free-text input (required, not a dropdown — user types the model name)
- **System Prompt** — large textarea (required)

All fields use controlled components with draft state. Changes are NOT persisted until the Save action is pressed — the tab stores values in component state.

This task is informed by the existing `AgentEditor` which already has name, description, and system prompt edits but also has model as a read-only badge. This refactors the model field to a free-text input and adds proper draft isolation per tab.

---

## Acceptance Criteria

- The Configuration tab renders within the tab layout in the detail page
- **Name** input is a single-line text input, pre-filled with the agent's current name
- **Description** is a textarea, pre-filled with the agent's current description, at least `min-h-20`
- **Model** is a free-text input (not a select/dropdown, not a badge), pre-filled with the agent's model
- **System Prompt** is a large textarea, pre-filled with the agent's system_prompt, at least `min-h-40`
- All four fields use controlled components (React state, not HTML-only)
- Draft changes are not persisted to the store — field edits alone do nothing to localStorage
- When `name`, `description`, `model`, or `system_prompt` is empty after trimming, the Save button (in task 057) will be disabled
- The existing `FieldGroup` + `Field` + `FieldLabel` pattern from `AgentEditor` is preserved
- `npm run lint` and `npm run build` pass

---

## Out of Scope

- Real-time auto-save (save only on explicit Save action)
- Field validation messages (disabled Save + toast is sufficient)
- Model autocomplete or suggestions (free-text only)
- Copy/paste system prompt templates
- Rich text editor — plain textarea

---

## Domain

### Agent Configuration

The agent's name, description, model, and system prompt constitute its definition. These are the primary fields that operators adjust to tune agent behavior.

Persisting these fields together as a single store update (atomic save) prevents partial configurations from being stored.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/AgentConfigurationTab.tsx` |

---

## Implementation Notes

### Draft state

The tab component should accept the loaded `agent` as a prop and also accept an `onChange(draft)` callback so the parent page (or shared wrapper) can track the current draft state. The configuration tab can expose the draft fields it manages:

```ts
interface AgentConfigurationTabProps {
  agent: Agent
  onChange: (draft: AgentDefinition) => void
}
```

Where `AgentDefinition` is `Pick<Agent, "name" | "description" | "model" | "system_prompt" | "skills" | "tools">` (already defined in `lib/agents/types.ts`).

### Controlled inputs

Use `useState(agent.name)`, `useState(agent.description)`, etc. with `onChange={(e) => setName(e.target.value)}` pattern. On every input change, compute the current draft and call `onChange(draft)` so the parent tracks the accumulated draft.

### Use existing patterns

- `FieldGroup` / `Field` / `FieldLabel` from `@/components/ui/field`
- `Input` from `@/components/ui/input`
- `Textarea` from `@/components/ui/textarea`
- `cn` from `@/lib/utils` (if needed for dynamic className)
- Follow the layout structure already used in the existing `AgentEditor`

### Free-text model input

The user confirmed: model is a free-text input, NOT a dropdown or select. This means the component does NOT need a model options list or validation against known providers.
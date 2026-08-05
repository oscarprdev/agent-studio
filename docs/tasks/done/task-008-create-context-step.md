# Task 008 — Context Step Component

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 8: ContextStep Component

---

## Description

Implement Step 4 of the wizard: a textarea where the user provides additional context (repository structure, architecture docs, coding conventions, dependencies) that will be included in the agent's system prompt.

This step is optional but highly recommended for agents that need domain knowledge.

---

## Acceptance Criteria

- `components/agent/wizard/ContextStep.tsx` exists
- Has `"use client"` directive
- Accepts props: `value: string`, `onChange: (value: string) => void`
- Imports `FieldGroup`, `Field`, `FieldLabel`, `Textarea` from `@/components/ui/`
- Renders `FieldGroup` with `Field` containing `FieldLabel` and `Textarea`
- Label text: "Additional context"
- Placeholder text includes example: "Repository structure, architecture docs, coding conventions, dependencies..."
- Includes helper/description text explaining what context helps the agent (e.g., "Add repository structure, coding conventions, or domain-specific rules to improve the agent's output")
- Uses controlled input pattern with `value` and `onChange` props
- Textarea is larger than a standard input (multiple rows)
- Uses shadcn form conventions (FieldGroup + Field layout)
- Uses `gap-*` for spacing
- Uses semantic colors
- `onChange` forwards the new string value to parent
- Empty context is valid — agent uses general knowledge without it

---

## Out Of Scope

- Context validation (length limits, format checking)
- File upload for docs
- Context preview or analysis
- Character count display

---

## Domain

### Agent Context

Supplemental knowledge that helps the agent work more effectively in a specific domain. This is not tool access or behavioral skills — it's raw information the agent can reference in its responses.

Importance:

An agent with no context knows general-purpose skills. An agent with repository structure, coding conventions, and domain docs can produce tailored, context-aware output.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/wizard/ContextStep.tsx` |
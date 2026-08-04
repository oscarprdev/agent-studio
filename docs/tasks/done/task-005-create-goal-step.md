# Task 005 — Goal Step Component

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 5: GoalStep Component

---

## Description

Implement Step 1 of the wizard: a textarea where the user describes what the agent should do. The step validates that the goal is non-empty before allowing progression.

This is the simplest wizard step — just a textarea with label and example placeholder text.

---

## Acceptance Criteria

- `components/agent/wizard/GoalStep.tsx` exists
- Has `"use client"` directive
- Accepts props: `value: string`, `onChange: (value: string) => void`
- Imports `FieldGroup`, `Field`, `FieldLabel`, `Textarea` from `@/components/ui/`
- Renders `FieldGroup` with `Field` containing `FieldLabel` and `Textarea`
- Label text: "What should this agent do?"
- Placeholder text includes example: "Create an agent that reviews GitHub PRs, creates Linear tasks, updates documentation"
- Includes helper/description text explaining what to describe
- Uses controlled input pattern with `value` and `onChange` props
- Textarea respects shadcn form conventions (FieldGroup + Field layout)
- Uses `gap-*` for spacing
- Uses semantic colors
- `onChange` forwards the new string value to parent

---

## Out Of Scope

- Validation logic (parent controls Next button state)
- Character limits
- Auto-save or draft persistence

---

## Domain

### Agent Goal

The natural language description of the agent's purpose. This is the seed from which the AI generator derives name, description, system prompt, and skills.

Importance:

The goal is the most important input — it drives all generated content in step 5. A clear, specific goal produces a much more useful agent.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/agent/wizard/GoalStep.tsx` |
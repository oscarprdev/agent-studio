# Task 001 — Agent Type Definitions

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 1: GetAgentTypes

---

## Description

Define the TypeScript type system for the Agent Builder feature. All domain types live in a single file so components, store, and mock generator share the same contract.

Export interfaces for `Tool`, `Skill`, `Agent`, `WizardState`, `AgentDefinition`, and `CreateAgentInput`.

This is the foundation layer — every other task depends on these types being present.

---

## Acceptance Criteria

- `lib/agents/types.ts` exists as a pure TypeScript file (no React imports)
- Exports `Tool` interface with: `id`, `name`, `description`, `category`, `icon?`
- Exports `Skill` interface with: `id`, `name`, `description`, `instructions`, `tools` (string[])
- Exports `Agent` interface with: `id`, `name`, `description`, `model`, `system_prompt`, `skills` (Skill[]), `tools` (Tool[]), `version` (semver string), `createdAt`, `updatedAt`
- Exports `WizardState` interface with: `currentStep` (number), `goal`, `selectedTools` (string[]), `skills` (Skill[]), `context`, `generatedAgent?` (Agent)
- Exports `AgentDefinition` as a subset of `Agent` fields used in generation
- Exports `CreateAgentInput` as a subset of `Agent` fields used for creation
- All fields are typed (no `any`)
- `tools` and `skills` arrays are never undefined (use `Tool[]` / `Skill[]`)

---

## Out Of Scope

- Persistence logic (store layer)
- Default sample data
- UI components
- Generation logic

---

## Domain

### Agent

Represents a configurable AI assistant within Agent Studio. Created via wizard, stored in localStorage, and editable.

Importance:

Central domain entity of the feature. All wizard steps feed into its construction.

Implementation scope:

This task defines the interface contracts. No runtime behavior is implemented — only type declarations.

### Tool

A named MCP tool that an agent can use (GitHub, Linear, Notion, etc.).

Importance:

Tools are selected at step 2 of the wizard and become part of the agent's capability set.

### Skill

A specialized capability with instructions that an agent can activate.

Importance:

Skills at step 3 augment what the agent can do beyond raw MCP tools.

### WizardState

The ephemeral state guiding creation of a single agent through 5 steps.

Importance:

Keeps wizard data in-memory between steps without persistence until save.

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/agents/types.ts` |
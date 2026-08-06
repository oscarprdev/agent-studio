# Task 048 - Add SaveAgentInput type

## Reference

Plan document:

docs/plans/plan-017-agent-storage-layer.md

Relevant section:

- **E — Entities** → `SaveAgentInput` section (new type-level input contract)
- **Structure** → `lib/agents/types.ts`: "Add the minimal save input type or compatible type alias needed by `saveAgent`."
- **Approach:** point 4 — "Implement the new names as aliases/wrappers where semantics are identical, and route new functionality through the canonical operations."
- **Norms:** "Compatibility: Keep `CreateAgentInput` for existing callers. If implementation chooses a function overload instead of exporting this named type, document that `saveAgent` accepts the corresponding union explicitly."

---

## Description

Add a new `SaveAgentInput` type to `lib/agents/types.ts` that supports both create and update semantics for `saveAgent`. This type must be a **compatible superset** of the existing `CreateAgentInput`.

The existing `CreateAgentInput` is:

```ts
export type CreateAgentInput = Pick<
  Agent,
  "name" | "description" | "model" | "system_prompt" | "skills" | "tools"
>;
```

The new `SaveAgentInput` should add optional persisted metadata fields: `id`, `version`, `createdAt`, and `updatedAt`. This allows the same save function to create (no ID → generate UUID + timestamps) or update (ID present → update existing record).

The `CreateAgentInput` must continue to export as before — no breaking changes.

### What to add

1. **`SaveAgentInput`** — a new type that extends `CreateAgentInput` with optional persisted metadata:

```ts
export type SaveAgentInput = CreateAgentInput & {
  id?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

This preserves all existing fields from `CreateAgentInput` while adding optional fields for update semantics. A caller that only provides the required input fields (without `id`) triggers create; a caller that provides an `id` triggers update.

2. **Do NOT modify** the existing `Agent`, `Skill`, `Tool`, `WizardState`, `AgentDefinition`, or `CreateAgentInput` types.

3. **Order matters:** This task must be executed **after** task-047 (storage hardening) so that the type is stable before the store functions that consume it are written.

---

## Files to modify

| File | Action |
|---|---|
| `lib/agents/types.ts` | Add `SaveAgentInput` type; preserve all existing exports |

---

## Acceptance criteria

- [ ] `SaveAgentInput` type is exported from `lib/agents/types.ts`.
- [ ] `SaveAgentInput` includes all required fields from `CreateAgentInput` (`name`, `description`, `model`, `system_prompt`, `skills`, `tools`) plus optional `id`, `version`, `createdAt`, `updatedAt`.
- [ ] All existing named exports from `lib/agents/types.ts` are preserved (`Tool`, `Skill`, `Agent`, `WizardState`, `AgentDefinition`, `CreateAgentInput`).
- [ ] `CreateAgentInput` is unchanged and still exports the same `Pick`.
- [ ] No TypeScript compilation errors in `lib/agents/types.ts`.
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.

---

## Out of scope

- `saveAgent` function implementation (task-049).
- Modifying existing types in any way.
- Adding new interfaces or types beyond `SaveAgentInput`.
- Modifying `lib/agents/store.ts` (task-049).

---

## Domain

### Extensible Input Types Pattern

Using intersection (`&`) with optional fields allows a single type to express both create-on-missing-ID and update-on-present-ID semantics. This is a common pattern in TypeScript for REST-like upsert APIs where the presence of an identifier selects the operation mode.

`CreateAgentInput` remains unchanged because other parts of the codebase (wizard, editor) explicitly use it by name. Removing or modifying it would cause a compile failure across multiple pages.

### Field Ordering Convention

Plan "N — Norms": "Follow current strict TypeScript conventions and `@/*` imports. Preserve snake_case `system_prompt`, object arrays, and string `version`."

The existing `Agent` shape uses `system_prompt` (snake_case), `Skill[]`, `Tool[]`, and `version: string`. These are the project's documented conventions and all consumers expect them. Do not rename or re-type any existing field.
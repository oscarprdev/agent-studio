# Task 050 - Implement duplicateAgent, exportAgentMarkdown, and dashboard migration

## Reference

Plan document:

docs/plans/plan-017-agent-storage-layer.md

Relevant sections:

- **D — Definition of Done:** duplication, markdown export, dashboard list migration
- **Operation: `duplicateAgent`** (full spec — clone with new UUID, "(Copy)" suffix, deep clone arrays)
- **Operation: `exportAgentMarkdown`** (full spec — deterministic markdown string)
- **Operation: Dashboard agent count** (use `listAgents().length`)
- **Current state analysis:** "`app/(dashboard)/dashboard/page.tsx` currently computes its initial stats once with `getAll().length`... must be switched to the requested `listAgents()` API."

---

## Description

Implement three remaining pieces of work:

1. **`duplicateAgent(id)`** — clone an existing agent with a new UUID, "(Copy)" suffix on name, and deep-cloned arrays.
2. **`exportAgentMarkdown(id)`** — return a deterministic markdown string for an agent by ID.
3. **Dashboard migration** — switch the dashboard's agent count from `getAll()` to `listAgents()`.

All functions must be SSR-safe and follow the conventions established in tasks 047–049.

### `duplicateAgent(id: string): Agent | null`

Clone an existing agent. The original must remain unchanged.

1. Read the agent array via `readAll()`.
2. Find the source agent by `id`.
3. Return `null` if not found.
4. Create a clone with:
   - New UUID: `crypto.randomUUID()`
   - New name: `${source.name} (Copy)` (note the space before "(Copy)" — matches existing `AgentEditor.handleDuplicate` naming convention)
   - Fresh timestamps: `createdAt` and `updatedAt` set to `new Date().toISOString()`
   - All content fields preserved: `description`, `model`, `system_prompt`, `version`
   - **Deep-cloned arrays**: `skills: [...source.skills]` and `tools: [...source.tools]` — clone the arrays so later mutation of the clone's arrays does not affect the original.
5. Push clone to array, persist, return the clone.
6. If persist fails, return `null` (matching existing store convention for operations that return `null` on write failure).
7. If `crypto.randomUUID()` throws, return `null`.

**Edge cases:**
- Empty/invalid `id` → `null` (no storage read).
- Unknown `id` → `null`.
- Source has missing `skills`/`tools` arrays → default to `[]` (defensive).
- SSR → `null`.
- Original agent must remain **unchanged** (no shared references).

### `exportAgentMarkdown(id: string): string | null`

Return a deterministic, readable markdown string for an agent. Pure function (no side effects, no DOM, no downloads). The UI layer owns download behavior.

1. Retrieve the agent via `getAgent(id)`.
2. Return `null` if not found.
3. Build markdown string with stable field ordering:

```
# {name}

## Description
{description}

## Model
{model}

## System Prompt
{system_prompt}

## Tools
{list of tools or _None_}

## Skills
{list of skills or _None_}

## Metadata
- **ID**: {id}
- **Version**: {version}
- **Created**: {createdAt}
- **Updated**: {updatedAt}
```

4. **Tools rendering**: For each tool, render `- {name}: {description}` (category `{category}` if desired). If no tools, render `_None_`.
5. **Skills rendering**: For each skill, render `- {name}: {description}`. If no skills, render `_None_`.
6. **Multiline content**: Use fenced code blocks (```) for `system_prompt` and any multiline `description`/`instructions` to keep markdown valid and readable.
7. Return the string. Never throw.

**Edge cases:**
- Missing/invalid `id` → `null` (no storage read).
- Unknown `id` → `null`.
- Empty `tools`/`skills` arrays → render `_None_`.
- Multiline `system_prompt` → fenced in code block.
- Markdown-sensitive characters in fields → no special escaping needed beyond fenced blocks (markdown text is rendered, not executed).
- SSR → `null`.

### Dashboard Migration

Update `app/(dashboard)/dashboard/page.tsx` to use `listAgents()` instead of `getAll()`.

1. Change the import:
   - **Before**: `import { getAll } from "@/lib/agents/store"`
   - **After**: `import { listAgents } from "@/lib/agents/store"`

2. Change the stat computation:
   - **Before**: `if (s.label === "Agents") return { ...s, count: getAll().length }`
   - **After**: `if (s.label === "Agents") return { ...s, count: listAgents().length }`

3. Keep the existing lazy `useState` initialization pattern — localStorage is read once for the initial render path.
4. Leave skills count (`getAllSkills()`) and prompts count (`getAllPrompts()`) untouched.
5. Leave the rest of the component (quick actions, recent activity) untouched.

---

## Files to modify

| File | Action |
|---|---|
| `lib/agents/store.ts` | Add `duplicateAgent` and `exportAgentMarkdown` exports |
| `app/(dashboard)/dashboard/page.tsx` | Change import and stat call from `getAll` to `listAgents` |

---

## Acceptance criteria

### `duplicateAgent`
- [ ] `duplicateAgent(id: string)` is exported from `lib/agents/store.ts`.
- [ ] Returns `Agent | null`.
- [ ] Creates a new agent with a **new UUID** (different from source).
- [ ] Name is `${source.name} (Copy)` with space before "(Copy)".
- [ ] `createdAt` and `updatedAt` are fresh timestamps (not copied from source).
- [ ] Content fields preserved: `description`, `model`, `system_prompt`, `version`.
- [ ] `skills` and `tools` arrays are **deep-cloned** (new array references, same objects).
- [ ] Source agent's `id`, `name`, `createdAt`, `updatedAt`, and arrays remain **unchanged**.
- [ ] Appends clone to storage and persists.
- [ ] Empty/invalid `id` → `null` (no storage read).
- [ ] Unknown `id` → `null`.
- [ ] SSR → `null` (no throw).
- [ ] Source arrays missing in legacy data → defaults to `[]` (defensive).

### `exportAgentMarkdown`
- [ ] `exportAgentMarkdown(id: string)` is exported from `lib/agents/store.ts`.
- [ ] Returns `string | null`.
- [ ] Returns `null` for missing/invalid `id` or unknown `id`.
- [ ] Markdown string includes all documented agent fields in stable order: name, description, model, system_prompt, tools, skills, metadata (id, version, createdAt, updatedAt).
- [ ] Empty tools/skills render `_None_` (not omitted).
- [ ] Each tool rendered with name, description, and category.
- [ ] Each skill rendered with name, description.
- [ ] Multiline `system_prompt` is fenced in a code block.
- [ ] Returns text only — no Blob, no download, no DOM interaction.
- [ ] SSR → `null` (no throw).
- [ ] Never throws on any input.

### Dashboard migration
- [ ] `app/(dashboard)/dashboard/page.tsx` imports `listAgents` (not `getAll`) from `@/lib/agents/store`.
- [ ] Agents stat uses `listAgents().length` (not `getAll().length`).
- [ ] Lazy `useState` initialization pattern preserved.
- [ ] Skills and prompts counts use their respective stores unchanged.
- [ ] No other component code is modified.

### Overall
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] All existing consumers still compile without modifications.
- [ ] Backward compatibility: all legacy exports (`getAll`, `getById`, `create`, `update`, `remove`) still present.
- [ ] No new dependencies added.

---

## Out of scope

- Modifying `AgentEditor.handleDuplicate` or `AgentEditor.handleExportMarkdown` (existing UI still works with legacy imports).
- Adding browser download / Blob behavior to `exportAgentMarkdown` (UI layer owns this).
- Cross-tab synchronization.
- Adding tests.
- Modifying `app/(dashboard)/agents/page.tsx` or `app/(dashboard)/agents/[id]/page.tsx` or `components/agent/AgentEditor.tsx` or `components/agent/AgentWizard.tsx`.

---

## Domain

### Duplication Pattern

The project's duplication convention is established by `lib/skills/store.ts`'s `duplicate(id)` function:

```ts
// Pattern from skills/store.ts:
const clone: Skill = {
  ...original,
  id: crypto.randomUUID(),
  name: `${original.name} (copy)`,
  tags: [...original.tags],
  createdAt: now,
  updatedAt: now,
};
```

The agent version follows the same pattern but with:
- `(Copy)` capitalization (matching existing `AgentEditor.handleDuplicate` which uses `(Copy)` not `(copy)`).
- Deep-cloned `skills` and `tools` arrays (not just one `tags` array).
- The agent store's existing `create` function generates UUID + timestamps internally, but `duplicateAgent` must generate them explicitly because it's cloning an existing record with specific naming rules.

### Markdown Export — Pure Function

`exportAgentMarkdown` is a **pure function**: same input → same output, no side effects, no DOM, no network. This makes it:
- Testable (no mocking required).
- Reusable (any UI can call it).
- Safe (never executes stored content).

Browser download behavior (Blob, URL.createObjectURL, anchor click) lives in `AgentEditor.handleExportMarkdown` and is separate. The store function provides the **data**, the UI provides the **delivery**.

### Dashboard Migration — Minimal Change

The dashboard change is surgical: one import line and one function call. No new state, no new effects, no re-render logic changes. The lazy `useState` pattern already ensures localStorage is read once on mount.

### Mermaid Graph: duplicateAgent Flow

```mermaid
flowchart TD
    DA[duplicateAgent id] --> CHK{Valid id?}
    CHK -- no --> RETN[return null]
    CHK -- yes --> LOAD[readAll]
    LOAD --> FIND{Found source?}
    FIND -- no --> RETN
    FIND -- yes --> CLONE[create clone:\n  id = new UUID\n  name = source.name + ' (Copy)' \n  createdAt = updatedAt = now\n  skills = [...source.skills]\n  tools = [...source.tools]\n  preserve: description, model,\n           system_prompt, version]
    CLONE --> PUSH[push clone to array]
    PUSH --> PERS[persist]
    PERS --> RETCL[return clone Agent]
```
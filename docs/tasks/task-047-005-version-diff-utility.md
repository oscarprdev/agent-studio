# Task 047-005 — Version Diff Utility

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant sections:

- O, Operation 5: Render and Compare Versions
  - Step 1 (scalar changes), Step 5 (line-level prompt diff), Step 6 (ID-based tool/skill delta)
  - "Compute line-level system-prompt additions/removals and render semantic added/removed highlighting"
  - "Compute tool/skill additions and removals by ID and label them clearly"
- S, Structure — Files To Create: `lib/agents/version-diff.ts`
  - "pure comparison helpers for scalar fields, line-based system-prompt changes, and ID-based tools/skills deltas"
- S, Approach:
  - "Implement comparison as a pure derived calculation in the compare component or a small local utility. Do not add a diff package. Use semantic styling for additions/removals."

---

## Description

Create a pure-module utility file with comparison helpers that compute the difference between an `AgentVersion` snapshot and a current `Agent` configuration. These are simple, deterministic functions with no side effects, no DOM, no dependencies beyond existing types.

### Module: `lib/agents/version-diff.ts`

The module exports three comparison functions. A fourth composites them for the UI.

### Function 1: `diffScalarFields`

```typescript
function diffScalarFields(
  version: AgentVersion,
  current: Agent,
  fields: Array<keyof Pick<AgentVersion, 'name' | 'description' | 'model'>>
): DiffResult
```

For each requested field, compares string values:
- `'same'` if both equal
- `'changed'` if both differ and are non-empty
- `'added'` if version is empty and current is non-empty (shouldn't happen — version is older, but handle it)
- `'removed'` if version is non-empty and current is empty

**Return type:**

```typescript
type FieldDiff<V extends string = string> = {
  field: V;
  status: 'same' | 'changed' | 'added' | 'removed';
  versionValue: string | undefined;
  currentValue: string | undefined;
}

type ScalarDiffResult = FieldDiff<'name' | 'description' | 'model'>[];
```

### Function 2: `diffSystemPrompt`

```typescript
function diffSystemPrompt(
  versionPrompt: string,
  currentPrompt: string
): PromptDiff[]
```

A simple line-based diff (no diff library). Compares each line of the two versions:
- Lines in `current` but not `version` → `{ status: 'added', line: string }`
- Lines in `version` but not `current` → `{ status: 'removed', line: string }`
- Lines unchanged → not included (or optionally included with `status: 'same'`)

**Implementation approach**: Compute a set of lines from each prompt. Lines present in one but not the other are additions/removals. For multiline prompts with reordered lines, this is an approximation — document this limitation.

**Return type:**

```typescript
type PromptDiff = {
  status: 'added' | 'removed';
  line: string;
}
```

### Function 3: `diffCollection`

```typescript
function diffCollection<T extends { id: string }>(
  versionItems: T[],
  currentItems: T[],
  labelField: keyof T
): CollectionDiff
```

Generic diff for tools or skills:
- Items in `current` but not `version` (by `id`) → `added`
- Items in `version` but not `current` (by `id`) → `removed`

**Return type:**

```typescript
type CollectionDiff<T extends { id: string }> = {
  added: (T & { diffStatus: 'added' })[];
  removed: (T & { diffStatus: 'removed' })[];
}
```

### Function 4 (Composite): `compareVersion`

```typescript
function compareVersion(
  version: AgentVersion,
  current: Agent
): VersionComparison
```

Composites all three diff functions into a single structured result for the UI to render:

```typescript
type VersionComparison = {
  name: FieldDiff<'name'>;
  description: FieldDiff<'description'>;
  model: FieldDiff<'model'>;
  promptDiffs: PromptDiff[];
  toolDiffs: CollectionDiff<Tool>;
  skillDiffs: CollectionDiff<Skill>;
}
```

### Guidelines

- All functions are **pure** — no side effects, no localStorage, no I/O
- Handle empty/undefined/null gracefully (return empty arrays or `'same'`)
- Do not add external dependencies (no diff libraries)
- Line-ordering in `diffSystemPrompt`: since no diff library is used, process lines in order and mark lines present in one but not the other. Document the limitation (reorderings without content changes are not detected).

---

## Acceptance Criteria

- `lib/agents/version-diff.ts` exists and exports: `diffScalarFields`, `diffSystemPrompt`, `diffCollection`, `compareVersion`
- `diffScalarFields` correctly identifies changed, added, removed, and same fields
- `diffSystemPrompt` returns an array of `{ status, line }` where status is `'added'` or `'removed'`
  - Lines in current only → `'added'`
  - Lines in version only → `'removed'`
  - Lines in both → not included
- `diffCollection` correctly identifies added/removed items by stable `id`
- `compareVersion` composes all three and returns a complete `VersionComparison` object
- All functions handle empty/undefined/null input gracefully (return empty arrays, not errors)
- `compareVersion` result always has the four fields: `promptDiffs`, `toolDiffs`, `skillDiffs`, and the three scalar diffs
- TypeScript compile passes with `strict` mode
- Manual test (console): running `compareVersion` with known inputs produces expected diffs
  - Test case: `version.prompt = "A\nB\nC"`, `current.prompt = "A\nD\nC"` → expects `[{ status: 'added', line: 'D' }, { status: 'removed', line: 'B' }]`
  - Test case: identical agent/version → expects empty diffs and `'same'` field statuses

---

## Out Of Scope

- Three-way diffs (version ↔ version ↔ current)
- Word-level diff inside lines (only line-level)
- Line reordering detection (documented as MVP limitation)
- React components or hooks
- Integration into the UI (Tasks 047-006 / 047-007)

---

## Domain

### Simple Line Diff

For MVP, only line-level diffing is needed. Word-level or character-level diff would require including a library like `diff` or `min-diff`, which is out of scope. Line-level diff is sufficient for agent prompts which are typically structured blocks of text.

### ID-Based Collection Diff

Tools and skills have stable `id` fields. The diff compares identity (is this exact ID present?) not content (did tool X's name change). Content changes to existing items are not tracked by this diff — only additions and removals of items by ID.

---

## Dependencies

- Task 047-002 (`AgentVersion`, `Agent`, `Tool`, `Skill` types)

## Files

| Action | Path |
|--------|------|
| Create | `lib/agents/version-diff.ts` |
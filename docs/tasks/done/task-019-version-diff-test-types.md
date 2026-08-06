# Task 019: Add Version, Diff, and Test Types

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **E — Entities** (PromptVersion, PromptDiff, TestResult)

## Objective

Extend `lib/prompts/types.ts` with `PromptVersion`, `PromptDiffLine`, `PromptDiff`, and `TestResult` type definitions without modifying any existing types.

## Context

- **Existing file**: `lib/prompts/types.ts` (21 lines)
- The existing `Prompt` type and `PromptSections` interface must remain untouched.
- All new types are purely additive.
- The project uses `@/*` path alias and TypeScript strict mode.

### Entity specs from the plan

**PromptVersion**
```ts
interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  title: string;
  content: PromptSections;
  markdown: string;
  createdAt: string;
}
```
- Monotonically increasing `version` numbers (no gapless enforcement after pruning).
- `markdown` is the exact editor snapshot; `content` is the parsed `PromptSections` for restoration.

**PromptDiffLine**
```ts
interface PromptDiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}
```

**PromptDiff**
```ts
interface PromptDiff {
  lines: PromptDiffLine[];
}
```

**TestResult**
```ts
interface TestResult {
  input: string;
  output: string;
  createdAt: string;
  status: "success" | "error";
}
```

## Steps

1. Open `lib/prompts/types.ts`.
2. Add `PromptVersion` interface after the existing `CreatePromptInput` type.
3. Add `PromptDiffLine` and `PromptDiff` interfaces.
4. Add `TestResult` interface.
5. Do not modify any existing exports or types.

## Files

- **Modify**: `lib/prompts/types.ts`

## Acceptance Criteria

- [ ] `PromptVersion` interface is present with all six fields (`id`, `promptId`, `version`, `title`, `content`, `markdown`, `createdAt`)
- [ ] `PromptDiffLine` interface is present with `type`, `content`, `oldLineNumber`, `newLineNumber`
- [ ] `PromptDiff` interface is present with `lines: PromptDiffLine[]`
- [ ] `TestResult` interface is present with `input`, `output`, `createdAt`, `status`
- [ ] No existing types (`Prompt`, `PromptSections`, `PromptSectionKey`, `CreatePromptInput`) were modified
- [ ] `npm run build` passes (no TypeScript errors)

## Dependencies

None (standalone type definitions)
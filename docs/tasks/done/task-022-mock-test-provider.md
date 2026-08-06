# Task 022: Mock Test Provider

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **E — Entities** (TestResult), **A — Approach** (Rendering and composition), **O — Operations** /Operation 5

## Objective

Create an isolated deterministic mock test provider in `lib/prompts/test-provider.ts` that accepts a prompt markdown string and a user message, and returns a synthetic `TestResult`. The provider must be the single replacement point for a real LLM provider in the future.

## Context

- The plan explicitly states: "the mock provider is isolated so replacing it with a real LLM provider requires changing one implementation file."
- `TestResult` type is already defined by Task 021.
- No real LLM calls, network requests, or credentials.
- MVP output is deterministic enough for manual verification.
- Empty or whitespace-only sample messages are rejected before execution.
- The provider is called by the `TestPanel` component; the UI must never change when swapping mock ↔ real provider.

### API contract

```ts
export interface TestProviderResult {
  input: string;
  output: string;
  createdAt: string;
  status: "success" | "error";
}

/**
 * Execute the mock test provider.
 * @param promptMarkdown - The current editor draft (unsaved markdown).
 * @param userMessage - The sample user message to test against.
 * @returns A TestResult with mock output.
 * @throws Error if userMessage is empty or whitespace-only.
 */
export function executeMockTest(
  promptMarkdown: string,
  userMessage: string,
): TestResult;
```

### Mock output behavior

- If `userMessage.trim().length === 0` → throw an error (empty input).
- Otherwise → return a deterministic response such as:
  - `input`: the trimmed user message.
  - `output`: `"Mock response for: {userMessage}"` prefixed with the prompt title if available.
  - `createdAt`: `new Date().toISOString()`.
  - `status`: `"success"`.
- Wrap in try/catch: on any unexpected error, return `{ status: "error", output: "Mock execution failed", input: userMessage, createdAt: now }`.

### Important constraint

This file is the ONLY location that produces test output. The `TestPanel` component must import from this module and must know nothing about the mock implementation details — only that it calls a function returning a `TestResult`. Future PRD work can replace the body of `executeMockTest` (or swap it for a different function) without touching `TestPanel.tsx`.

## Steps

1. Create `lib/prompts/test-provider.ts`.
2. Import `TestResult` from `./types`.
3. Implement `executeMockTest(promptMarkdown: string, userMessage: string): TestResult`.
   - Validate `userMessage` — throw on empty/whitespace-only.
   - Return deterministic mock result with `status: "success"`.
   - Wrap in try/catch; return error object on failure.
4. Export `executeMockTest` as the default/sole function.
5. No network calls, no imports from external LLM libraries.

## Files

- **Create**: `lib/prompts/test-provider.ts`

## Acceptance Criteria

- [ ] `executeMockTest` returns a `TestResult` with correct shape (`input`, `output`, `createdAt`, `status`).
- [ ] `executeMockTest` accepts the current editor draft markdown and user message as parameters.
- [ ] `executeMockTest` throws (or returns error) for empty/whitespace-only `userMessage`.
- [ ] Mock output is deterministic and does not imply a real provider call.
- [ ] No network requests or external dependencies.
- [ ] The function is the sole test output source — swapping the implementation requires editing only this file.
- [ ] `npm run build` passes.

## Dependencies

- Task 019 (TestResult type)
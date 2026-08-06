# Task 026: Test Panel

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **E — Entities** (TestResult), **O — Operations** /Operation 5, **S — Safeguards** (Performance)

## Objective

Create a test input/output panel (`TestPanel`) that opens from a button click in the editor, accepts a sample user message, and displays the result from the isolated mock test provider. The panel should show loading, success, and error states gracefully.

## Context

- **New file**: `components/prompt/TestPanel.tsx`
- Uses existing `Sheet` components for slide-out display (right side).
- Imports the mock test provider from `lib/prompts/test-provider.ts` (`executeMockTest`).
- Receives the current editor draft markdown as a prop (not the persisted version — the test uses the **current unsaved text**).
- The provider is isolated: `TestPanel` calls `executeMockTest(promptMarkdown, userMessage)` and renders `TestResult`.

### Component API

```ts
interface TestPanelProps {
  isOpen: boolean;     // Controls sheet open/close
  onClose: () => void; // Close handler
  currentMarkdown: string; // The current editor draft (unsaved)
}
```

### UI structure

```
┌────────────────────────────────────────────┐
│  Sheet (slide-out, right side)              │
│  ┌─────────────────────────────────────────┐│
│  │  Test Prompt                  [Close]   ││
│  ├─────────────────────────────────────────┤│
│  │  Prompt markdown read-only (preview)    ││
│  │  ┌───────────────────────────────────┐  ││
│  │  │ ## ROLE                           │  ││
│  │  │ You are a helpful AI agent.       │  ││
│  │  │ ...                               │  ││
│  │  └───────────────────────────────────┘  ││
│  ├─────────────────────────────────────────┤│
│  │  User message:                          ││
│  │  ┌───────────────────────────────────┐  ││
│  │  │ [Input field]                     │  ││
│  │  └───────────────────────────────────┘  ││
│  │  [Run Test]                             ││
│  ├─────────────────────────────────────────┤│
│  │  [When results appear:]                  ││
│  │  Status: ✅ Success                     ││
│  │  Result:                                ││
│  │  ┌───────────────────────────────────┐  ││
│  │  │ Mock response for: ...            │  ││
│  │  └───────────────────────────────────┘  ││
│  │  Timestamp: Aug 6, 2026, 10:30 AM       ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Steps

1. Create `components/prompt/TestPanel.tsx` with `"use client"`.
2. Import `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `Button`, `Input`, `Textarea`, `Badge` from existing UI.
3. Import `TestResult` type from `./types`.
4. Import `executeMockTest` from `@/lib/prompts/test-provider`.
5. Implement internal state:
   - `userMessage: string` — controlled by input field.
   - `testResult: TestResult | null` — last result or null.
   - `isRunning: boolean` — loading state during execution.
6. Implement the test button handler:
   - If `userMessage.trim().length === 0` → show inline validation error (do not call provider).
   - Set `isRunning = true`, reset `testResult = null`.
   - Call `executeMockTest(currentMarkdown, userMessage.trim())` synchronously (mock is fast, no async).
   - Set `testResult` and `isRunning = false` on success.
   - Catch errors and set `testResult` with `status: "error"`.
7. Render the prompt markdown preview in a read-only block.
8. Render the user message input + "Run Test" button.
9. Render the result when available (success or error state with appropriate styling).
10. Handle panel close: reset `isRunning`, preserve last `testResult` (visible until next execution).
11. Validate that no network requests are made — the provider only calls `executeMockTest`.
12. Use existing `cn` for class composition.

## Files

- **Create**: `components/prompt/TestPanel.tsx`

## Acceptance Criteria

- [ ] `TestPanel` renders as a slide-out sheet with test prompt input and result display.
- [ ] Prompt markdown is displayed as read-only content.
- [ ] User message input accepts text and validates for empty/whitespace-only.
- [ ] Run Test button calls `executeMockTest` with current draft markdown and user message.
- [ ] Results display with correct status badge (success = green, error = red).
- [ ] Loading state during execution (spinner or disabled button).
- [ ] Last result persists until a new execution starts.
- [ ] Panel close preserves (don't lose) the last test result.
- [ ] No network requests in the test flow.
- [ ] `npm run build` passes.

## Dependencies

- Task 019 (TestResult type)
- Task 022 (mock test provider)
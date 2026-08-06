# Task 018.4 — Build Verification: Lint + Build Pass

## Reference

Plan document:

docs/plans/plan-018-auth-types-and-store.md

Relevant sections:

- Definition of Done → "npm run lint" and "npm run build" pass
- Verification operation: AGE-18 acceptance matrix (steps 1–2)

---

## Description

Run the project's build pipeline to verify that all changes from tasks 018.1–018.3 compile and lint without errors.

### Commands

```bash
npm run lint
npm run build
```

### Current State

- The project has `lint` and `build` scripts in `package.json`.
- **No test runner is configured.** There are no test scripts or test files.
- Verification is limited to lint/build success per the plan's norms.

---

## Acceptance Criteria

- `npm run lint` completes with zero errors (exit code 0)
- `npm run build` completes with zero errors (exit code 0)
- No TypeScript compilation errors remain after the changes
- If lint errors exist, fix them in the same task (do NOT create a separate fix task)
- If build errors exist, fix them in the same task

### What to Do on Failure

1. Read the error output to identify the root cause
2. Read the affected file(s)
3. Fix the issue (type mismatch, missing import, syntax error, etc.)
4. Re-run the failing command
5. Repeat until both pass

### What NOT to Do

- Do NOT add test files or a test framework
- Do NOT modify code not already changed by tasks 018.1–018.3 unless fixing a regression introduced by those changes
- Do NOT create follow-up tasks for build issues — resolve them here

---

## Out Of Scope

- Feature-level manual testing (plan mentions this as a separate verification matrix, but is outside the implementer's scope — this task only verifies the build pipeline)
- Browser-based acceptance testing
- Adding tests or a test runner

---

## Domain

### Build Pipeline

The project uses:

- **TypeScript 5** (strict mode, defined in `tsconfig.json`)
- **Next.js 16.2** (App Router)
- **ESLint 9** (flat config with `core-web-vitals` + `typescript` presets)
- **Tailwind CSS v4** via `@tailwindcss/postcss`

Both `lint` and `build` must succeed. TypeScript types are the main source of potential failures — ensure import paths, type annotations, and function signatures are consistent across all modified files.

(No mermaid graph needed — this is a verification step, not a feature flow.)
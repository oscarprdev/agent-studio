# Task 006 - Build and Lint Verification

## Reference

Plan document:

[docs/plans/plan-001-landing-page.md](../plans/plan-001-landing-page.md)

Relevant section:

Operation 5: Replace Root Page → "Ensure no errors", "Page passes `next build` without errors"

Norms → Testing section

---

## Description

Verify that the complete landing page implementation passes both the Next.js production build and ESLint checks. This is the final quality gate for the landing page feature.

**Responsibility:** Run two commands (`npm run build` and `npm run lint`), confirm they succeed, and report any errors for remediation.

---

## Acceptance Criteria

- `npm run build` completes with exit code 0 (no compilation errors, no TypeScript errors, no bundling errors)
- `npm run lint` completes with exit code 0 (no ESLint warnings or errors)
- No unused imports reported in any landing page file or `app/page.tsx`
- No TypeScript errors related to imported components (e.g. missing types, wrong props)
- No warnings about unused CSS classes that would bloat the bundle

---

## Out Of Scope

- Visual inspection on actual browsers (covered by Task 007)
- Adding a test runner or writing tests
- Performance profiling
- Accessibility audit (lighthouse/WCAG)

---

## Domain

### Build Verification

The Next.js build compilation is the ultimate source of truth for code correctness. If `npm run build` passes, all TypeScript types are valid, all imports resolve, and the production bundle can be created without errors.

**Why this matters:** There is no test runner configured in this project. The build command is the only automated correctness gate. It must pass cleanly before considering the feature complete.

**Implementation scope:** Run two commands and report results. If either command fails, document the error for remediation by the implementer or a follow-up task.
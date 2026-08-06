# Task 012 — Clean install and verify dependency versions

## Reference

Plan: [plan-022-migrate-nextjs-163-typescript-7.md](../../plans/plan-022-migrate-nextjs-163-typescript-7.md)

Relevant section: Phase 4 — Installation and Validation

---

## Description

Perform a clean installation of all dependencies after the upgrades in task-001 and task-002, verifying that `node_modules` and `package-lock.json` reflect the correct versions of Next.js, TypeScript, and `eslint-config-next`.

A clean install (`rm -rf node_modules .next && npm install`) is important to catch any residual cached dependencies from the 16.2 / TS5 era that could mask compatibility issues.

---

## Acceptance Criteria

- [ ] `node_modules/` and `.next/` are removed before install
- [ ] `npm install` completes with zero warnings or errors
- [ ] `package-lock.json` exists and is non-empty after install
- [ ] `npx tsc --version` outputs a `7.x.x` version string
- [ ] `node_modules/next/package.json` reports a `16.3.x` version
- [ ] `node_modules/eslint-config-next/package.json` reports a `16.3.x` version
- [ ] No peer dependency conflicts reported by npm

---

## Out Of Scope

- Build verification (handled in task-004)
- Dev server start verification (handled in task-004)
- Lint/type-check verification (handled in task-004)

---

## Domain

### Dependency Resolution

The lockfile ties specific package versions to their transitive dependency trees. Migrating to new major versions (TS5→TS7, Next 16.2→16.3) can cause cascading changes in the transitive dependency graph—a clean install ensures the resolver works correctly end-to-end.

Importance:

A stale or mismatched lockfile can cause subtle runtime errors or build failures that are impossible to debug without a clean install.

Implementation scope:

Remove `node_modules` and `.next`, run `npm install`, then verify installed versions match expectations with `npx tsc --version` and inspection of package.json within `node_modules`.
# Task 047 - Harden storage read/write helpers

## Reference

Plan document:

docs/plans/plan-017-agent-storage-layer.md

Relevant sections:

- **N — Norms** (SSR safety, logging, error handling)
- **S — Safeguards** (SSR safety invariant)
- **Approach:** point 2 — "Harden the boundary first: guard browser access (`typeof window`)/storage availability, parse only arrays, catch both reads and writes."
- **Current state analysis:** "`readAll()` safely returns an empty array for absent or malformed JSON, but browser-storage availability and write failures need to be handled consistently."

---

## Description

Harden the `lib/agents/store.ts` storage boundary so that **every** operation is safe when executed during SSR (before browser render), when localStorage is unavailable, and when storage data is malformed or quota write fails.

The current `readAll()` already guards on absent/malformed JSON. The `persist()` function **does not** catch write errors, and neither `readAll()` nor `persist()` guard against SSR execution (when `window`/`localStorage` are undefined).

This task touches a single file: `lib/agents/store.ts`. No new exports — only internal hardening that all subsequent task functions will depend on.

### What to change

1. **Guard `readAll()`** — Add `typeof window !== "undefined" && window.localStorage` check before accessing localStorage.
2. **Guard `persist()`** — Wrap in `typeof window !== "undefined" && window.localStorage` check AND add try/catch around `localStorage.setItem()` / `JSON.stringify()` to silently swallow quota errors and storage unavailable errors.
3. **Keep existing behavior** — Both functions must continue returning/doing exactly what they do today (empty array on failure, silent errors). Existing callers (`getAll`, `create`, `update`, `remove`) must work identically after this change.

### Reference: project pattern

The file `lib/skills/store.ts` follows the same pattern but has try/catch on `persist` calls inside the mutation functions. For consistency with the agent store's established convention (where `update` and `remove` have their own try/catch), the hardened `persist()` silently catches errors, and callers that need to distinguish success/failure (like `remove` returning boolean) keep their own guards.

---

## Files to modify

| File | Action |
|---|---|
| `lib/agents/store.ts` | Modify `readAll()` and `persist()` internal functions |

---

## Acceptance criteria

- [ ] `readAll()` guards with `typeof window !== "undefined" && window.localStorage` and returns `[]` when storage is unavailable (SSR path).
- [ ] `persist()` guards with `typeof window !== "undefined" && window.localStorage` and wraps `localStorage.setItem()`/`JSON.stringify()` in try/catch that silently returns (no throw).
- [ ] All existing legacy exports (`getAll`, `getById`, `create`, `update`, `remove`) continue to return the same values as before.
- [ ] No `console.log`, `console.warn`, or `console.error` added (plan: "Silent catches").
- [ ] `npm run build` passes (no type errors, build succeeds).
- [ ] `npm run lint` passes (no new lint warnings).

---

## Out of scope

- New public functions (handled in later tasks).
- Storage key changes (must remain `agentstudio:agents`).
- Storage versioning / migration.
- Cross-tab synchronization (out of scope).
- Adding a test runner.

---

## Domain

### Storage Abstraction

`lib/agents/store.ts` is the **single** boundary for all agent persistence. Every consumer imports from this module and never touches `localStorage` directly (except via the store). This centralization enables SSR-safe guards, consistent error handling, and easy migration later.

`readAll()` and `persist()` are internal helpers (not exported). All public functions delegate through them. This pattern mirrors `lib/skills/store.ts` and `lib/prompts/store.ts`.

### SSR Safety

Next.js renders RSCs on the server. Any `localStorage` access on the server throws because `window` is undefined. The `typeof window !== "undefined"` guard must precede every localStorage access, even inside functions that are ultimately called from client components.

### Silent Failure

The existing agent store returns `null` / `false` / `[]` on storage failures rather than throwing. This task preserves that convention. Future callers can choose what to do with failure (show toast, return null, etc.), but the store layer itself must never throw.

### Mermaid Graph: Storage Flow

```mermaid
flowchart TD
    R[Public function calls readAll/persist]
    R --> G{typeof window !== undefined?}
    G -- yes --> S{window.localStorage?\nstorage access}
    G -- no (SSR) --> RA[readAll returns []]
    G -- yes --> P{JSON.parse/Stringify\n+ localStorage access}
    P -- error --> RA
    P -- success --> RA[readAll returns parsed array]
    S -- write --> W{try/catch\nlocalStorage.setItem}
    W -- error --> WRET[persist returns silently]
    W -- success --> WP[agents persisted]
```
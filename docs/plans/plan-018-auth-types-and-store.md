# Plan 018 — Auth Types and Local Storage Store (AGE-18)

This plan is intentionally surgical. AGE-18 is not a greenfield auth implementation: the repository already contains the working mock-auth store, React context, route gate, and user menu from the earlier authentication work. The implementation should close the verified gaps without creating a second auth system or breaking existing imports.

## R — Requirements

### Problem

The issue specification describes a new `lib/auth/types.ts` and `lib/auth/store.ts`, but the repository's active implementation is `lib/auth-store.ts` plus `lib/auth-context.tsx`. The existing implementation already supports login, signup, logout, user/workspace reads, workspace creation, cookie-backed authentication, dashboard protection, and real sidebar user data. It is missing workspace mutation and a token accessor, and the dashboard does not present the current workspace.

### Definition of Done

- `updateWorkspace()` updates the persisted workspace name and/or plan using the existing `AuthResult` error contract.
- `getToken()` exposes the token using the repository's established token storage contract.
- The auth context remains the single React-facing source of state and is extended only if dashboard or future consumers need the new operations.
- The dashboard displays the current workspace name when one exists and has a safe empty state before onboarding.
- Login and signup continue to establish an authenticated session without a dashboard redirect loop.
- Logout continues to clear the session and redirect away from dashboard routes.
- Existing dashboard auth gating remains intact; no raw `localStorage` check is reintroduced.
- `npm run lint` and `npm run build` pass.

### Scope In

- Extend the existing `lib/auth-store.ts` implementation.
- Add the minimum context wiring required for `getToken` and `updateWorkspace`.
- Wire the dashboard to the existing auth context workspace state.
- Reconcile or explicitly document the requested type/module paths without duplicating the store.
- Verify the already-completed layout and sidebar acceptance criteria.

### Scope Out

- Rebuilding authentication, onboarding, proxy/route protection, or the user menu.
- Real backend authentication, JWT validation, password hashing, OAuth, or database persistence.
- Introducing Zustand, a new persistence library, or a test framework.
- Removing the existing `slug` field unless a separate domain migration is approved.
- Replacing the context-based auth gate with direct storage access.

## E — Entities

### User — existing

- **Fields:** `id: string`, `email: string`, `name: string`, `createdAt: string`; stored records additionally contain a mock `password`.
- **Relationships:** The current user may be associated with a workspace through the existing runtime `workspaceId` augmentation.
- **Domain rules:** Password data must not be returned by `getUser()` or stored in `auth_current_user`.
- **Compatibility note:** The current `name` is required and `avatarUrl` is absent. `[NEEDS CLARIFICATION: Confirm whether AGE-18 requires the type-only changes (optional name and optional avatarUrl) now, or whether the existing AGE-7 shape remains authoritative.]

### Workspace — existing

- **Fields:** `id: string`, `name: string`, `slug: string`, `plan: "developer" | "team" | "company"`, `createdAt: string`.
- **Relationships:** One current user can have the persisted current workspace created during onboarding.
- **Domain rules:** Name is trimmed, non-empty, and at most 50 characters; plan must be one of the three existing literal values. `updateWorkspace` must preserve immutable identity/timestamp fields and update only supported mutable fields.
- **Compatibility note:** `slug` is currently generated and persisted although it is not listed in the AGE-18 summary. Preserve it for backward compatibility unless the issue owner explicitly requests a schema change.

### AuthState — conceptual existing context state

- **Fields:** `user: User | null`, `workspace: Workspace | null`, `isAuthenticated: boolean`.
- **Relationships:** `AuthProvider` derives these values from `lib/auth-store.ts` and exposes actions to client components.
- **Domain rules:** State must be refreshed after successful auth/workspace mutations and cleared on logout.
- **Compatibility note:** No standalone `AuthState` interface currently exists. `[NEEDS CLARIFICATION: Is the exact `lib/auth/types.ts` module path part of the acceptance contract, or is equivalent typing in the existing store/context sufficient?]`

## A — Approach

### Overall strategy

1. Treat `lib/auth-store.ts` as the canonical implementation because it is imported by the existing context and already owns all storage keys, validation, cookie synchronization, and error handling.
2. Add `getToken()` beside the existing read helpers and add `updateWorkspace()` beside `createWorkspace()`.
3. Keep `AuthProvider` as the adapter between imperative storage operations and reactive UI state. Expose only the new operations if a consumer requires them; the dashboard can use the already-exposed `workspace` value for display.
4. Update the dashboard page minimally to read `workspace` from `useAuth()` and render its name. Do not read localStorage directly from the page.
5. Preserve completed work in the layout and user menu, validating it rather than rewriting it.

### Storage contract decision

The current implementation writes `auth_token` as a cookie and determines authentication from that cookie plus `auth_current_user`; it does **not** write the token to localStorage. This is consistent with the prior plan's client-to-cookie synchronization for route protection, but differs from the AGE-18 wording “localStorage-backed auth.”

- Preferred minimal implementation: make `getToken()` read the existing cookie and keep cookie synchronization unchanged, so the dashboard gate and any server-facing route protection continue to agree.
- `[NEEDS CLARIFICATION: If acceptance requires `auth_token` specifically in localStorage, change login/signup/logout/isAuthenticated/getToken atomically to maintain that key as well as the cookie; do not implement a one-sided token accessor.]`

### Trade-offs

- **Extend legacy module vs migrate to `lib/auth/`:** Extending the legacy module avoids duplicate stores and import churn. Creating compatibility modules may satisfy literal path checks but risks two sources of truth. Prefer extension unless automated acceptance checks require the new paths.
- **Context workspace vs direct store read:** Context keeps dashboard rendering reactive after onboarding/update. Direct reads would bypass the existing architecture and can become stale.
- **No new test dependency:** The repository has no test runner or test files. Use lint/build plus a focused manual browser/storage verification matrix; adding a test framework is outside this issue.

## S — Structure

### Existing files to modify

- `lib/auth-store.ts` — add `getToken()` and `updateWorkspace()`; preserve existing keys, validation, `AuthResult`, cookie behavior, and `slug` compatibility.
- `lib/auth-context.tsx` — import/expose `getToken` and `updateWorkspace` only if required by consumers; refresh `workspace` after a successful update.
- `app/(dashboard)/dashboard/page.tsx` — consume `workspace` from `useAuth()` and render the workspace name with a null-safe onboarding/empty state.

### Existing files to verify, not rewrite

- `app/(dashboard)/layout.tsx` — already gates via `useAuth().isAuthenticated` and redirects to `/login`.
- `components/layout/user-menu.tsx` — already displays `user.email` and derives avatar initials.
- `components/layout/sidebar.tsx` — already composes `UserMenu` rather than hardcoding user data.

### Files to create

- None for the minimal surgical implementation.

The issue's requested `lib/auth/types.ts` and `lib/auth/store.ts` paths do not exist. `[NEEDS CLARIFICATION: If those exact paths are mandatory, create compatibility modules that re-export the canonical types/functions from `lib/auth-store.ts`, then migrate imports in a separate, explicitly approved change; do not silently create a parallel store in AGE-18.]`

### Dependencies

- None. No npm packages, shadcn components, API routes, or database changes are required.

## O — Operations

### Operation: `getToken`

**Input:** None.

**Output:** `string | null`.

**Steps:**

1. Read the token from the established `auth_token` storage mechanism used by login/signup and the dashboard auth contract.
2. Return the token value when present; return `null` when absent or when browser storage access fails.
3. Keep the accessor read-only; it must not alter authentication state.

**Edge cases:** SSR/non-browser execution, malformed cookie data, missing token, and storage access failure must return `null` rather than throw.

### Operation: `updateWorkspace`

**Input:**

```typescript
{
  name?: string;
  plan?: "developer" | "team" | "company";
}
```

**Output:** `AuthResult<Workspace>`.

**Steps:**

1. Read the current workspace with `getWorkspace()`.
2. Return an error if no workspace exists; do not create one implicitly.
3. Validate provided fields using the same workspace rules as `createWorkspace` (trim/name length and allowed plan).
4. Merge only provided mutable fields into the current workspace while preserving `id`, `slug`, and `createdAt`.
5. Persist the complete updated workspace under `auth_workspace`.
6. Return the updated workspace on success; return the existing store error shape on persistence failure.

**Edge cases:** no current workspace, empty/whitespace name, name over 50 characters, invalid plan, no fields supplied, and localStorage failure. The operation must not partially mutate the workspace.

### Operation: Dashboard workspace display

**Input:** `workspace: Workspace | null` from `useAuth()`.

**Output:** Rendered workspace heading/subtitle; no storage side effects.

**Steps:**

1. Read `workspace` from the existing auth context.
2. Render the workspace name when available.
3. Render a neutral onboarding/empty-state label when it is `null`; do not invent a workspace or redirect from the dashboard.
4. Leave existing agent stats and quick-action links unchanged unless the issue owner confirms “stats wiring” means counts beyond the existing Agents count.

**Edge cases:** initial hydration, authenticated users before onboarding, stale context after workspace mutation, and long workspace names must remain safe and visually bounded by existing layout conventions.

### Verification operation: AGE-18 acceptance matrix

1. Run `npm run lint`.
2. Run `npm run build`.
3. In a browser, sign up with a new account and confirm `auth_current_user` plus the token are persisted according to the finalized storage contract.
4. Confirm signup reaches dashboard/onboarding without a redirect loop.
5. Confirm dashboard auth gating redirects unauthenticated access to `/login`.
6. Create a workspace and confirm its name appears on the dashboard.
7. Update workspace name/plan and confirm the persisted value and context/UI refresh.
8. Confirm the sidebar shows the real email and derived initials.
9. Log out and confirm auth keys are cleared and dashboard navigation redirects away.
10. Confirm `getUser`, `getWorkspace`, `isAuthenticated`, and `getToken` behavior for present and absent data.

## N — Norms

- **Naming:** Preserve camelCase operations, existing `AUTH_*_KEY` constants, literal plan union, and `AuthResult<T>`.
- **Imports:** Continue using the `@/*` alias and the existing `useAuth` context; avoid direct localStorage access in UI components.
- **Logging:** No logging is currently used for auth-store operations. Continue returning typed errors and do not add console output for expected storage failures.
- **Error handling:** Preserve `try/catch` storage guards and `AuthResult` responses. Do not throw for expected invalid input, unavailable storage, or missing workspace.
- **Testing:** No test runner is configured (`package.json` has only `lint` and `build`). Verification is therefore lint/build plus the manual acceptance matrix above. `[NEEDS CLARIFICATION: If CI expects automated unit tests for AGE-18, provide the required runner and command before implementation.]
- **Documentation:** Keep this plan as the implementation record; update it if the token/path contract is resolved differently during implementation.

## S — Safeguards

- **Invariants:** Never expose mock passwords through `User`, `getUser()`, context state, or UI. Preserve existing auth keys and current-user/workspace serialization compatibility.
- **Authentication integrity:** `isAuthenticated()` and `getToken()` must use the same finalized token source. Login/signup must establish all required session state; logout must clear all auth session keys and the token representation.
- **Redirect integrity:** Do not reintroduce raw `localStorage.getItem("auth_token")` in the dashboard layout. Avoid redirecting authenticated users simply because workspace onboarding is incomplete unless that rule is explicitly reinstated.
- **Data integrity:** `updateWorkspace()` must be read-modify-write, preserve immutable fields, and avoid partial persistence on validation errors.
- **Security:** This remains mock frontend auth. localStorage/cookie credentials are not production-secure; no claim of real session security should be added.
- **Performance:** Auth reads and dashboard stat reads remain synchronous local reads; no network waterfalls or new client dependency should be introduced. `[NEEDS CLARIFICATION: No explicit latency or rendering budget is defined.]
- **Compatibility:** Preserve the existing `slug` field and legacy module imports in this issue unless a migration is separately approved.

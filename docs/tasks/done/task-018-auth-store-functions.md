# Task 018.1 — Auth Store: `getToken()` and `updateWorkspace()`

## Reference

Plan document:

docs/plans/plan-018-auth-types-and-store.md

Relevant sections:

- Operation: `getToken`
- Operation: `updateWorkspace`
- Storage contract decision
- Domain → Workspace domain rules
- N → Norms (AuthResult, camelCase, no throw)

---

## Description

Add two new exported functions to `lib/auth-store.ts`:

1. **`getToken()`** — returns the stored auth token as `string | null`
2. **`updateWorkspace()`** — mutates the current workspace (name and/or plan) via read-modify-write, preserving immutable fields

### `getToken()`

**Signature:**

```typescript
export function getToken(): string | null;
```

**Behavior:**

- Read the token from the cookie set by `login`/`signup` using the same `cookieExists` helper pattern.
- Parse and return the cookie value for `auth_token`.
- Return `null` when absent, on parse failure, or in non-browser environments.
- Must not throw under any condition.

> **IMPORTANT — Token source:** The existing implementation stores the token **only as a cookie** (`setCookie(AUTH_TOKEN_KEY, token)`). It does **not** write to localStorage. `getToken()` must read from the cookie, not from localStorage. If the cookie is malformed or parsing fails, return `null`.

### `updateWorkspace()`

**Signature:**

```typescript
export function updateWorkspace(input: {
  name?: string;
  plan?: "developer" | "team" | "company";
}): AuthResult<Workspace>;
```

**Behavior:**

- Read the current workspace via `getWorkspace()`.
- Return `{ success: false, error: "No workspace found" }` if no workspace exists.
- Validate provided fields using the same rules as `createWorkspace()`:
  - If `name` is provided: must be non-empty after trim, at most 50 characters.
  - If `plan` is provided: must be one of `"developer" | "team" | "company"`.
  - If **neither** `name` nor `plan` is provided, return an error: `"No fields to update"`.
- Merge only provided mutable fields into the current workspace.
  - Preserve `id`, `slug`, and `createdAt` unchanged.
  - If `name` is provided, apply `.trim()`.
- Persist the updated workspace under `AUTH_WORKSPACE_KEY` via `setItem`.
- Return `{ success: true, result: updatedWorkspace }` on success.
- Return `{ success: false, error: "Failed to store workspace data" }` if persistence fails.
- Must handle `localStorage`/`document.cookie` failure gracefully (existing try/catch guards in `setItem`/`setCookie`).

**Edge cases to handle (return `AuthResult` errors, do NOT throw):**

| Condition | Error |
|---|---|
| No current workspace | `"No workspace found"` |
| No fields supplied | `"No fields to update"` |
| Empty/whitespace-only name | `"Workspace name is required"` |
| Name over 50 characters | `"Workspace name must be 50 characters or less"` |
| Invalid plan literal | `"Invalid plan"` |
| localStorage write failure | `"Failed to store workspace data"` |

**Invariants:**

- Read-modify-write only. Never create a workspace implicitly.
- Never mutate `id`, `slug`, or `createdAt`.
- Do not partially persist on validation failure — validate all fields before writing.
- Preserve backward compatibility: `slug` field stays intact.

---

## Acceptance Criteria

### `getToken()`

- Function is exported from `lib/auth-store.ts`
- Return type is `string | null`
- When a valid cookie-based token exists (from login/signup), returns the token string
- When no token cookie exists, returns `null`
- On parse/storage failure in non-browser environments, returns `null` (never throws)
- Uses the same `auth_token` key as `login`/`signup`/`logout`/`isAuthenticated`

### `updateWorkspace()`

- Function is exported from `lib/auth-store.ts`
- Accepts `{ name?: string; plan?: "developer" \| "team" \| "company" }`
- Returns `AuthResult<Workspace>`
- Returns error when no workspace exists
- Validates name: trim, non-empty, max 50 chars
- Validates plan: must be one of the three literal values
- Returns error when no fields are supplied
- Preserves `id`, `slug`, `createdAt` on update
- Trims name if provided
- Persists via `setItem(AUTH_WORKSPACE_KEY, ...)`
- Does not create a workspace implicitly if none exists
- Handles localStorage failure gracefully (no throws)

---

## Out Of Scope

- Exposing these functions in the React context (handled in task 018.2)
- Dashboard display changes (handled in task 018.3)
- Tests or lint/build verification (handled in task 018.4)
- Any `lib/auth/types.ts` or `lib/auth/store.ts` compatibility re-exports (out of scope per plan)

---

## Domain

### AuthStore Module

`lib/auth-store.ts` is the canonical storage layer. It owns all `AUTH_*_KEY` constants, cookie synchronization, localStorage read/write helpers, validation, error shaping via `AuthResult<T>`, and the `User`/`Workspace` interfaces. This task adds functions to that file without creating a second store or duplicating types.

### AuthResult Contract

All store operations return `AuthResult<T>` — never throw. The contract is:

```typescript
export interface AuthResult<T = void> {
  success: boolean;
  error?: string;
  result?: T;
}
```

### Cookie-Based Token

The token is stored as an HTTP cookie via `setCookie()` from prior implementation. There is no `localStorage` token key. `getToken()` must read from cookies using the same parsing approach as `cookieExists()`.

(No mermaid graph needed — this is a store module addition, not a flow.)
# Task 002 - Auth store (localStorage operations)

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

- Entities: User, Workspace, AuthState
- Operations: LoginUser, SignupUser, LogoutUser, CreateWorkspace, GetUser, GetWorkspace, IsAuthenticated
- Domain Rules
- Norms: error handling, localStorage key naming, return `{ success, error }` pattern

---

## Description

Create `lib/auth-store.ts` — pure functions that read/write localStorage. No React, no side effects. This is the single source of truth for auth data on disk.

Functions: `login()`, `signup()`, `logout()`, `getUser()`, `getWorkspace()`, `isAuthenticated()`, `createWorkspace()`.

Uses keys: `auth_token`, `auth_current_user`, `auth_workspace`, `auth_users`.

---

## Acceptance Criteria

- `lib/auth-store.ts` exports: `login`, `signup`, `logout`, `getUser`, `getWorkspace`, `isAuthenticated`, `createWorkspace`
- All localStorage reads wrapped in try-catch — never throw
- JSON parse wrapped in try-catch — returns null on failure
- `login()` validates email regex, password length >= 8, checks existing user, sets `auth_current_user` and `auth_token` cookie value
- `signup()` validates email, password >= 8, confirm match, no duplicate email, appends to `auth_users`, returns `requiresOnboarding: true`
- `logout()` clears `auth_current_user`, `auth_token`, `auth_workspace`
- `createWorkspace()` creates workspace with UUID, stores in `auth_workspace`, updates `auth_users`
- `isAuthenticated()` returns true only if both `auth_token` cookie and `auth_current_user` localStorage exist
- Passwords stored as-is (mock only)

---

## Out Of Scope

- React Context (Task 003)
- Cookie actual HTTP headers (this store returns data — proxy reads it)
- Real password hashing
- JWT or session tokens

---

## Domain

### User

Represents a platform user. Fields: `id` (uuid), `email`, `name`, `createdAt` (ISO). Created during signup or login. Stored in localStorage under key `auth_current_user` (single) and across all users in `auth_users` (array).

### Workspace

Represents a workspace belonging to a user. Fields: `id` (uuid), `name`, `slug`, `plan` (developer/team/company), `createdAt`. Created once during onboarding. Stored under `auth_workspace`.

### AuthStore

This module is a thin adapter over localStorage. It knows nothing of React, the DOM, or routing. It reads and writes JSON blobs. It returns results as `{ success: boolean; error?: string }` — never throws.

---

## Graph

Data flow through the store:

```mermaid
graph TD
    A[Function call] --> B{Try-catch}
    B -->|OK| C[Parse/Write localStorage]
    B -->|Error| D[Return { success: false, error }]
    C --> E[Return { success: true, result }]
    D --> E
    E --> F[Caller uses result]
```
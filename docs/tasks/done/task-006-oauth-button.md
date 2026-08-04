# Task 006 - OAuthButton component

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

- Components: `components/auth/oauth-button.tsx`
- Scope Out: Real OAuth provider — mock only

---

## Description

Create `components/auth/oauth-button.tsx` — a reusable GitHub mock OAuth button component. Clicking it simulates an OAuth login by creating a mock user via `useAuth().login()` and redirecting to `/dashboard`. Used by both LoginForm and SignupForm.

---

## Acceptance Criteria

- Exports `OAuthButton` component
- `'use client'` directive present
- Button has "Sign in with GitHub" text
- Button uses GitHub icon/lucide icon
- On click: calls `useAuth().login()` with mock email/password (e.g. `user@github.mock` + mock password)
- Success redirects to `/dashboard`
- Error displays inline
- Accepts optional `className` prop
- Uses `Button` from `@/components/ui/button`

---

## Out Of Scope

- Actual GitHub OAuth flow
- Button color/variant customization beyond default
- Page layout (handled by LoginForm/SignupForm)

---

## Domain

### Mock OAuth

Since real OAuth is out of scope, this button simulates a GitHub login by calling the same auth store entrypoint (`useAuth().login()`) with hardcoded mock credentials. It reuses the existing login flow — the endpoint is the same, only the input differs.

---

## Graph

OAuth mock click flow:

```mermaid
graph TD
    A[User clicks "Sign in with GitHub"] --> B[Call useAuth.login with mock credentials]
    B --> C{Success?}
    C -->|Yes| D[Redirect to /dashboard]
    C -->|No| E[Show error inline]
```
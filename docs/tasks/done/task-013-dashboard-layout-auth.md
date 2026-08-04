# Task 013 - Dashboard layout auth check

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

```
Modify:
- app/(dashboard)/layout.tsx → update auth check (use AuthContext)
```

Existing current code at `app/(dashboard)/layout.tsx`:

```tsx
const token = localStorage.getItem("auth_token")
if (!token) { router.push("/") }
```

---

## Description

Replace the raw `localStorage.getItem("auth_token")` check in `app/(dashboard)/layout.tsx` with `useAuth().isAuthenticated` from the auth context. This removes direct localStorage access and uses the centralized auth state.

Current code does client-side redirect on mount. New code uses the same pattern but via context so the redirect triggers only when auth truly changes.

---

## Acceptance Criteria

- `app/(dashboard)/layout.tsx` imports `useAuth` from `@/lib/auth-context`
- Replaces `localStorage.getItem("auth_token")` with `useAuth().isAuthenticated`
- Redirects unauthenticated to `/` (or `/login`)
- Hydration guard (`isMounted`) still present
- Dashboard layout still renders sidebar, mobile sidebar, and children correctly
- Builds without errors

---

## Out Of Scope

- Proxy route protection (Task 011 — server-side guard)
- UI changes (sidebar changes in Task 014)

---

## Domain

### Dashboard Auth Guard

The dashboard is protected. If you're not logged in, you can't see it. This task moves the guard from a raw localStorage read to the auth context — which is the same check, just through the abstraction layer. The proxy (Task 011) is the server-side guard; this is the client-side safety net.

---

## Graph

Client-side auth guard:

```mermaid
graph TD
    A[Dashboard layout mounts] --> B[useAuth().isAuthenticated]
    B --> C{Is authenticated?}
    C -->|Yes| D[Render sidebar + children]
    C -->|No| E[Redirect to /login]
```
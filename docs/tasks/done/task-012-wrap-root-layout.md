# Task 012 - Wrap root layout with AuthProvider

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant section:

```
app/layout.tsx → wrap children with AuthProvider
```

---

## Description

Modify `app/layout.tsx` (root layout) to import and wrap children with `AuthProvider` from `lib/auth-context`. This ensures auth context is available everywhere in the app.

---

## Acceptance Criteria

- `app/layout.tsx` imports `AuthProvider` from `@/lib/auth-context`
- Children wrapped: `<AuthProvider>{children}</AuthProvider>`
- Root layout still renders `<html>` and `<body>` correctly
- No hydration warnings or errors
- Page still builds successfully
- Auth state hydrates from localStorage on mount

---

## Out Of Scope

- Changes to sidebar (Task 013)
- Dashboard auth check replacement (Task 014)
- Landing page changes (Task 015)

---

## Domain

### AuthProvider at Root

The auth context must be available throughout the entire app — dashboard pages, auth pages, landing page. The simplest and most correct place is the root layout. One wrapper, every route gets access to `useAuth()`.

---

## Graph

Tree structure after wrapping:

```mermaid
graph TD
    A[RootLayout] --> B[AuthProvider]
    B --> C[html + body]
    C --> D[page.tsx — landing]
    C --> E[(dashboard) layout]
    E --> F[Dashboard pages]
    C --> G[(auth) layout]
    G --> H[Login / Signup / Onboarding]
```
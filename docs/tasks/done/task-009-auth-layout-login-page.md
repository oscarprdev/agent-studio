# Task 009 - Auth pages layout + Login page

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

- Components: `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`
- Structure: `(auth)` route group under `app/`

---

## Description

Create two files:
1. `app/(auth)/layout.tsx` — centered layout for auth pages (login, signup, onboarding). Full-viewport centered card. No sidebar, no topbar.
2. `app/(auth)/login/page.tsx` — the login page that renders `LoginForm` from Task 004.

Uses `'use client'` in the layout file since it may need to redirect authenticated users.

---

## Acceptance Criteria

- Directory `app/(auth)/` created
- `app/(auth)/layout.tsx` exists with: centered flex layout, full viewport height, card container, imports `children` and renders them
- `app/(auth)/login/page.tsx` exists, imports `LoginForm`, renders it inside the layout
- Layout has no sidebar, no top-bar, no dashboard chrome
- Layout uses Tailwind utility classes (not new CSS)
- Login page imports from `@/components/auth/login-form`

---

## Out Of Scope

- Signup page content (same layout, handled in Task 010)
- Style details beyond basic centering (form styling is the form's job)

---

## Domain

### Auth Route Group

`(auth)` is a Next.js route group — it organizes auth-related pages without adding a path segment. All pages inside this group share the centered layout. No sidebar, no dashboard chrome — just the auth form.

---

## Graph

Auth page navigation:

```mermaid
graph LR
    A[user navigates to /login] --> B[Route group /\(auth\) matched]
    B --> C[Layout renders centered card]
    C --> D[Page renders LoginForm inside card]
```
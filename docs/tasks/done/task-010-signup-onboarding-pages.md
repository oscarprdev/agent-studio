# Task 010 - Signup page + Onboarding page

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

- Components: `app/(auth)/signup/page.tsx`, `app/(auth)/onboarding/page.tsx`
- Same `(auth)` layout group as Task 009

---

## Description

Create two page files that reuse the auth layout from Task 009:

1. `app/(auth)/signup/page.tsx` — renders `SignupForm` from Task 005
2. `app/(auth)/onboarding/page.tsx` — renders `OnboardingWizard` from Task 008

Both live under the same `(auth)` route group, so they inherit the centered layout automatically.

---

## Acceptance Criteria

- `app/(auth)/signup/page.tsx` imports and renders `SignupForm` from `@/components/auth/signup-form`
- `app/(auth)/onboarding/page.tsx` imports and renders `OnboardingWizard` from `@/components/auth/onboarding-wizard`
- Both pages rendered inside the auth layout (card, centered)
- No sidebar, no dashboard chrome on either page
- Next.js builds without errors
- Routes accessible at `/signup` and `/onboarding`

---

## Out Of Scope

- Layout changes (handled in Task 009)
- Auth page CSS (handled in Task 009)

---

## Domain

### Signup Page

URL: `/signup`. Shows the signup form. On success, redirects to `/onboarding`.

### Onboarding Page

URL: `/onboarding`. Shows the workspace creation wizard. On completion, redirects to `/dashboard`.

Both pages live under the `(auth)` route group so they share the same centered layout.

---

## Graph

Auth flow between pages:

```mermaid
graph TD
    A[/signup] --> B[Fill SignupForm]
    B --> C[Success]
    C --> D[Redirect to /onboarding]
    D --> E[Fill OnboardingWizard]
    E --> F[Success]
    F --> G[Redirect to /dashboard]
    H[/login] --> I[Fill LoginForm]
    I --> J{Has workspace?}
    J -->|Yes| K[Redirect to /dashboard]
    J -->|No| D
```
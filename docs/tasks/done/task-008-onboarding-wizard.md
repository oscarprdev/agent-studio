# Task 008 - OnboardingWizard component

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant sections:

- Components: `components/auth/onboarding-wizard.tsx`
- Operations: CreateWorkspace
- Scope: 3-step wizard — Create Workspace → Choose Plan → Welcome

---

## Description

Create `components/auth/onboarding-wizard.tsx` — a 3-step wizard that guides a newly signed-up user through workspace creation. Step 1: enter workspace name. Step 2: choose plan (developer/team/company). Step 3: welcome screen with "Go to Dashboard" button.

Uses shadcn Card, Input, Label, Button. Progress indicator shows current step.

---

## Acceptance Criteria

- Exports `OnboardingWizard` component
- `'use client'` directive present
- Shows 3 steps: Workspace Name → Choose Plan → Welcome
- Step 1 (Workspace Name): Input field for name, "Continue" button, name required validation
- Step 2 (Choose Plan): Three plan cards/buttons — "Developer", "Team", "Company" — plan required selection
- Step 3 (Welcome): Congratulatory message, "Go to Dashboard" button
- Progress indicator shows current step (1/3, 2/3, 3/3)
- "Continue" validates current step before advancing
- "Go to Dashboard" calls `router.push('/dashboard')`
- Uses `useAuth().createWorkspace(name, plan)` on step 2 → step 3 transition
- On success: auto-advances to step 3
- On error: shows error in form
- Uses `Card` from `@/components/ui/card`
- Uses `Input` and `Label` from shadcn

---

## Out Of Scope

- Dashboard navigation destination (just redirects, no dashboard changes)
- Persistent plan comparison or pricing details
- Multi-step form persistence across sessions

---

## Domain

### Onboarding

After signup, a user must create a workspace before accessing the dashboard. The wizard collects two pieces of info: workspace name and plan tier. On completion, the workspace is stored and the user is redirected to `/dashboard`. All data is stored via the auth store (localStorage only).

Plan options: `developer` (default), `team`, `company`.

---

## Graph

Onboarding wizard flow:

```mermaid
graph TD
    A[Step 1: Enter workspace name] --> B[Click Continue]
    B --> C{Name valid?}
    C -->|No| A
    C -->|Yes| D[Step 2: Choose plan]
    D --> E[Select plan: developer/team/company]
    E --> F[Click Continue]
    F --> G{Plan selected?}
    G -->|No| D
    G -->|Yes| H[Call useAuth.createWorkspace]
    H --> I{Success?}
    I -->|No| D
    I -->|Yes| J[Step 3: Welcome screen]
    J --> K[Click "Go to Dashboard"]
    K --> L[Redirect to /dashboard]
```
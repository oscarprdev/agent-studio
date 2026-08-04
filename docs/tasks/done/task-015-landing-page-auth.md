# Task 015 - Landing page with auth-aware UI

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant section:

```
Modify:
- app/page.tsx → show Sign In or user menu based on auth
```

---

## Description

Modify `app/page.tsx` (current Next.js starter landing) to be the actual landing page:

1. Replace the Next.js placeholder content
2. If authenticated: show user info + a "Go to Dashboard" button (uses `useAuth()`)
3. If not authenticated: show "AI Agent Studio" hero text + "Sign In" button (links to `/login`)
4. Uses a clean, minimal design consistent with the project's visual style

---

## Acceptance Criteria

- `app/page.tsx` imports `useAuth` from `@/lib/auth-context`
- Not authenticated: shows hero text, "Sign In" button linking to `/login`
- Authenticated: shows welcome message with user name, "Go to Dashboard" button linking to `/dashboard`
- Button uses project's `Button` component
- No Next.js demo image or placeholder links remain
- Works in `'use client'` mode (use client directive added)
- Builds without errors

---

## Out Of Scope

- Full marketing redesign (just functional landing)
- User profile edit
- Theme toggle

---

## Domain

### Landing Page

The landing page is the door to the app. If you're not logged in, you see a "Sign In" button. If you are, you see "Go to Dashboard". That's it. No navigation chrome, no sidebar — just the entrance.

---

## Graph

Landing page conditional:

```mermaid
graph TD
    A[user opens /] --> B{useAuth.isAuthenticated}
    B -->|No| C[Show hero + "Sign In" button]
    B -->|Yes| D[Show welcome + "Dashboard" button]
    C --> E[user clicks → /login]
    D --> F[user clicks → /dashboard]
```
# Task 014 - Sidebar with auth-aware user section + UserMenu

## Reference

Plan document:

docs/plans/plan-002-authentication.md

Relevant section:

```
Modify:
- components/layout/sidebar.tsx → read auth context, add user menu
```

---

## Description

Modify `components/layout/sidebar.tsx` (existing file) to:

1. Import and use `useAuth()` to read the current user
2. Replace the hardcoded "User" / "user@example.com" with actual user data from the auth context
3. Replace the static avatar area with the `UserMenu` component from Task 007

If no user is authenticated, show a placeholder or disabled state (auth guard on sidebar itself, so this should never happen, but be safe).

---

## Acceptance Criteria

- `components/layout/sidebar.tsx` imports `useAuth` from `@/lib/auth-context`
- Sidebar user section displays actual `useAuth().user?.email` instead of hardcoded text
- Sidebar user section uses `UserMenu` from `@/components/layout/user-menu`
- User avatar shows initials from user name (fallback to "U")
- Sidebar layout structure preserved (logo, separator, nav, separator, user)
- Sidebar imports `Separator` and `Avatar` still present
- Builds without errors

---

## Out Of Scope

- UserMenu implementation (Task 007)
- Logout confirmation dialog (inside UserMenu)

---

## Domain

### Sidebar User Section

The sidebar footer shows who you are and how to sign out. It reads the current user from auth context and displays their email. The avatar triggers the UserMenu dropdown. When a user clicks "Sign out", they're logged out and redirected to the landing page.

---

## Graph

Sidebar user section:

```mermaid
graph TD
    A[User loads dashboard] --> B[Sidebar reads useAuth]
    B --> C[Shows user email + avatar]
    C --> D[User clicks avatar]
    D --> E[UserMenu dropdown opens]
    E --> F[User clicks "Sign out"]
    F --> G[AlertDialog confirmation]
    G --> H[Confirm → useAuth.logout]
    H --> I[Redirect to /]
```
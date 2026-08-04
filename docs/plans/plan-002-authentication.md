# Plan 002 — Authentication Flow (AGE-7)

## R — Requirements

### Problem

No auth. Anyone hits dashboard. No login, no signup, no workspace creation. Frontend-only scaffold needs mock auth to unlock user-specific features.

### Definition of Done

- `/login` page: email+password form, GitHub OAuth mock button, link to signup
- `/signup` page: email+password+confirm password form, GitHub OAuth mock button, link to login
- `/onboarding` page: 3-step wizard — Create Workspace → Choose Plan → Welcome
- Auth store in `localStorage`: `login()`, `signup()`, `logout()`, `getUser()`, `getWorkspace()`, `isAuthenticated()`
- Proxy (Next.js 16 renamed middleware → proxy): redirect unauthenticated users to `/login`, authenticated users away from `/login` and `/signup`
- Sidebar: shows user email, user menu dropdown with Sign Out
- Landing page (`/`): shows "Sign In" when not authenticated, user menu when authenticated
- Logout confirmation dialog before sign out

### Scope In

- Frontend-only mock auth (localStorage)
- Login, Signup, Onboarding pages
- Proxy-based route protection
- Auth-aware sidebar and landing page
- Logout flow with confirmation dialog

### Scope Out

- Real backend auth
- OAuth provider integration (mock only)
- Session tokens / JWT
- Password hashing
- Email verification
- Database persistence
- API routes

---

## E — Entities

### User

```typescript
{
  id: string           // uuid
  email: string
  name: string
  createdAt: string    // ISO timestamp
}
```

### Workspace

```typescript
{
  id: string           // uuid
  name: string
  slug: string
  plan: "developer" | "team" | "company"
  createdAt: string    // ISO timestamp
}
```

### AuthState

```typescript
{
  user: User | null
  workspace: Workspace | null
  isAuthenticated: boolean
}
```

### Relationships

- User has one Workspace (created during onboarding)
- Workspace belongs to User

### Domain Rules

- Unauthenticated users cannot access `(dashboard)` routes
- Authenticated users cannot access `/login` or `/signup`
- New users must complete onboarding before accessing dashboard
- Workspace name required, plan selection required
- Password minimum 8 characters
- Confirm password must match

---

## A — Approach

### Design Pattern

- **Context + Reducer** for auth state (React Context, no external lib)
- **Adapter** pattern for localStorage operations (isolated, mockable)
- **Proxy** (Next.js 16) for route protection

### Strategy

1. Auth store lives in `lib/auth-store.ts` — pure functions reading/writing localStorage
2. React Context (`AuthProvider`) wraps app, exposes auth state + actions
3. `proxy.ts` at root checks localStorage cookie-like token for route protection
4. Since proxy runs server-side and localStorage is client-only, proxy reads a cookie set by client auth actions
5. Client auth actions set/clear `auth_token` cookie + localStorage simultaneously

### Trade-offs

| Choice | Pros | Cons |
|--------|------|------|
| localStorage + cookie | Simple, no backend needed | Not secure, mock only |
| React Context | No extra deps, React native | Re-renders on auth change |
| Proxy route guard | Server-side redirect, correct pattern | Cookie must be synced manually |
| Mock OAuth | Shows UI flow | No real provider |

Alternative considered: Zustand for auth state — rejected because Context is sufficient for this scope and avoids new dependency.

---

## S — Structure

### Location

```
lib/auth-store.ts           → localStorage operations
lib/auth-context.tsx        → React Context + Provider
components/layout/sidebar.tsx → auth-aware user section
components/layout/user-menu.tsx → dropdown menu (new)
components/auth/login-form.tsx → login form (new)
components/auth/signup-form.tsx → signup form (new)
components/auth/oauth-button.tsx → GitHub mock button (new)
components/auth/onboarding-wizard.tsx → 3-step wizard (new)
app/(auth)/layout.tsx       → auth pages layout (new)
app/(auth)/login/page.tsx   → login page (new)
app/(auth)/signup/page.tsx  → signup page (new)
app/(auth)/onboarding/page.tsx → onboarding page (new)
proxy.ts                    → route protection (new)
app/page.tsx                → landing page (modify)
app/(dashboard)/layout.tsx  → update auth check (modify)
app/layout.tsx              → wrap with AuthProvider (modify)
```

### Files To Create

```
Create:
- lib/auth-store.ts
- lib/auth-context.tsx
- components/auth/login-form.tsx
- components/auth/signup-form.tsx
- components/auth/oauth-button.tsx
- components/auth/onboarding-wizard.tsx
- components/layout/user-menu.tsx
- app/(auth)/layout.tsx
- app/(auth)/login/page.tsx
- app/(auth)/signup/page.tsx
- app/(auth)/onboarding/page.tsx
- proxy.ts
```

### Files To Modify

```
Modify:
- app/layout.tsx                    → wrap children with AuthProvider
- app/(dashboard)/layout.tsx        → use AuthContext instead of raw localStorage
- components/layout/sidebar.tsx     → read auth context, add user menu
- app/page.tsx                      → show Sign In or user menu based on auth
```

### Dependencies

New shadcn components to install:

```
- input (for forms)
- label (for forms)
- dropdown-menu (for user menu)
- alert-dialog (for logout confirmation)
- separator (already installed)
```

No new npm packages needed.

---

## O — Operations

### Operation: LoginUser

**Input:**

```typescript
{
  email: string
  password: string
}
```

**Output:**

```typescript
{ success: boolean; error?: string }
```

**Steps:**

1. Validate email format (basic regex)
2. Validate password length >= 8
3. Check if user exists in localStorage (`auth_users` key)
4. If user not found: return error "No account found with this email"
5. If password doesn't match: return error "Invalid password"
6. Create session: store user in `auth_current_user`
7. Set `auth_token` cookie (for proxy)
8. Set `auth_workspace` if workspace exists
9. Return success

**Edge Cases:**

- Empty fields → validation error
- Invalid email format → validation error
- Short password → validation error
- Non-existent user → "No account found"
- Wrong password → "Invalid password"
- localStorage full → try-catch, return error

---

### Operation: SignupUser

**Input:**

```typescript
{
  email: string
  password: string
  confirmPassword: string
}
```

**Output:**

```typescript
{ success: boolean; error?: string; requiresOnboarding: boolean }
```

**Steps:**

1. Validate email format
2. Validate password length >= 8
3. Validate password === confirmPassword
4. Check if email already exists in `auth_users`
5. If exists: return error "Account already exists"
6. Create user object with uuid, email, createdAt
7. Hash password (mock: just store, no real hash)
8. Append to `auth_users` array
9. Set as current user
10. Set `auth_token` cookie
11. Return success with `requiresOnboarding: true`

**Edge Cases:**

- Passwords don't match → validation error
- Email already taken → "Account already exists"
- localStorage unavailable → try-catch

---

### Operation: LogoutUser

**Input:** none

**Output:** void

**Steps:**

1. Remove `auth_current_user` from localStorage
2. Remove `auth_token` cookie
3. Remove `auth_workspace` from localStorage
4. Update AuthContext state
5. Redirect to `/`

---

### Operation: CreateWorkspace

**Input:**

```typescript
{
  name: string
  plan: "developer" | "team" | "company"
}
```

**Output:**

```typescript
{ success: boolean; workspace?: Workspace }
```

**Steps:**

1. Validate workspace name (non-empty, max 50 chars)
2. Validate plan is one of allowed values
3. Create workspace object with uuid, name, slug, plan, createdAt
4. Store in `auth_workspace` localStorage
5. Update current user with workspace_id
6. Update `auth_users` array
7. Return workspace

**Edge Cases:**

- Empty name → validation error
- Invalid plan → validation error
- localStorage full → try-catch

---

### Operation: GetUser

**Input:** none

**Output:** `User | null`

**Steps:**

1. Read `auth_current_user` from localStorage
2. Parse JSON
3. Return user or null

---

### Operation: GetWorkspace

**Input:** none

**Output:** `Workspace | null`

**Steps:**

1. Read `auth_workspace` from localStorage
2. Parse JSON
3. Return workspace or null

---

### Operation: IsAuthenticated

**Input:** none

**Output:** `boolean`

**Steps:**

1. Check if `auth_token` cookie exists
2. Check if `auth_current_user` exists in localStorage
3. Return true only if both exist

---

### Operation: ProxyRouteProtection

**Input:** `NextRequest`

**Output:** `NextResponse`

**Steps:**

1. Extract path from request
2. Define protected routes: `(dashboard)/*`, `/onboarding`
3. Define public routes: `/login`, `/signup`, `/`
4. Read `auth_token` cookie from request
5. If path is protected and no token → redirect to `/login`
6. If path is public (`/login`, `/signup`) and token exists → redirect to `/dashboard`
7. Otherwise → next()

**Edge Cases:**

- Static assets → skip (matcher excludes `_next/static`, `_next/image`, `*.png`)
- API routes → skip (matcher excludes `api`)
- Onboarding accessible only with token but no workspace → allow

---

## N — Norms

### Naming

- Files: `kebab-case` (auth-store.ts, login-form.tsx)
- Components: `PascalCase` (LoginForm, UserMenu)
- Functions: `camelCase` (loginUser, isAuthenticated)
- Constants: `SCREAMING_SNAKE` (AUTH_TOKEN_KEY)
- CSS classes: Tailwind utility classes, semantic tokens only

### Logging

No logging required for mock auth. Future: add console.log in dev for auth state changes.

### Error Handling

- Auth functions return `{ success, error }` pattern (no throws)
- Forms display errors via state, not toast
- Proxy returns redirects, not error pages
- All localStorage access wrapped in try-catch

### Testing

No test runner configured. Manual verification:

- Login with valid credentials → redirect to dashboard
- Login with invalid credentials → show error
- Signup with matching passwords → redirect to onboarding
- Signup with mismatched passwords → show error
- Complete onboarding → redirect to dashboard
- Access `/dashboard` unauthenticated → redirect to `/login`
- Access `/login` authenticated → redirect to `/dashboard`
- Logout → redirect to `/`, sidebar shows Sign In

### Documentation

- No JSDoc required (simple functions)
- No API docs (no backend)

---

## S — Safeguards

### Invariants

- Never store passwords in plain text outside localStorage (mock: stored as-is, acceptable for mock)
- Never expose auth_token in URL parameters
- Always clear all auth data on logout
- Proxy must not block static assets or API routes
- Onboarding must be completable in one session

### Performance

- Auth state read from localStorage on mount only (lazy init)
- Context re-renders limited to auth state changes
- No infinite loops in proxy (matcher excludes static files)

### Security

- Mock only — no real security
- Cookie set with `httpOnly: false` (client-accessible for mock)
- No CORS concerns (same-origin)
- No CSRF (mock, no real mutations)

### Data Integrity

- localStorage operations wrapped in try-catch
- JSON parse guarded with try-catch
- User/workspace data validated before storage
- Consistent key naming: `auth_token`, `auth_current_user`, `auth_workspace`, `auth_users`

---

## Files Summary

### Create

| File | Purpose |
|------|---------|
| `lib/auth-store.ts` | localStorage CRUD operations |
| `lib/auth-context.tsx` | React Context + Provider + hook |
| `components/auth/login-form.tsx` | Login form with validation |
| `components/auth/signup-form.tsx` | Signup form with validation |
| `components/auth/oauth-button.tsx` | GitHub mock OAuth button |
| `components/auth/onboarding-wizard.tsx` | 3-step onboarding wizard |
| `components/layout/user-menu.tsx` | User dropdown menu |
| `app/(auth)/layout.tsx` | Auth pages centered layout |
| `app/(auth)/login/page.tsx` | Login page |
| `app/(auth)/signup/page.tsx` | Signup page |
| `app/(auth)/onboarding/page.tsx` | Onboarding page |
| `proxy.ts` | Route protection |

### Modify

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap with AuthProvider |
| `app/(dashboard)/layout.tsx` | Use AuthContext instead of raw localStorage |
| `components/layout/sidebar.tsx` | Read auth context, show user email, add UserMenu |
| `app/page.tsx` | Show Sign In or user menu based on auth |

### shadcn Install

```bash
npx shadcn@latest add input label dropdown-menu alert-dialog
```

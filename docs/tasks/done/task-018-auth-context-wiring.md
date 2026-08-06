# Task 018.2 — Auth Context: Expose `updateWorkspace()`

## Reference

Plan document:

docs/plans/plan-018-auth-types-and-store.md

Relevant sections:

- Structure → Existing files to modify (auth-context.tsx)
- Operation: `updateWorkspace` (context workspace refresh)
- N → Norms (context as single React-facing source)
- E → AuthState — conceptual existing context state (refresh after mutation)

---

## Description

Extend `lib/auth-context.tsx` to import and expose `updateWorkspace` from the auth store.

### Current State

`auth-context.tsx` already:

- Imports store helpers from `@/lib/auth-store`
- Exposes `AuthProvider` with context value: `{ user, workspace, isAuthenticated, login, signup, logout, createWorkspace }`
- Keeps `workspace` as `useState<Workspace | null>` initialized from store
- Refreshes `workspace` state after `createWorkspace()` via `setWorkspace(storeGetWorkspace())`

### What to Add

1. **Import** `updateWorkspace as storeUpdateWorkspace` from `@/lib/auth-store`
2. **Add** `updateWorkspace` to `AuthContextValue` interface:
   ```typescript
   updateWorkspace: (input: { name?: string; plan?: "developer" | "team" | "company" }) => AuthResult<Workspace>;
   ```
3. **Implement** the `updateWorkspace` callback in `AuthProvider`:
   ```typescript
   const updateWorkspace = useCallback((input: { name?: string; plan?: "developer" | "team" | "company" }) => {
     const result = storeUpdateWorkspace(input);
     if (result.success) {
       setWorkspace(storeGetWorkspace());
     }
     return result;
   }, []);
   ```
4. **Add** `updateWorkspace` to the context provider value object

### Do NOT Add

- `getToken` as a context function (it's used imperatively, not reactive — the plan does not require it in context state).
- Any new context state fields.
- UI rendering changes (handled in task 018.3).

---

## Acceptance Criteria

- `updateWorkspace` is imported from `@/lib/auth-store` into `lib/auth-context.tsx`
- `updateWorkspace` exists on the `AuthContextValue` interface with correct signature
- `updateWorkspace` callback is implemented inside `AuthProvider`
- On success, calls `setWorkspace(storeGetWorkspace())` to refresh reactive state
- On failure, returns the `AuthResult` without mutating state
- `updateWorkspace` is included in the context provider value
- `AuthProvider` still exports as before (no breaking changes to existing consumers)
- `getToken` is NOT added to the context (not required by the plan)
- No other context exports are changed

---

## Out Of Scope

- Dashboard UI changes (handled in task 018.3)
- `getToken()` function — remains store-only (handled in task 018.1)
- Tests or lint/build verification (handled in task 018.4)

---

## Domain

### Context as React Adapter

`lib/auth-context.tsx` is the single React-facing adapter between imperative store operations and reactive UI state. The pattern is: call store function → check `result.success` → update relevant state via `setUser`/`setWorkspace`/`setIsAuthenticated` → return the raw store result so callers can introspect errors.

This task follows that same pattern for the new `updateWorkspace` function.

(No mermaid graph needed — this is a module extension, not a flow.)
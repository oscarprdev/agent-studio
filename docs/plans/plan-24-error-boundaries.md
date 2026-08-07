# AGE-24 — Custom error boundaries with `catchError`

## R — Requirements

### Overview

Add layered error recovery to the App Router without introducing React class error boundaries. Route segments will have Next.js `error.tsx` fallbacks, and reusable component-level boundaries will use Next.js 16.3 `catchError` from `next/error`. Both paths expose a retry action that re-fetches and re-renders the affected Server Component tree when applicable.

### Definition of Done

- [ ] A root route-segment fallback exists at `app/error.tsx`.
- [ ] Auth and dashboard segments have scoped `error.tsx` fallbacks.
- [ ] A reusable `catchError` wrapper and fallback are implemented for component-level use.
- [ ] Every applicable fallback exposes an accessible retry button wired to `retry()`.
- [ ] Retry re-renders the failed segment/component and re-fetches RSC data rather than only clearing client state.
- [ ] `notFound()` and `redirect()` continue through Next.js control flow and are not rendered as generic errors.
- [ ] Transient failures show a stable, non-sensitive fallback and can be retried without a full page reload.
- [ ] `npm run lint` and `npm run build` pass.

### Scope In

- Audit the current App Router tree and add route-segment error handling.
- Add a shared retry-oriented error UI using existing shadcn `Button` and semantic tokens.
- Add `catchError` for component-level boundaries where a smaller blast radius is useful.
- Document and manually verify retry, special Next.js control-flow behavior, and graceful degradation.

### Scope Out

- Replacing existing form/action toasts, validation messages, or status badges; these are expected-operation errors, not render boundaries.
- Adding a logging/observability vendor.
- Adding a test framework.
- Adding a database or Server Component data source solely to demonstrate retry. **[NEEDS CLARIFICATION: identify an existing production Server Component/data fetch to use for an end-to-end re-fetch test; the current pages are predominantly client components backed by localStorage.]**

## E — Entities

### Route Error Fallback

- **Fields:** `error: Error & { digest?: string }`, `retry: () => void`.
- **Relationships:** scoped by its `app` route segment; catches uncaught errors from descendant layouts/pages/components while leaving parent layouts available.
- **Domain rules:** must be a Client Component; must not expose raw error details in production UI; must call the supplied `retry()` for recovery.

### `catchError` Boundary

- **Fields:** wrapper props plus `children`; fallback receives `ErrorInfo` containing `error`, `retry`, and optionally `reset`.
- **Relationships:** wraps an explicitly selected subtree and is independent of route-segment placement.
- **Domain rules:** use `retry()` for failures that may be transient or originate in Server Component rendering; reserve `reset()` for a local state reset when no re-fetch is needed.

### Retry Error UI

- **Fields:** error heading, short recovery message, retry callback, optional development-only diagnostic logging.
- **Relationships:** shared by route fallbacks and `catchError` fallback.
- **Domain rules:** keyboard accessible, supports loading/transition feedback if the callback is asynchronous in the rendered boundary, and does not display secrets, stack traces, or server internals.

## A — Approach

### Architecture Decision

Prefer Next.js error handling over traditional React error boundaries because the App Router owns the RSC render lifecycle. Next route `error.tsx` boundaries receive a Next-managed `retry()` that re-fetches and re-renders the segment; `catchError` provides the same recovery model for an explicitly wrapped subtree. A traditional React boundary is not introduced: it would only reset client-side state and would not provide the required Server Component re-fetch behavior.

Use both Next.js mechanisms for their distinct scopes:

1. `app/error.tsx` is the root fallback for failures below the root layout.
2. `app/(dashboard)/error.tsx` and `app/(auth)/error.tsx` provide context-specific segment fallbacks.
3. A shared client wrapper created with `catchError` is used only around component subtrees that need a narrower blast radius than the route segment.

The group fallbacks should be intentionally small and reusable rather than duplicating recovery logic. The dashboard fallback can use dashboard-neutral copy; the auth fallback must not assume an authenticated session.

### `catchError` API Pattern

Implement a client module with the documented shape:

```tsx
"use client"

import { catchError, type ErrorInfo } from "next/error"

function ErrorFallback(
  props: { title?: string },
  { error, retry }: ErrorInfo,
) {
  return <RetryErrorState title={props.title} error={error} onRetry={retry} />
}

export default catchError(ErrorFallback)
```

The wrapper should accept `children` through the component returned by `catchError`; consumers place it around the narrow subtree being protected. Do not catch or transform `notFound()`/`redirect()` control-flow exceptions in application code. Verify that those calls still produce their normal 404/navigation behavior when made by descendants of each boundary; if a generic fallback renders, narrow the boundary or update the handling rather than swallowing the signal.

### UI

Create one shared retry state component. It should use the existing `Card`/layout primitives where appropriate and `Button` from `components/ui/button.tsx`, use `gap-*` utilities, use `size-*` only for equal dimensions, and provide an icon with the project’s `data-icon` convention. Keep the default message actionable and generic (for example, “Something went wrong. Try again.”). Log the full error only in a client effect suitable for development diagnostics; do not render `error.message` by default.

### Trade-offs and Alternatives

- **Single root `error.tsx`:** less duplication, but poor UX and a larger recovery blast radius for dashboard/auth failures.
- **Only per-route `error.tsx`:** covers route failures but cannot isolate a high-risk component subtree; therefore retain `catchError` as the reusable component-level option.
- **Traditional React `ErrorBoundary`:** rejected because it cannot re-fetch RSC payloads and is not needed by the current codebase.
- **`global-error.tsx`:** not required initially because the root layout is stable and the task targets route/component failures. Add only if a failure in `app/layout.tsx` must have a dedicated document-level fallback. **[NEEDS CLARIFICATION: whether root-layout failures require a separate global fallback.]**

## S — Structure

### Files to Create

- `app/error.tsx` — root route-segment Client Component fallback.
- `app/(dashboard)/error.tsx` — dashboard-scoped fallback and retry entry point.
- `app/(auth)/error.tsx` — auth-scoped fallback and retry entry point.
- `components/errors/retry-error-state.tsx` — shared accessible error/retry presentation.
- `components/errors/catch-error-boundary.tsx` — client `catchError` wrapper/fallback for explicitly wrapped subtrees.

### Files to Modify

- `app/(dashboard)/layout.tsx` — wrap only the intended dashboard content/subtree with the shared `catchError` boundary if the audit confirms component-level isolation is needed; do not wrap auth redirects or navigation control flow indiscriminately.
- `app/(auth)/layout.tsx` — modify only if a component-level auth boundary is identified during implementation; otherwise leave unchanged and rely on `error.tsx`.
- Relevant page/component files discovered during the audit — add `catchError` only around components whose failures should not blank the entire route.

### Dependencies

- `None`; `next/error`, React, Tailwind, and shadcn components are already installed.

## O — Operations

### 1. Audit error scopes

- **Input:** existing `app/**/*.tsx`, route groups, layouts, and current user-facing error states.
- **Output:** a mapping of route-level versus expected-operation errors and selected `catchError` subtrees.
- **Steps:**
  1. Confirm there are no existing `error.tsx`, `global-error.tsx`, React `ErrorBoundary`, or `componentDidCatch` implementations.
  2. Mark local form/action/toast errors as out of scope for render boundaries.
  3. Identify pages that may later become Server Components or perform remote data fetching.
  4. Select the smallest boundary scope that preserves the surrounding layout and navigation.
- **Edge cases:** client-only localStorage failures should not be represented as Server Component retry unless they are deliberately thrown by a wrapped component; missing resources should continue to use `notFound()` semantics.

### 2. Implement shared retry UI

- **Input:** `Error`/unknown error and `() => void` retry callback.
- **Output:** client-rendered accessible fallback.
- **Steps:**
  1. Normalize unknown errors to a safe user-facing message.
  2. Render a semantic heading, explanatory text, and retry `Button`.
  3. Wire the button directly to the supplied retry callback.
  4. Add a development-only effect for logging, with no sensitive error output in production UI.
- **Edge cases:** repeated clicks, missing error messages, dark mode, narrow mobile widths, keyboard focus, and a retry that fails again must all remain usable.

### 3. Add route-segment fallbacks

- **Input:** Next.js `error.tsx` props `{ error, retry }`.
- **Output:** root, dashboard, and auth fallback boundaries.
- **Steps:**
  1. Add `"use client"` to each fallback module.
  2. Delegate presentation to `RetryErrorState`.
  3. Use `retry()` rather than a full `window.location.reload()` or router navigation.
  4. Keep route-specific copy minimal and avoid assumptions about session state.
- **Edge cases:** the root fallback must not be placed in a way that prevents the root layout from rendering; auth redirects and dashboard access redirects must still navigate normally.

### 4. Add a component-level `catchError` wrapper

- **Input:** children subtree and optional fallback props.
- **Output:** a reusable Client Component boundary.
- **Steps:**
  1. Import `catchError` and `ErrorInfo` from `next/error`.
  2. Define a fallback compatible with the `catchError` callback signature.
  3. Pass `errorInfo.retry` to the shared retry UI.
  4. Wrap only the selected high-risk subtree, not the entire application by default.
  5. Confirm a successful retry replaces the fallback with the rendered children.
- **Edge cases:** descendants calling `notFound()` or `redirect()` must retain Next.js behavior; a persistent failure must remain recoverable and must not cause an infinite automatic retry loop.

### 5. Validate behavior

- **Input:** local development build and browser.
- **Output:** lint/build evidence plus manual recovery results.
- **Steps:**
  1. Run `npm run lint`.
  2. Run `npm run build`.
  3. Start `npm run dev` and exercise root, auth, and dashboard routes.
  4. Add a temporary, development-only throw in a wrapped render path to confirm each fallback appears.
  5. Click retry after removing the fault and confirm the original content returns without a full reload.
  6. Exercise a real or temporary Server Component fetch failure to confirm RSC re-fetch behavior. **[NEEDS CLARIFICATION: the current client/localStorage architecture has no existing Server Component fetch suitable for this step.]**
  7. Exercise valid `notFound()` and `redirect()` paths beneath each relevant boundary and confirm neither is replaced by generic error UI.
  8. Remove fault-injection code and rerun lint/build.
- **Edge cases:** hard refresh, navigation between route groups, repeated retry failure, mobile viewport, keyboard-only activation, and production build behavior.

## N — Norms

- **Naming:** follow existing lowercase kebab-case component filenames and PascalCase exported components; use `RetryErrorState` and `CatchErrorBoundary` consistently.
- **Imports:** use the `@/*` alias for project modules; import `Button` from `@/components/ui/button` and Next APIs from `next/error`.
- **Client boundaries:** every `error.tsx` and `catchError` fallback module must explicitly declare `"use client"`.
- **Styling:** reuse semantic theme tokens and existing shadcn components; use `gap-*`, not `space-*`; use `size-*` for equal dimensions.
- **Logging:** no logging infrastructure exists; use a minimal development-only `console.error` effect if needed, and avoid leaking raw errors to users.
- **Error handling:** retry only on explicit user action; do not convert `notFound`/`redirect` into generic errors; do not use a full-page reload as the primary recovery path.
- **Testing:** no test runner or test dependencies are configured, so validation is lint/build plus documented manual fault injection and browser checks.
- **Documentation:** keep this plan as the implementation reference; document any newly discovered Next.js 16.3 boundary behavior in the implementation PR if it changes these assumptions.

## S — Safeguards

- **Invariants:** normal `notFound()` responses remain 404s; `redirect()` remains navigation; successful routes retain existing auth layout and page composition; retry does not mutate localStorage data by itself.
- **Performance:** boundaries must render a lightweight fallback and must not add automatic retry loops, polling, or unnecessary client providers. `retry()` is user initiated.
- **Security:** never render raw server error messages, stack traces, digests, tokens, or localStorage contents; do not alter auth redirect behavior while adding the dashboard boundary.
- **Data integrity:** retry must re-run the failed render/data-fetch path without duplicating writes or changing persisted entities. A failed retry must leave the fallback stable.
- **Compatibility:** use the installed Next.js 16.3 API and verify the exact TypeScript types during build; do not add a dependency or rely on an undocumented `unstable_*` retry API.
- **Known limitation:** the current application is largely client-side and localStorage-backed, so the Server Component re-fetch acceptance criterion cannot be proven end-to-end until a failing Server Component/data fetch exists. **[NEEDS CLARIFICATION: provide or designate the production data-fetch path for that verification.]**

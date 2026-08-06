# Plan: Enable Instant Navigations with Cache Components and Partial Prefetching

## R — Requirements

### Problem

Enable the Next.js 16.3 Instant Navigations feature set so App Router navigations can reuse cached Server Component output and prefetch only the route segments needed for a transition.

### Definition of Done

- `cacheComponents: true` and `partialPrefetching: true` are present in `next.config.ts` and accepted by the installed Next.js 16.3 toolchain.
- All existing routes continue to build, lint, render, and preserve their current local-storage behavior.
- The navigation paths most used in the dashboard are measured before and after with Instant Insights (or the available equivalent), with no material regression in navigation latency, rendering, or data integrity.
- The route/loading audit is recorded and no unnecessary `loading.tsx` files or unsafe `'use cache'` directives are introduced.

### Scope In

- Add the two Next.js configuration flags.
- Audit all App Router routes, links, existing Suspense boundaries, and data access patterns.
- Validate dashboard navigation and the production build.
- Identify prefetch and future Server Component caching candidates.

### Scope Out

- Converting the current client-side/localStorage stores to a backend or Server Components.
- Adding `'use cache'` to pages that read browser-only localStorage or user-specific mutable state.
- Replacing the existing `Suspense` boundaries around `useSearchParams` without a demonstrated need.
- Adding a test framework or changing unrelated routes/UI behavior.

## E — Entities

No new domain entities or persistence models are required.

- **NextConfig**
  - Fields: `cacheComponents: boolean`, `partialPrefetching: boolean`.
  - Relationship: global build/runtime configuration for every App Router route.
  - Domain rule: both flags must be enabled together for the intended Instant Navigations behavior.
- **Route cacheable content**
  - Current state: no eligible server-fetched entity exists in the route tree. Agents, skills, prompts, and MCP connections are read from browser `localStorage` by client components.
  - Domain rule: do not cache browser-local, mutable, or user-specific values with `'use cache'`; cached function arguments and return values must be serializable.

## A — Approach

1. Establish a baseline using a production build and representative route transitions before changing configuration. Record navigation timing, visible loading states, console errors, and build/lint results.
2. Update only `next.config.ts` with the two Next.js 16.3 flags, retaining its typed `NextConfig` export and making no dependency changes.
3. Audit the route tree:
   - No `app/**/loading.tsx` files currently exist, so there are no route-level loading files to replace.
   - `app/(dashboard)/agents/new/page.tsx` and `app/(dashboard)/skills/new/page.tsx` already use inline `Suspense` around `useSearchParams`; retain those boundaries because they satisfy the current dynamic search-param requirement.
   - Other pages are client components and read localStorage synchronously through `lib/{agents,skills,prompts,mcp}` stores. They are not Server Component data-fetching candidates today.
4. Audit prefetch opportunities without adding custom prefetch logic initially. Existing `next/link` links already provide the integration points: dashboard/sidebar navigation, list-to-detail card links, and create flows.
5. Validate the build and route behavior. If the flags expose a compatibility error or a route prerendering error, isolate the failing route and address only the minimum boundary/configuration issue supported by Next.js 16.3 documentation.
6. Repeat the baseline navigation scenarios with Instant Insights, compare results, and document whether the improvement is observable. Because the current data is localStorage-backed, evaluate navigation/RSC payload behavior separately from client hydration/storage read time.

### Route and Prefetch Audit

| Route/group | Current data access | Prefetch value | Cache Components assessment |
| --- | --- | --- | --- |
| `/dashboard` | Counts from `listAgents()`, `getAllSkills()`, and `getAllPrompts()` in client state initialization | High: shared landing route links to all major collections and create flows | Not eligible currently; values are browser-local and mutable |
| `/agents`, `/skills`, `/prompts` | Collection reads from localStorage; skills also filters client-side | High: frequently visited from sidebar and dashboard; list-to-detail links are natural hover/viewport prefetch targets | No `'use cache'` currently; future API/database list queries could be cached after a server data layer exists |
| `/agents/[id]`, `/skills/[id]`, `/prompts/[id]` | ID lookup from localStorage in client components | High from collection cards; detail pages are common follow-up destinations | No current server fetch; future ID-keyed server reads are candidates only after serializable, user-scoped cache design |
| `/mcp`, `/mcp/[id]` | Connection reads/mutations from localStorage | Medium: sidebar entry and card-to-detail navigation | Do not cache mutable connection state; preserve immediate client updates |
| `/agents/new`, `/skills/new` | Client wizard/generator; optional prompt query reads localStorage | Medium from dashboard and collection create buttons; existing inline Suspense protects `useSearchParams` | No server data to cache |
| `/prompts/new`, `/settings`, auth/landing routes | Mostly static/client UI; auth state is client-managed | Low to medium depending on entry path | No cache directive planned |

The first implementation should therefore be configuration-only. `'use cache'` additions are explicitly deferred until route data is moved to server-fetchable sources; adding them now could produce stale or incorrect user data and would not cache localStorage reads.

## S — Structure

### Files to Modify

- `next.config.ts` — add `cacheComponents: true` and `partialPrefetching: true`.

### Files to Create

- None for application behavior.
- This plan: `docs/plans/plan-023-instant-navigations.md`.

### Files to Audit (no change expected unless validation requires it)

- `app/(dashboard)/layout.tsx` — shared client dashboard shell and auth redirect.
- `components/layout/sidebar.tsx` and `components/layout/sidebar-nav-item.tsx` — primary shared navigation links.
- `app/(dashboard)/dashboard/page.tsx` — cross-feature counts and quick actions.
- `app/(dashboard)/agents/page.tsx`, `skills/page.tsx`, `prompts/page.tsx`, `mcp/page.tsx` — collection routes.
- `app/(dashboard)/agents/[id]/page.tsx`, `skills/[id]/page.tsx`, `prompts/[id]/page.tsx`, `mcp/[id]/page.tsx` — detail routes.
- `app/(dashboard)/agents/new/page.tsx` and `skills/new/page.tsx` — existing inline Suspense boundaries.

### Dependency Changes

None. Next.js 16.3.0 and the matching `eslint-config-next` are already present according to the repository context and `package.json`.

## O — Operations

### Enable Instant Navigation Configuration

- **Input:** Existing typed `NextConfig` object in `next.config.ts`.
- **Output:** Next.js configuration with both flags enabled.
- **Implementation steps:**
  1. Add `cacheComponents: true`.
  2. Add `partialPrefetching: true`.
  3. Keep the existing import and default export unchanged.
  4. Run the type-aware build to confirm both option names are supported by the installed version.
- **Edge cases:** A config type error or unknown-option warning indicates a version/API mismatch and must block claiming completion; do not silently rename or move the flags.

### Route and Loading Audit

- **Input:** All files under `app/**`, existing `Suspense` usage, and route links.
- **Output:** Confirmed list of loading boundaries and prefetch candidates.
- **Implementation steps:**
  1. Confirm no `loading.tsx` files exist.
  2. Preserve the `useSearchParams` Suspense boundaries in the two create routes.
  3. Verify shared navigation and card links remain ordinary `next/link` links so Next.js can manage prefetching.
  4. Check that no localStorage-backed component is converted to a cached Server Component.
- **Edge cases:** Dashboard auth hydration intentionally returns `null` before mount; Instant Navigation measurements must distinguish this existing client gate from server navigation latency.

### Performance and Regression Verification

- **Input:** Baseline and post-change production runs.
- **Output:** Build/lint results, route smoke-test results, and before/after Instant Insights measurements.
- **Implementation steps:**
  1. Run `npm run lint` and `npm run build` before and after the config change.
  2. Start the production server with `npm run start` and test dashboard/sidebar, collection-to-detail, and collection-to-create transitions.
  3. Repeat each route once cold and once after prefetch/cache warm-up.
  4. Verify browser console errors, hydration warnings, route content, auth redirects, localStorage reads, edits, deletes, and MCP connection updates.
  5. Capture Instant Insights metrics where available, including navigation latency, loading/streaming behavior, and RSC/prefetch activity.
  6. Compare against baseline and document any limitation caused by the current client-only architecture.
- **Edge cases:** Empty localStorage, missing IDs, deleted records, query-param-driven create flows, unauthenticated dashboard access, and stale tabs must continue to behave as before.

## N — Norms

- Follow the existing TypeScript style: double-quoted imports, typed `NextConfig`, and default export from `next.config.ts`.
- Keep this change narrowly scoped; do not introduce custom caching helpers, client data libraries, or new dependencies.
- Preserve existing client-side error handling and hydration guards.
- Use `Suspense` for streamed/dynamic server content if a future server data migration introduces it; do not remove the existing `useSearchParams` boundaries.
- Validation uses the repository commands `npm run lint` and `npm run build`; no test runner or test dependency is configured.
- Record performance evidence and any Next.js compatibility findings in the implementation/PR notes.

## S — Safeguards

- **Invariants:** Existing route URLs, auth redirect behavior, localStorage schemas, CRUD behavior, empty/not-found states, and client mutation refreshes remain unchanged.
- **Performance:** Shared dashboard and collection links should be the primary measurement targets; avoid claiming server-data cache benefits where no server data exists.
- **Security:** Never cache authenticated or user-specific data across users. Do not apply `'use cache'` to localStorage access, mutable connection state, or values that depend on browser-only auth state.
- **Data integrity:** Cached content must not become the source of truth for localStorage mutations. After create/update/delete/disconnect actions, current client refresh behavior must remain authoritative.
- **Compatibility:** A successful build, lint run, and route smoke test are required. If `cacheComponents` or `partialPrefetching` is unsupported by the installed Next.js version, stop and record `[NEEDS CLARIFICATION: confirm the exact Next.js 16.3 Instant Navigation configuration/API]` rather than shipping an unverified substitute.

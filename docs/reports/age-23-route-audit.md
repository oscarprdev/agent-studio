# Route and Loading Audit — Instant Navigations (AGE-23)

## Methodology

Read-only audit of every App Router route in the codebase. Confirmed per-route:

1. Existence of `loading.tsx` at route level
2. Presence of inline `Suspense` boundaries and what they protect
3. Navigation link technology (`next/link` vs custom implementations)
4. Data source (localStorage, server fetch, or both)
5. Prefetch value (High / Medium / Low)
6. Cache Component eligibility

**Audit command results:**

| Check | Result |
|---|---|
| `find **/loading.tsx` | 0 results |
| `rg "'use cache'"` | 0 results |
| Total route file pages audited | 21 pages, 2 layouts |

---

## Per-Route Audit Table

### Dashboard group

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/dashboard` (`app/(dashboard)/dashboard/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (card links, quick actions via Button render=<Link>) | localStorage (`listAgents`, `getAllSkills`, `getAllPrompts`) | **High** | Not eligible — uses `useAuth()` context |
| `/agents` (`app/(dashboard)/agents/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (navigate to `/agents/new`) | localStorage (`getAll`) | **High** | Not eligible — client-only, localStorage-backed |
| `/agents/[id]` (`app/(dashboard)/agents/[id]/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (`<Link href="/agents">` for back button); `router.push()` used for navigation | localStorage (`store.getById`) | **High** | Not eligible — client component with `useParams` + `useRouter` |
| `/agents/new` (`app/(dashboard)/agents/new/page.tsx`) | ❌ None | ✅ Yes — `<Suspense fallback={null}>` wrapping `AgentWizardPage` which uses `useSearchParams()` | ✅ Yes (via `AgentWizard` children) | localStorage (`promptsStore.getById`) | Medium | Not eligible — `useSearchParams()` requires Suspense, client component |
| `/settings` (`app/(dashboard)/settings/page.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (placeholder only) | None | **Low** | Not eligible — stub page, no data or navigation |

### Skills group

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/skills` (`app/(dashboard)/skills/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (navigate to `/skills/new`; via `SkillCard` children) | localStorage (`getAll`, `search`) | **High** | Not eligible — client component, localStorage-backed |
| `/skills/[id]` (`app/(dashboard)/skills/[id]/page.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (detail page, no navigation links) | localStorage (`getById`) | **Medium** | Not eligible — client component with `useParams` |
| `/skills/new` (`app/(dashboard)/skills/new/page.tsx`) | ❌ None | ✅ Yes — `<Suspense fallback={null}>` wrapping `SkillGeneratorPage` which uses `useSearchParams()` | ✅ Yes (via `SkillGenerator` children) | localStorage (`promptsStore.getById`) | Medium | Not eligible — `useSearchParams()` requires Suspense, client component |

### Prompts group

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/prompts` (`app/(dashboard)/prompts/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (navigate to `/prompts/new`; via `PromptCard` children) | localStorage (`getAll`) | **High** | Not eligible — client component, localStorage-backed |
| `/prompts/[id]` (`app/(dashboard)/prompts/[id]/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (`<Link href="/prompts">` for back button) | localStorage (`getById`) | **Medium** | Not eligible — client component with `useParams` + `useRouter` |
| `/prompts/new` (`app/(dashboard)/prompts/new/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (via `PromptGenerator` child) | None (pure client form) | Medium | Not eligible — client component, form-only |

### MCP Connections group

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/mcp` (`app/(dashboard)/mcp/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (via `McpCard` children and `McpAddSheet`) | localStorage (`getAll`) | **Medium** | Not eligible — client component, localStorage-backed |
| `/mcp/[id]` (`app/(dashboard)/mcp/[id]/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (`router.push("/mcp")`) | localStorage (`getById`) | **Low** | Not eligible — client component, detail page |

### Auth group

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/login` (`app/(auth)/login/page.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (form-only component) | None (handled by `LoginForm` + `useAuth`) | **Low** | Not eligible — auth form, not navigated-to frequently |
| `/signup` (`app/(auth)/signup/page.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (form-only component) | None (handled by `SignupForm` + `useAuth`) | **Low** | Not eligible — auth form |
| `/onboarding` (`app/(auth)/onboarding/page.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (form-only component) | None (handled by `OnboardingWizard` + `useAuth`) | **Low** | Not eligible — one-time flow |

### Root

| Route | `loading.tsx` | Suspense | `next/link` | Data Source | Prefetch Value | Cache Comp Eligible |
|---|---|---|---|---|---|---|
| `/` (`app/page.tsx`) | ❌ None | ❌ No inline boundaries | ✅ Yes (`router.push`) | localStorage (`useAuth`) | **Low** | Not eligible — redirect/wrapper client component |

### Layouts (non-page)

| Layout | `loading.tsx` | Suspense | `next/link` | Data Source |
|---|---|---|---|---|
| Root (`app/layout.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (shell layout) | None (only `AuthProvider` provider) |
| Auth (`app/(auth)/layout.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (shell layout) | None (plain wrapper) |
| Dashboard (`app/(dashboard)/layout.tsx`) | ❌ None | ❌ No inline boundaries | ❌ N/A (shell layout) | Client `useAuth` state with `router.push("/login")` redirect |

---

## Shared Component Audit

### Sidebar navigation (`components/layout/sidebar.tsx`)

- ✅ All navigation uses `<SidebarNavItem>` which internally renders `<Link href={href}>` (imported from `next/link`)
- Uses `"use client"` — renders in client, links are standard Next.js `next/link` elements
- 7 navigation items: Home, Agents, Skills, Prompts, MCP Connections, Marketplace, Settings

### Sidebar nav item (`components/layout/sidebar-nav-item.tsx`)

- ✅ Standard `<Link href={href}>` rendering
- Uses `usePathname()` for active-state highlighting
- No custom link wrappers or alternative navigation implementations

### Dashboard layout (`app/(dashboard)/layout.tsx`)

- Layout is a `"use client"` component (required for the auth guard redirect)
- Renders `<Sidebar />`, `<MobileSidebar />`, and `<main>` children
- No navigation links directly in the layout; delegates to `<Sidebar />`
- Auth guard: `router.push("/login")` — this is a client-side navigation push (not prefetchable)

---

## Suspense Boundary Findings

### Confirmed Suspense boundaries (both required by `useSearchParams`)

| Route | Protected Component | Protects |
|---|---|---|
| `/agents/new` | `AgentWizardPage` | `useSearchParams()` call in `AgentWizardPage` sub-component |
| `/skills/new` | `SkillGeneratorPage` | `useSearchParams()` call in `SkillGeneratorPage` sub-component |

Both Suspense patterns are identical: a parent page component renders `<Suspense fallback={null}>` around a sub-component that calls `useSearchParams()`. The fallback is `null` (empty), meaning no visual spinner is shown — the content simply waits for Suspense resolution.

**Verdict:** These boundaries must be preserved as-is. They are the only Suspense boundaries in the entire codebase.

---

## `'use cache'` Directive Audit

**Result: Zero `'use cache'` directives found in the entire codebase.**

No route or component can be converted to a Cache Component without first:
1. Adding Server Component data fetching infrastructure
2. Eliminating `use client` / localStorage-based state patterns

---

## localStorage Data Pattern

Every data-read route in the `(dashboard)` group follows the same pattern:

```tsx
// Client component (use client)
const [items, setItems] = useState<SomeType[]>(() => getAll()) // synchronous localStorage read
```

This means:

- **No Server Components read any data** — all stores (`lib/agents/store`, `lib/skills/store`, `lib/prompts/store`, `lib/mcp/store`) are synchronous localStorage wrappers.
- **No `'use cache'` eligibility** exists — cache Components must be async and cache server-fetch results.
- **`cacheComponents` is irrelevant** to data — only the layout/shell rendering could ever benefit.
- The `"use client"` directive is present in **every single page file and component** that reads data.
- The auth store (`lib/auth-store.ts`, `lib/auth-context.tsx`) also reads from localStorage and is a `"use client"` context provider.

---

## Highest-Value Prefetch Candidates

Based on the audit, routes with prefetch value are:

### High Priority

| Route | Reason |
|---|---|
| `/dashboard` → `/agents`, `/skills`, `/prompts` | Dashboard stat cards are prominent nav — highest click-through surface |
| `/dashboard` → `/agents/new`, `/skills/new` /etc | Quick action buttons on dashboard are primary user paths |
| `/agents` → `/agents/[id]` | List-to-detail navigation via cards — high frequency |
| `/skills` → `/skills/[id]` | List-to-detail navigation via cards |
| `/prompts` → `/prompts/[id]` | List-to-detail navigation |

### Medium Priority

| Route | Reason |
|---|---|
| `/agents/new`, `/skills/new`, `/prompts/new` | Create page entry points — navigated from list pages and dashboard |
| `/agents/[id]` (from sidebar) | Detail page navigated via sidebar + list cards |
| `/settings` | Low-value but present in sidebar |

### Low Priority (no prefetch needed currently)

| Route | Reason |
|---|---|
| `/login`, `/signup`, `/onboarding` | Auth routes — one-time visits, not frequently navigated between |
| `/mcp` | Low traffic area; limited nav surface |
| `/mcp/[id]` | Detail page with minimal navigation surface |
| `/` (root) | Redirects to dashboard; not a navigation target |

---

## Observations

### Positive findings

1. **No `loading.tsx` files exist** — This is a clean slate for adding inline Suspense boundaries or prefetching without interference from route-level loading states.
2. **All navigation uses `next/link`** — No custom link wrappers or alternative navigation patterns that would break Next.js prefetching.
3. **Suspense boundaries are correctly placed** — The `Suspense` boundaries in `agents/new` and `skills/new` are properly positioned around `useSearchParams()` calls with `fallback={null}`.
4. **Sidebar nav uses standard `next/link`** — `SidebarNavItem` component is a thin wrapper around Next.js Link with active-state logic.

### Notes for future work

1. **All routes are `"use client"`** — This means no data fetching is currently happening on the server. The `cacheComponents` feature will not affect data loading in the current architecture. Any prefetch work should focus on client-side `<Link>` prefetch attributes or `next/link`'s built-in prefetch capabilities.
2. **No `loading.tsx` files means no route-level streaming** — If streaming is desired, it must be done through inline `Suspense` boundaries in the page components (as already practiced in the create routes).
3. **The dashboard stat cards are the prime prefetch targets** — Three `<Link>` elements wrapping `<Card>` components, each pointing to a list page.
4. **`/marketplace` link in sidebar has no route** — The sidebar includes a "Marketplace" item linking to `/marketplace`, but no route directory exists at `app/(dashboard)/marketplace/`. This route is a dead link.

---

## Verification Results

Verification performed after task-019 added `cacheComponents: true` and `partialPrefetching: true` to `next.config.ts` (Next.js 16.3.0 / Turbopack).

### Build

| Check | Result |
|---|---|
| `npm run build` | ❌ **FAILED** — 1 error |
| Config flags recognized | ✅ `cacheComponents` enabled, `partialPrefetching` enabled (logged by Next.js) |

**Error:**

```
Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. Please remove it.
  ./app/(auth)/login/page.tsx:3:14
  > 3 | export const dynamic = "force-dynamic"
```

**Root cause:** `cacheComponents` is incompatible with route segment `dynamic = "force-dynamic"`. Only `app/(auth)/login/page.tsx` sets `dynamic = "force-dynamic"` across the entire codebase.

**Fix:** Remove `export const dynamic = "force-dynamic"` from `app/(auth)/login/page.tsx` (resolved in task-022).

### Lint

| Check | Result |
|---|---|
| `npm run lint` | ❌ **FAILED** — pre-existing issue, unrelated to config change |

**Error:**

```
Error: typescript-eslint does not support TS 7.0.
Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/...
```

**Root cause:** TypeScript 7.0.2 is installed but the project uses `typescript-eslint` which doesn't yet support TS 7.x API. This is a **pre-existing** environment issue, not caused by task-019 config change.

### Cache Components Compatibility Summary

| Route | Has `dynamic` config | Cache Comp compatible? |
|---|---|---|
| `/login` | `dynamic = "force-dynamic"` | ❌ Incompatible |
| All other routes | No `dynamic` config | ✅ Compatible |

**Note:** The `partialPrefetching` flag did not introduce any build errors or warnings on its own. The only incompatibility is between `cacheComponents` and `dynamic = "force-dynamic"`, and only the login page is affected.

### Route Smoke Tests

These were **not executed** because the build failed. Route-level smoke testing will proceed once the build is fixed (task-022).
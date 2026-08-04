# REASONS: Landing Page Implementation — AGE-6

## R — Requirements

### Problem

The codebase has no landing page. The root `app/page.tsx` is default Next.js boilerplate. After AGE-1 (app shell) completes, the dashboard becomes the authenticated view — but there is no unauthenticated entry point. Without a landing page, new users have no way to discover the product, understand its value, or enter the application.

### Definition of Done

1. Root `app/page.tsx` replaced with a full landing page containing Hero, Features, How It Works, and Footer sections
2. Hero section displays headline "Build production AI agents faster." with subheadline and "Create Agent" CTA linking to `/agents/new` (fallback `/prompts/new`)
3. Features section shows 3-column grid with Prompt Generator, Skill Generator, and Agent Builder cards
4. How It Works section shows 3-step flow: Describe → Generate → Deploy
5. Footer contains copyright, GitHub link, and docs link (placeholder URLs)
6. Responsive design: single-column on mobile, multi-column on desktop
7. Dark mode support via existing `.dark` class and oklch tokens
8. Landing page is a Server Component (no `"use client"` unless interactivity required)
9. Page passes `next build` without errors
10. Visual aesthetic: terminal/code gradient or abstract geometric pattern — no stock imagery

### Scope In

- Replace `app/page.tsx` with landing page
- Create `components/landing/` directory with section components
- Use existing shadcn/ui components (Button, Card, Separator)
- Use lucide-react icons for feature icons
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Dark mode via existing oklch CSS variables

### Scope Out

- Authentication/signup flow (separate issue)
- Secondary CTAs ("Learn More", "View Demo")
- Animations or motion design
- Analytics/tracking
- A/B testing
- SEO metadata beyond what exists in root layout

---

## E — Entities

No new domain entities are introduced. The landing page is purely presentational.

### Existing Entities Referenced

- **Agent**: Target of primary CTA (`/agents/new`)
- **Prompt**: Fallback target (`/prompts/new`)

### Domain Rules

- Landing page is the unauthenticated entry point
- Dashboard layout (`(dashboard)/layout.tsx`) guards authenticated routes — landing page lives outside that route group
- Primary CTA must link to agent creation or prompt creation (not dashboard home)

---

## A — Approach

### Design Pattern

**Component Composition Pattern** — each landing page section is a discrete, reusable component composed in the root page. No state management needed. Server Components by default.

### Strategy

1. **Componentize by section**: Hero, Features, HowItWorks, Footer each get their own file in `components/landing/`
2. **Root page as orchestrator**: `app/page.tsx` imports and composes all sections
3. **Reuse existing primitives**: Button (for CTAs), Card (for feature cards), Separator (for visual dividers)
4. **CSS-only visual effects**: Use Tailwind gradients and oklch tokens for the hero background — no images, no JS animations
5. **Semantic HTML**: Use `<header>`, `<section>`, `<footer>`, `<nav>` for accessibility

### Trade-offs

**Advantages:**
- Component isolation: each section can be modified independently
- Server Components: zero client-side JS for the landing page
- Reuses existing shadcn primitives, consistent with dashboard
- No new dependencies

**Disadvantages:**
- Visual polish may be limited without custom assets (trade-off for speed)
- No animations (can be added later as separate issue)

**Alternative approaches considered:**
- Single monolithic page component → rejected for maintainability
- Marketing page with external CMS → overkill for MVP
- Dynamic content from API → no backend yet

---

## S — Structure

### Location

```
app/page.tsx                          (replace — root landing page)
components/landing/                    (create directory)
├── hero.tsx                          (create — hero section)
├── features.tsx                      (create — features grid)
├── how-it-works.tsx                  (create — 3-step flow)
└── footer.tsx                        (create — minimal footer)
```

### Files To Create

```
Create:
- components/landing/hero.tsx
- components/landing/features.tsx
- components/landing/how-it-works.tsx
- components/landing/footer.tsx
```

### Files To Modify

```
Modify:
- app/page.tsx (complete replacement)
```

### Dependencies

New dependencies:

```
None.
```

Affected existing dependencies:

```
None.
```

All components use existing packages: lucide-react, shadcn/ui primitives, Tailwind CSS, cn().

---

## O — Operations

### Operation 1: Create Hero Section

**Input:**
```typescript
// No props needed — static content
```

**Output:**
```typescript
// Server Component — React.ReactNode
export function Hero(): React.ReactNode
```

**Steps:**

1. Create `components/landing/hero.tsx`
2. Import Button from `@/components/ui/button`
3. Import Link from `next/link`
4. Import lucide-react icons: `Bot` (or `Sparkles`) for visual flair
5. Build section with:
   - Outer wrapper: `<section className="relative overflow-hidden">`
   - Background: gradient using oklch tokens — `bg-gradient-to-b from-muted/50 via-background to-background`
   - Decorative element: abstract geometric pattern using CSS (grid of dots or lines) — optional, can be a simple radial gradient
   - Content container: `max-w-4xl mx-auto px-6 py-24 md:py-32 text-center`
   - Headline: `<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Build production AI agents faster.</h1>`
   - Subheadline: `<p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Generate prompts, skills and agents with automatic context engineering.</p>`
   - CTA group: `<div className="mt-10 flex items-center justify-center gap-4">`
   - Primary CTA: `<Button size="lg" asChild><Link href="/agents/new">Create Agent</Link></Button>`
   - Secondary CTA (optional): `<Button variant="outline" size="lg">Learn More</Button>` — can be omitted per scope
6. Ensure responsive: text scales from `text-4xl` on mobile to `text-6xl` on desktop, padding adjusts

**Edge Cases:**
- If `/agents/new` route doesn't exist yet, link to `/prompts/new` as fallback
- Mobile: single column, centered text, reduced padding
- Dark mode: gradient colors resolve via oklch tokens automatically

---

### Operation 2: Create Features Section

**Input:**
```typescript
// No props needed — static content
```

**Output:**
```typescript
// Server Component — React.ReactNode
export function Features(): React.ReactNode
```

**Steps:**

1. Create `components/landing/features.tsx`
2. Import Card, CardHeader, CardTitle, CardDescription from `@/components/ui/card`
3. Import lucide-react icons: `MessageSquare` (Prompt), `Wrench` (Skill), `Bot` (Agent)
4. Define feature data array:
   ```typescript
   const features = [
     {
       icon: MessageSquare,
       title: "Prompt Generator",
       description: "Describe what you need in natural language. Get production-ready prompts.",
     },
     {
       icon: Wrench,
       title: "Skill Generator",
       description: "Create reusable AI skills with instructions, tools, and rules.",
     },
     {
       icon: Bot,
       title: "Agent Builder",
       description: "Build complete agents with models, tools, skills, and context.",
     },
   ]
   ```
5. Build section:
   - Outer wrapper: `<section className="py-24 bg-background">`
   - Container: `max-w-6xl mx-auto px-6`
   - Section heading: `<h2 className="text-3xl font-bold text-center text-foreground">Everything you need to build AI agents</h2>`
   - Grid: `<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">`
   - Each feature: `<Card>` with icon, title, description
   - Card content: icon in `<CardHeader>`, title in `<CardTitle>`, description in `<CardDescription>`
6. Use existing Card component with `data-slot` pattern

**Edge Cases:**
- Mobile: cards stack vertically (grid-cols-1)
- Tablet/desktop: 3-column grid (md:grid-cols-3)
- Dark mode: Card uses `bg-card` token, resolves automatically

---

### Operation 3: Create How It Works Section

**Input:**
```typescript
// No props needed — static content
```

**Output:**
```typescript
// Server Component — React.ReactNode
export function HowItWorks(): React.ReactNode
```

**Steps:**

1. Create `components/landing/how-it-works.tsx`
2. Import Separator from `@/components/ui/separator`
3. Import lucide-react icons: `MessageSquareText` (Describe), `Sparkles` (Generate), `Rocket` (Deploy)
4. Define steps array:
   ```typescript
   const steps = [
     {
       number: "1",
       icon: MessageSquareText,
       title: "Describe",
       description: "Tell AI what you want to build",
     },
     {
       number: "2",
       icon: Sparkles,
       title: "Generate",
       description: "AI creates prompts, skills, and agents",
     },
     {
       number: "3",
       icon: Rocket,
       title: "Deploy",
       description: "Export, save, and use your agents",
     },
   ]
   ```
5. Build section:
   - Outer wrapper: `<section className="py-24 bg-muted/30">`
   - Container: `max-w-4xl mx-auto px-6`
   - Section heading: `<h2 className="text-3xl font-bold text-center text-foreground">How it works</h2>`
   - Steps container: `<div className="mt-16 flex flex-col md:flex-row items-center gap-12 md:gap-8">`
   - Each step: numbered circle with icon, title below, description below title
   - Between steps: Separator on desktop, vertical line connector
6. Number circles: `flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground font-bold`

**Edge Cases:**
- Mobile: steps stack vertically with connecting line
- Desktop: steps horizontal with separators between them
- Dark mode: uses token-based colors

---

### Operation 4: Create Footer Section

**Input:**
```typescript
// No props needed — static content
```

**Output:**
```typescript
// Server Component — React.ReactNode
export function Footer(): React.ReactNode
```

**Steps:**

1. Create `components/landing/footer.tsx`
2. Import Separator from `@/components/ui/separator`
3. Build section:
   - Outer wrapper: `<footer className="border-t border-border bg-background">`
   - Container: `max-w-6xl mx-auto px-6 py-8`
   - Content: flex row with copyright left, links right
   - Copyright: `<p className="text-sm text-muted-foreground">© 2026 AI Agent Studio</p>`
   - Links: GitHub and Docs placeholder links
   - Links styled as: `<a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">`
4. Keep minimal — no newsletter, no social icons

**Edge Cases:**
- Mobile: stack vertically (copyright above, links below)
- Desktop: horizontal row

---

### Operation 5: Replace Root Page

**Input:**
```typescript
// No props needed
```

**Output:**
```typescript
// Server Component — default export
export default function Home(): React.ReactNode
```

**Steps:**

1. Replace `app/page.tsx` contents entirely
2. Import all landing section components:
   ```typescript
   import { Hero } from "@/components/landing/hero"
   import { Features } from "@/components/landing/features"
   import { HowItWorks } from "@/components/landing/how-it-works"
   import { Footer } from "@/components/landing/footer"
   ```
3. Compose:
   ```typescript
   export default function Home() {
     return (
       <div className="flex flex-col min-h-screen bg-background">
         <Hero />
         <Features />
         <HowItWorks />
         <div className="flex-1" />
         <Footer />
       </div>
     )
   }
   ```
4. Remove all existing boilerplate (Image imports, Vercel links, etc.)
5. Ensure no `"use client"` directive — this is a Server Component

**Edge Cases:**
- Must pass `next build` without errors
- No unused imports
- No client-side hooks in this file

---

## N — Norms

### Naming

- **Component files**: `kebab-case` (e.g., `how-it-works.tsx`)
- **Component exports**: `PascalCase` function exports (e.g., `HowItWorks`)
- **CSS classes**: Tailwind utility classes, `gap-*` not `space-*`, `size-*` for equal dimensions
- **Icons**: Import from `lucide-react`, use PascalCase names
- **Path aliases**: Use `@/*` for all imports

### Logging

Not applicable — landing page has no data fetching or API calls.

### Error Handling

Not applicable — no API calls, no state, no error boundaries needed.

### Testing

**No test runner is configured.** The AGENTS.md explicitly states: "No test runner is configured. There are no test scripts, test files, or testing dependencies."

Manual verification:
1. `npm run build` passes without errors
2. `npm run lint` passes without warnings
3. Visual inspection on mobile and desktop viewports
4. Dark mode toggle works correctly

### Documentation

- Update this plan file if implementation deviates from design
- No API documentation needed (no API calls)
- No changelog update needed for this task

---

## S — Safeguards

### Invariants

1. **No client-side code unless required**: Landing page must be a Server Component
2. **No stock imagery**: Use CSS gradients and geometric patterns only
3. **No authentication required**: Landing page must render without a token
4. **CTA links must resolve**: Primary CTA must link to `/agents/new` or `/prompts/new`
5. **No layout conflicts**: Landing page must NOT use dashboard layout — it's outside `(dashboard)/` route group

### Performance

- **No client-side JavaScript**: Server Components only
- **No images**: CSS-only visual effects (zero network requests for assets)
- **Minimal bundle**: Only imports existing UI primitives
- **Target**: Landing page should render in <100ms on 3G (no data fetching)

### Security

- No API calls, no user data, no authentication
- External links use `target="_blank"` with `rel="noopener noreferrer"`
- No user input forms

### Data Integrity

- No data mutations
- No localStorage/sessionStorage reads
- No cookies

---

## Implementation Notes for Tech Lead

### Recommended Task Order

1. **Task 1**: Create `components/landing/` directory and `hero.tsx`
2. **Task 2**: Create `features.tsx`
3. **Task 3**: Create `how-it-works.tsx`
4. **Task 4**: Create `footer.tsx`
5. **Task 5**: Replace `app/page.tsx` with landing page composition
6. **Task 6**: Verify `npm run build` and `npm run lint` pass
7. **Task 7**: Visual QA on mobile and desktop

### Visual Design Notes

The hero section background should use a subtle gradient that works in both light and dark mode:

```tsx
// Light mode: soft gray gradient
// Dark mode: deep dark gradient
// Use oklch tokens for automatic theme support
<div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
```

For the geometric/terminal aesthetic mentioned in PRD, consider adding a subtle grid pattern using CSS:

```tsx
// Optional: dot grid pattern
<div className="absolute inset-0 bg-[radial-gradient(circle,var(--foreground)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03]" />
```

### Responsive Breakpoints

- `< 768px` (mobile): Single column, centered, reduced padding
- `768px - 1024px` (tablet): 2-column features, horizontal steps
- `> 1024px` (desktop): 3-column features, full-width layout

### Dark Mode

All colors use oklch CSS variables from `globals.css`. Dark mode is handled automatically by the `.dark` class on `<html>`. No special dark mode handling needed in components — just use semantic tokens (`bg-background`, `text-foreground`, `bg-muted`, etc.).

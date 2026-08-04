# Task 002 - Features Section Component

## Reference

Plan document:

[docs/plans/plan-001-landing-page.md](../plans/plan-001-landing-page.md)

Relevant section:

Operation 2: Create Features Section

---

## Description

Create the Features section component as a Server Component in `components/landing/features.tsx`. This section displays a 3-column grid of feature cards covering Prompt Generator, Skill Generator, and Agent Builder — the core product capabilities.

**Responsibility:** One component that showcases the three pillars of the product using existing shadcn/ui Card primitives.

---

## Acceptance Criteria

- File `components/landing/features.tsx` exists and exports `Features` as a named function returning `React.ReactNode`
- No `"use client"` directive — component is a Server Component
- Defines a static features data array with exactly 3 entries:
  1. **Prompt Generator** — icon: `MessageSquare`, description about production-ready prompts
  2. **Skill Generator** — icon: `Wrench`, description about reusable AI skills
  3. **Agent Builder** — icon: `Bot`, description about complete agents
- Each feature is rendered inside a `<Card>` with `CardHeader`, `CardTitle`, `CardDescription`
- Feature icons appear inside the CardHeader
- Section heading: "Everything you need to build AI agents" (h2, centered)
- Grid layout: `grid-cols-1` on mobile, `md:grid-cols-3` on desktop/tablet
- Cards have consistent gap between them (`gap-6`)
- Wraps section in semantic `<section>` tag with `bg-background`
- Sections use `py-24` vertical padding, `max-w-6xl` content width
- Uses existing shadcn/ui Card, CardHeader, CardTitle, CardDescription components with `data-slot` integrity
- Uses `@/*` path alias for all local imports
- Passes `npm run build` with no errors

---

## Out Of Scope

- Card actions (buttons inside feature cards)
- Hover animations or transitions beyond existing CSS
- Dynamic data fetching
- Feature filtering or sorting

---

## Domain

### Features

The Features section communicates the three core product capabilities to visitors. Each card represents a key workflow: creating prompts, creating skills, and building agents. This is the primary "what does this product do?" section.

**Importance:** Visitors who understand the headline need this section to understand the product's specific capabilities. Each card maps to a distinct user need in the AI workflow.

**Implementation scope:** This task creates only the Features component with static content and the existing shadcn/ui Card composition pattern. No props, no state, no client-side behavior.

---

## Graph

```mermaid
graph TD
    A[Visitor scrolls past Hero] --> B[Features section renders]
    B --> C[Section heading "Everything you need to build AI agents"]
    C --> D[3-column grid of feature cards]
    D --> E[Prompt Generator card]
    D --> F[Skill Generator card]
    D --> G[Agent Builder card]
    E --> H[Icon + Title + Description]
    F --> H
    G --> H
```
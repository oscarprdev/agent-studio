# Task 001 - Hero Section Component

## Reference

Plan document:

[docs/plans/plan-001-landing-page.md](../plans/plan-001-landing-page.md)

Relevant section:

Operation 1: Create Hero Section

---

## Description

Create the Hero section component as a Server Component in `components/landing/hero.tsx`. This is the top-most section of the landing page and contains the product headline, subheadline, and primary "Create Agent" CTA.

**Responsibility:** One component, one responsibility — the hero banner that greets visitors.

---

## Acceptance Criteria

- File `components/landing/hero.tsx` exists and exports `Hero` as a named function returning `React.ReactNode`
- No `"use client"` directive — component is a Server Component
- Headline renders: "Build production AI agents faster." (h1, `text-4xl md:text-6xl font-bold tracking-tight`)
- Subheadline renders below h1 with muted foreground color and limited max-width
- Primary CTA Button with text "Create Agent" links to `/agents/new` (or `/prompts/new` if that doesn't exist)
- CTA uses `size="lg"` on the Button primitive
- Background uses `bg-gradient-to-b` or `bg-gradient-to-br` with oklch semantic tokens (e.g. `from-muted/50 via-background to-background`)
- Optional: decorative geometric element using CSS gradient (radial or dot pattern) — low opacity
- Responsive: text and padding scale from mobile (`text-4xl`, reduced padding) to desktop (`text-6xl`, full padding)
- Wraps content in semantic `<section>` tag
- Uses `@/*` path alias for all local imports
- Passes `npm run build` with no errors

---

## Out Of Scope

- Secondary CTA ("Learn More", "View Demo") — explicitly out of plan scope
- Animations or motion effects
- Analytics or tracking
- SEO metadata on this component

---

## Domain

### Hero Section

Represents the first visual impression of the product. It communicates the core value proposition ("Build production AI agents faster.") and provides the primary path to action ("Create Agent").

**Importance:** This is the unauthenticated entry point for all new visitors. The headline and CTA drive the first conversion step.

**Implementation scope:** This task creates only the Hero component file with static content and CSS-only decorative styling. No props, no state, no client-side behavior.

---

## Graph

```mermaid
graph TD
    A[Visitor lands on homepage] --> B[Hero section renders]
    B --> C[Headline + subheadline visible]
    C --> D[Primary CTA "Create Agent" available]
    D --> E[User clicks CTA]
    E --> F[Navigate to /agents/new]
```
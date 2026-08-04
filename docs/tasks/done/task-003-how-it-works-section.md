# Task 003 - How It Works Section Component

## Reference

Plan document:

[docs/plans/plan-001-landing-page.md](../plans/plan-001-landing-page.md)

Relevant section:

Operation 3: Create How It Works Section

---

## Description

Create the How It Works section component as a Server Component in `components/landing/how-it-works.tsx`. This section shows the 3-step workflow (Describe → Generate → Deploy) as a horizontal process flow on desktop and a vertical stack on mobile.

**Responsibility:** One component that visualizes the product's core workflow as a numbered step sequence.

---

## Acceptance Criteria

- File `components/landing/how-it-works.tsx` exists and exports `HowItWorks` as a named function returning `React.ReactNode`
- No `"use client"` directive — component is a Server Component
- Defines a static steps data array with exactly 3 entries:
  1. **Describe** — step number "1", icon: `MessageSquareText`, description "Tell AI what you want to build"
  2. **Generate** — step number "2", icon: `Sparkles`, description "AI creates prompts, skills, and agents"
  3. **Deploy** — step number "3", icon: `Rocket`, description "Export, save, and use your agents"
- Each step has a numbered circle element: `size-12 rounded-full bg-primary text-primary-foreground font-bold`
- Icon renders below the number circle
- Desktop layout: horizontal row with `flex-row`, steps separated by `Separator` or visual gap
- Mobile layout: vertical column with `flex-col`, connecting line between steps
- Section heading: "How it works" (h2, centered)
- Background: subtle muted background (`bg-muted/30`)
- `py-24` vertical padding, `max-w-4xl` content width
- Wraps section in semantic `<section>` tag
- Uses `@/*` path alias for all local imports
- Passes `npm run build` with no errors

---

## Out Of Scope

- Interactive step navigation
- Animated transitions between steps
- Connector lines that span the full section height on mobile
- Step-to-step validation or state

---

## Domain

### How It Works

The "How it works" section maps the user's mental model of the product workflow. It reduces uncertainty by showing a simple 3-step process that any visitor can understand: describe what they want, let AI generate it, then deploy or use it.

**Importance:** This section transforms abstract capability (features section) into an actionable mental model. It helps visitors understand the process without needing to sign up or read documentation.

**Implementation scope:** This task creates only the HowItWorks component with static content. No props, no state, no client-side behavior.

---

## Graph

```mermaid
graph TD
    A[Visitor scrolls to How It Works] --> B[Section heading "How it works"]
    B --> C[Step 1: Describe — icon + number circle + text]
    C --> D[Step 2: Generate — icon + number circle + text]
    D --> E[Step 3: Deploy — icon + number circle + text]
    E --> F[Implicit: visitor now understands the workflow]
```
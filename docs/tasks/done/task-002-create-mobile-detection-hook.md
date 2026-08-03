# Task 002 - Create mobile detection hook

## Reference

Plan document:

docs/plans/plan-age-1-app-shell.md

Relevant section:

Operation 2: Create mobile detection hook

---

## Description

Create a `useMobile` hook in `hooks/use-mobile.ts` that detects whether the viewport is below a configurable breakpoint (default 768px). This hook is used by the mobile sidebar overlay to conditionally show/hide the hamburger menu and sidebar panel.

The hook uses `useState` with a `false` default to prevent SSR hydration mismatch, and attaches a `resize` event listener with proper cleanup.

---

## Acceptance Criteria

- File `hooks/use-mobile.ts` exists
- Hook is exported as a named export `useMobile`
- Hook accepts an optional `breakpoint` parameter (default `768`)
- Hook returns a `boolean` (`true` when `innerWidth < breakpoint`)
- Hook uses `"use client"` directive
- Default state is `false` (prevents SSR hydration mismatch)
- Resize listener is attached in `useEffect` and cleaned up on unmount
- Hook works correctly when imported via `@/hooks/use-mobile`

---

## Out Of Scope

- No use of the hook in any component — only the hook itself
- No media query-based detection (uses `window.innerWidth` + resize listener)
- No debouncing of resize events

---

## Domain

### Mobile Detection

The app shell must adapt its navigation pattern based on screen size: desktop shows a persistent fixed sidebar, while mobile (< 768px) shows a hamburger button that opens a slide-out panel. This hook is the single source of truth for detecting which mode is active, keeping the layout and sidebar components free of browser API calls.

**Implementation scope:**

Create a small client hook with a resize listener. No component usage.

---

## Graph

```mermaid
graph TD
    A[Hook mounts] --> B[useState false — avoids SSR mismatch]
    B --> C[useEffect: run check() immediately]
    C --> D[Attach resize listener]
    D --> E[Returns isMobile boolean]
    E --> F[On unmount: remove listener]
```
# Task 047-001 — Add Dialog, Table, and Alert UI Components

## Reference

Plan document: `docs/plans/plan-47-version-history.md`

Relevant section:

Structure — Files To Inspect During Implementation:

> `components/ui/alert-dialog.tsx`, `components/ui/dialog.tsx`, `components/ui/table.tsx`, `components/ui/badge.tsx`, and `components/ui/empty.tsx` — use only installed Base UI/shadcn APIs and existing composition conventions.

---

## Description

The Agent detail page will display version history and comparison views using shadcn/ui primitives. This project currently lacks three required components:

1. **Dialog** — needed for the version compare modal (plan §O, Operation 5, step 2)
2. **Table** — needed for the version list display (plan §O, Operation 5, step 1)
3. **Alert** — needed for error/warning notices in version operations (plan §S: "Render prompts, reasons, names, and labels as React text")

Install these components using the project's shadcn CLI with Base UI conventions. Verify each component works with `npx shadcn@latest add --diff` before committing.

---

## Acceptance Criteria

- `components/ui/dialog.tsx` exists with Base UI composition (uses `@base-ui/react/dialog`)
  - Exports: `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - Follows the same slot/class naming convention as existing components (`data-slot="dialog"`, etc.)
  - Uses `useRender` from `@base-ui/react/use-render` pattern consistent with `Badge` and `Button`
- `components/ui/table.tsx` exists with Base UI composition
  - Exports: `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell`, `TableBody`
  - Uses `cn()` for styling
- `components/ui/alert.tsx` exists with Base UI composition
  - Exports: `Alert`, `AlertTitle`, `AlertDescription`
  - Variants: `default`, `destructive`
  - Uses semantic tokens (`bg-muted`, `text-muted-foreground`, `border-border`)
  - Has an `AlertIcon` that renders icons based on variant (consistent with toast icon pattern)
- All three components follow `gap-*` spacing (never `space-*`)
- All three use `cn()` for conditional class merging
- `npx shadcn@latest info --json` confirms they are installed

---

## Out Of Scope

- Any version history logic, store functions, or diff utilities
- Dialog/Table usage in version history components (covered in later tasks)
- Custom Dialog variants beyond the basic composition

---

## Domain

### Base UI Dialog

The project uses @base-ui/react primitives (not Radix). Dialog must use the Base UI composition pattern (see existing Badge/Button components for the `useRender` pattern with `mergeProps`).

### Base UI Table

Table is a simple presentational component — no interactivity. It composes semantic `<table>` elements styled with Tailwind and `data-*` slot attributes.

### Base UI Alert

Alert follows the same variant pattern as Badge (`cva` with `variant: default | destructive`). Uses semantic color tokens (`bg-muted`, `border-border`, `text-muted-foreground`), never raw color values.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/ui/dialog.tsx` |
| Create | `components/ui/table.tsx` |
| Create | `components/ui/alert.tsx` |

## Commands

```bash
npx shadcn@latest add dialog table alert
```

Then review the added files for correctness (slot attributes, `cn()` usage, semantic tokens).
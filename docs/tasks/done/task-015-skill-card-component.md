# Task 015 - SkillCard Component

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 6: SkillCard Component

---

## Description

Create the card component for displaying skills in a grid on the skills list page.

Mirrors the pattern from `components/prompt/PromptCard.tsx` with adaptations for the Skill entity:

- Card with `CardHeader` → skill name (truncated) + date badge
- Card with `CardContent` → description snippet (first 120 chars) + tags as badges
- Card with `CardFooter` → "View" button (links to `/skills/[id]`) + "Delete" button
- `Link` from `next/link` for navigation
- Delete calls `onDelete` prop parent component handles confirmation + re-render

Uses the same card structure, truncation, and date formatting pattern as PromptCard.

---

## Acceptance Criteria

- File `components/skill/SkillCard.tsx` is created
- Has `"use client"` directive
- Exports `SkillCard` accepting props `{ skill: Skill; onDelete?: (id: string) => void }`
- Imports `Badge` from `@/components/ui/badge`
- Imports `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` from `@/components/ui/card`
- Imports `Button` from `@/components/ui/button`
- Imports `Link` from `next/link`
- CardHeader displays skill name truncated to 60 chars with `<Badge>` showing formatted date
- CardContent shows first 120 chars of `skill.description` as snippet with `line-clamp-2`
- When tags exist, renders each tag as a `Badge` element after the snippet
- CardFooter has "View" button linking to `/skills/${skill.id}` and "Delete" button
- Delete button is conditional (only rendered when `onDelete` prop is provided)
- View button uses `Button` with `render={<Link href="..."}>` pattern matching PromptCard
- Date formatting uses `toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })`
- Very long names use `truncate` class
- Snippet uses `line-clamp-2` to limit to 2 lines
- No tags rendered → hide tags section entirely (no empty badge row)

---

## Out Of Scope

- Skill editing (handled in SkillEditor, task 016)
- Delete confirmation dialog (handled on the page layer in task 018)
- Sorting/pagination (not needed for < 100 skills)
- Hover effects or animations

---

## Domain

### Skill Card

A compact card representation of a skill used in list views. Shows enough information for the user to identify and act on the skill at a glance.

Importance: The primary way users browse their skills. Needs to display name, description, date, and tags in a scannable format. The Delete button provides quick access to deletion (confirmation handled by parent).

### Tag Display

Tags appear as small badges alongside the description. They provide visual categorization and enable the filtering UI on the list page. When a skill has no tags, the tags section is completely hidden (no empty row or placeholder).
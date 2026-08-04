# Task 013 - SkillOutput Component

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 4: SkillOutput Component

---

## Description

Create the presentational component that renders a `SkillContent` object as labeled sections. This is the visual counterpart to the generated skill data, showing each section with a Badge label and appropriate content rendering.

Mirrors the pattern from `components/prompt/PromptOutput.tsx` but adapted for skill sections (NAME, DESCRIPTION, INSTRUCTIONS, TRIGGERS, TOOLS, EXPECTED_OUTPUT, RULES).

Rendering rules per section:

- **NAME**: single paragraph with regular text
- **DESCRIPTION**: single paragraph with regular text
- **INSTRUCTIONS**: paragraph with `whitespace-pre-wrap` to preserve line breaks
- **TRIGGERS**: comma-separated badges (same pattern as tools in PromptOutput)
- **TOOLS**: comma-separated badges (same pattern as PromptOutput)
- **EXPECTED_OUTPUT**: single paragraph with regular text
- **RULES**: bulleted list (same pattern as PromptOutput's RulesContent)

Uses `cn()` for class merging, `flex flex-col gap-4` for spacing (never `space-y-*`), and renders "Not specified" in muted text for empty sections.

---

## Acceptance Criteria

- File `components/skill/SkillOutput.tsx` is created
- Has `"use client"` directive
- Exports `SkillOutput` component accepting `{ content: SkillContent; className?: string }`
- Imports `cn` from `@/lib/utils`, `Badge` from `@/components/ui/badge`
- Renders each section with a `Badge` label and content area
- NAME and DESCRIPTION render as single paragraphs
- INSTRUCTIONS renders with `whitespace-pre-wrap` to preserve formatting
- TRIGGERS renders as comma-separated `Badge` elements (outline variant)
- TOOLS renders as comma-separated `Badge` elements (outline variant)
- EXPECTED_OUTPUT renders as a single paragraph
- RULES renders as a bulleted list (one `<li>` per newline-separated rule)
- Empty section content → "Not specified" in `text-muted-foreground`
- Empty `triggers`/`tools` arrays → "Not specified"
- Uses `cn()` for conditional class merging
- Uses `flex flex-col gap-4` for section spacing (never `space-y-*`)
- No external markdown rendering — plain text/HTML only (security invariant)

---

## Out Of Scope

- Editing capability (handled in SkillEditor, task 016)
- Copy-to-clipboard (handled in SkillGenerator, task 014)
- Export functionality (handled in SkillEditor, task 016)
- Markdown parsing or rendering

---

## Domain

### SkillOutput

A presentational (dumb) component that takes structured `SkillContent` and renders it as human-readable sections. It has no state, no side effects, and no user interaction — it's purely a display layer.

Importance: This is the first UI component in the skill feature. It provides the visual foundation that SkillGenerator and SkillEditor both use to display generated skill content.

### Section Rendering

Each section is rendered according to its data type: strings as paragraphs, arrays of strings as badges, and rules as bulleted lists. This matches the PromptOutput pattern exactly, ensuring visual consistency across the app.
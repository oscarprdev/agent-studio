# Task 025: Version Compare Component

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **O — Operations** /Operation 4, **S — Safeguards** (Performance)

## Objective

Create a controlled version comparison component (`VersionCompare`) that consumes two `PromptVersion` records and renders a deterministic unified line diff with additions styled green and removals styled red, using semantic color labels (not color alone for accessibility).

## Context

- **New file**: `components/prompt/VersionCompare.tsx`
- Diff computation should use the `PromptDiff` produced by `comparePromptVersions` from `versions.ts` (Task 021) — this component consumes the diff, it doesn't compute it.
- Uses existing `Sheet` components for slide-out display (or could be embedded in the editor).
- Diff is rendered as a **unified view** or **two-column side-by-side** view.
- Color alone is NOT sufficient for differentiation — use both color and labels (e.g., `+` for additions, `-` for removals).
- Includes version labels (name + timestamp) at the top.
- Handles edge cases: identical versions (show "No differences"), empty documents, selecting the same version twice.

### Component API

```ts
interface VersionCompareProps {
  left: PromptVersion;
  right: PromptVersion;
  diff: PromptDiff;            // From comparePromptVersions
  onClose?: () => void;        // Optional close for modal/sheet mode
}
```

### Diff rendering rules

| Line Type | Visual | Label |
|---|---|---|
| Added | Green background / text | `+` prefix |
| Removed | Red background / text | `-` prefix |
| Unchanged | Neutral background | No prefix or ` ` |

### UI options

The plan mentions "deterministic side-by-side or unified line diff." For MVP, implement **unified view** as it's simpler and more common. Support a toggle to switch between unified and side-by-side if time permits (but unified is sufficient for MVP).

### Performance consideration

The plan notes: "LCS is O(n×m)." Document the MVP size limit (e.g., max 5000 lines) and provide a safe fallback (show a message like "Document too large to diff") for very large documents.

## Steps

1. Create `components/prompt/VersionCompare.tsx` with `"use client"`.
2. Import `PromptDiff`, `PromptDiffLine`, `PromptVersion` from types or versions layer.
3. Display version labels/timestamps at the top (left version name, right version name).
4. Render unified diff view:
   - Iterate over `diff.lines`.
   - For each line, render with appropriate color and `+`/`-` prefix.
   - Use semantic labels (not color alone).
5. Handle edge cases:
   - Same diff input → show "No differences between these versions."
   - Empty markdown → show placeholder.
   - Very large diff (>5000 lines) → show "Document too large to display diff."
6. Add close/exit option when rendered inline (no sheet).
7. Ensure diff rendering does NOT execute or inject arbitrary HTML.
8. Use existing `cn` for class composition.

## Files

- **Create**: `components/prompt/VersionCompare.tsx`

## Acceptance Criteria

- [ ] `VersionCompare` renders a unified diff view with added (green/+), removed (red/-), and unchanged lines.
- [ ] Each line type has both a color and a label (not color alone).
- [ ] Version labels/timestamps are displayed at the top.
- [ ] Identical versions show "No differences" message.
- [ ] Empty documents do not crash the component.
- [ ] Very large diffs (>5000 lines) are handled gracefully with a fallback message.
- [ ] No `dangerouslySetInnerHTML` — all content as React text nodes.
- [ ] `npm run build` passes.

## Dependencies

- Task 019 (PromptDiff, PromptDiffLine types)
- Task 021 (comparePromptVersions function)
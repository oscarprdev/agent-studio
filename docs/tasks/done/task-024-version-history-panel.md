# Task 024: Version History Panel

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **O — Operations** /Operation 3, **S — Safeguards** (Invariants), **A — Approach** (Rendering and composition)

## Objective

Create a controlled slide-out version history panel (`VersionHistory`) using the project's `Sheet` primitive. The panel displays versions (newest-first), supports read-only inspection of a selected version, and supports triggering a restore action.

## Context

- **New file**: `components/prompt/VersionHistory.tsx`
- Reuses existing `Sheet` components: `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`.
- Reuses existing UI components: `Button`, `Badge`, `Card`, `Separator`, `Input`.
- Versions come from `versions.ts` via callback or direct store import.
- The panel is a **client component** (`"use client"`) — it triggers localStorage reads and user interaction.
- No history → show "No version history" empty state.
- Selected version display is **read-only** — no editing.
- Restoring a version updates the editor state (triggered via callback).

### Component API

```ts
interface VersionHistoryProps {
  promptId: string;
  isOpen: boolean;          // Controls sheet open/close
  onClose: () => void;     // Close handler
  onRestore: (version: PromptVersion) => void;  // Restore action
  selectedVersion?: PromptVersion | null;  // Currently inspected version
}
```

### UI structure

```
┌────────────────────────────────────────────┐
│  Sheet (slide-out, right side)              │
│  ┌─────────────────────────────────────────┐│
│  │  Version History              [Close]   ││
│  ├─────────────────────────────────────────┤│
│  │  [Select v3]  "Updated title"  Aug 6    ││  ← clickable, newest
│  │  [Select v2]  "Initial prompt" Aug 5    ││
│  │  [Select v1]  "Draft draft"    Aug 4    ││
│  ├─────────────────────────────────────────┤│
│  │  Selected Version (read-only when set)  ││
│  │  Title: "..."                           ││
│  │  Markdown preview (static)               ││
│  │  Created: Aug 6, 2026                   ││
│  │  [Restore this version]                 ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Steps

1. Create `components/prompt/VersionHistory.tsx` with `"use client"`.
2. Import `getPromptVersions` from the versions layer and `PromptVersion` type.
3. Implement the version list renderer:
   - Map over `getPromptVersions(promptId)` array.
   - Each entry shows version number badge, title, and date.
   - Clicking a version selects it for inspection.
   - Style the selected version differently (highlight/border).
4. Implement the version inspector panel (read-only):
   - When `selectedVersion` is set, show the version details (title, markdown preview, date).
   - Include a "Restore this version" button that calls `onRestore`.
5. Handle empty state: "No version history" when `getPromptVersions` returns empty.
6. Handle malformed data: catch JSON parse errors during version reads, don't crash.
7. Close the sheet after a restore action (or let `onRestore` decide).
8. Use existing `cn` for class composition.
9. Reuse `Sheet`, `Button`, `Badge`, `Card`, `Separator`, `tsa` components appropriately.

## Files

- **Create**: `components/prompt/VersionHistory.tsx`

## Acceptance Criteria

- [ ] `VersionHistory` renders as a slide-out sheet (right side) controlled by the `isOpen` prop.
- [ ] Version list displays newest-first with version number, title, and creation date.
- [ ] Clicking a version selects it for read-only inspection.
- [ ] Inspector panel shows version details (title, markdown preview, created date).
- [ ] "Restore" button in inspector calls `onRestore(version)`.
- [ ] Empty version list shows "No version history" fallback.
- [ ] Malformed/missing version data is handled gracefully (no crash).
- [ ] Sheet closes on close button or backdrop tap.
- [ ] `npm run build` passes.

## Dependencies

- Task 019 (types)
- Task 021 (version storage layer — `getPromptVersions`)
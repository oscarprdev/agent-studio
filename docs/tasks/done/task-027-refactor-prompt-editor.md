# Task 027: Refactor PromptEditor Component

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **A — Approach** (Rendering and composition), **O — Operations** /Operation 6, **S — Safeguards** (Invariants)

## Objective

Refactor `components/prompt/PromptEditor.tsx` from the basic title-only editor into a stateful orchestration component that manages markdown editing, live preview, save with versioning, keyboard shortcuts (Cmd/Ctrl+S), auto-save (30s interval), and composes the new version history, compare, and test panels.

## Context

- **Existing file**: `components/prompt/PromptEditor.tsx` (89 lines) — basic title editor with save, create-agent, create-skill buttons.
- **Must preserve**: create-agent/create-skill navigation, existing missing-prompt behavior, toast feedback patterns.
- **Must add**: markdown editing, live preview, save with versioning, keyboard shortcut, auto-save, test panel, version history panel.
- The plan says: "The existing PromptEditor.tsx should be converted rather than duplicated. It already owns prompt-level save feedback and navigation behavior; retain those behaviors."
- The editor must be a **client component** (`"use client"`) — uses localStorage, keyboard events, and timers.
- The editor receives a `Prompt` object (or `null`) and manages local draft state (title + markdown).
- The editor composes `PromptPreview`, `VersionHistory`, `VersionCompare`, and `TestPanel`.

### Editor state model

```ts
// Internal state (not persisted until save)
- draftTitle: string
- draftMarkdown: string
- isSaving: boolean
- versionCount: number  // from stored versions
- selectedVersion: PromptVersion | null  // for comparison
```

### Save behavior

1. Validate prompt exists and has an ID.
2. Parse markdown → `PromptSections` (using serialization from Task 020).
3. Update prompt via `store.update(id, { title: draftTitle, content: parsedSections })`.
4. Save version via `savePromptVersion(...)` from `versions.ts`.
5. Show success/error toast.
6. Refresh local version count.
7. **Skip version creation** if title, content, and markdown are unchanged from the latest version.

### Keyboard shortcut

- Register `keydown` listener for `Meta+S` (macOS) or `Ctrl+S` (other).
- Call `preventDefault()` to avoid browser navigation.
- Invoke the same save handler as the button click.
- Clean up listener on unmount.

### Auto-save

- Install a 30-second interval via `useEffect` when the editor is mounted.
- Perform no work when draft is unchanged.
- Clear interval on unmount.

### Composition

```
┌─────────────────────────────────────────────────────────────┐
│  PromptEditor                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Title: [Input]              [Save] [Test] [History]    ││  ← top bar
│  ├──────────────────────┬──────────────────────────────────┤│
│  │  Editor (textarea)   │  Preview (PromptPreview)         ││  ← split pane
│  │                      │                                  ││
│  │  [Draft markdown]    │  ## ROLE                         ││
│  │                      │  ## OBJECTIVE                    ││
│  │                      │  ...                             ││
│  ├──────────────────────┴──────────────────────────────────┤│
│  │  [Save Changes] [Create Agent] [Create Skill] [Back]    ││  ← bottom bar
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  [VersionHistory sheet]  [TestPanel sheet]  [VersionCompare]  │  ← overlays
└─────────────────────────────────────────────────────────────┘
```

## Steps

1. Open `components/prompt/PromptEditor.tsx`.
2. Add `"use client"` directive (already present).
3. Import new dependencies:
   - `PromptPreview` from `./PromptPreview`
   - `VersionHistory` from `./VersionHistory`
   - `VersionCompare` from `./VersionCompare`
   - `TestPanel` from `./TestPanel`
   - `getPromptVersions`, `savePromptVersion`, `comparePromptVersions` from `@/lib/prompts/store` (or `versions.ts`)
   - `sectionsToMarkdown` from `@/lib/prompts/serialize`
   - `useEffect`, `useState`, `useRef`, `useCallback` from React.
4. Add local state for:
   - `draftTitle` (initialized from `prompt.title`)
   - `draftMarkdown` (initialized by serializing `prompt.content` via `sectionsToMarkdown`)
   - `versions` (loaded via `getPromptVersions(promptId)`)
   - `isSaving` (optimistic save state)
   - `showHistory` (boolean, controls VersionHistory sheet)
   - `showTest` (boolean, controls TestPanel sheet)
   - `compareLeft` / `compareRight` (for VersionCompare)
5. Implement `handleSave()`:
   - Parse markdown → sections using `sectionsToMarkdown`.
   - Update prompt via `store.update`.
   - Save version via `savePromptVersion`.
   - Refresh version list.
   - Show toast for success/failure.
   - Skip version if unchanged from latest.
6. Implement `handleRestore(version)`:
   - Load version content.
   - Update `draftTitle` and `draftMarkdown` from version.
   - Save as new version (restore creates snapshot).
   - Show toast.
7. Implement keyboard shortcut:
   - `useEffect` with `keydown` listener for `Meta+S` / `Ctrl+S`.
   - `preventDefault()` on match.
   - Cleanup on unmount.
8. Implement auto-save:
   - `useEffect` with `setInterval(30000)` — calls save handler if draft changed.
   - Use `useRef` or stable callback to access latest draft.
   - Cleanup interval on unmount.
9. Compose the UI:
   - Top bar: title input, Save button, Test button, History button.
   - Split pane: markdown textarea on left, `PromptPreview` on right.
   - Bottom bar: Save Changes, Create Agent, Create Skill, Back to List.
10. Wire up version history:
    - Click History button → open `VersionHistory` sheet.
    - `onClose` → close sheet.
    - `onRestore` → handled by this component.
11. Wire up test panel:
    - Click Test button → open `TestPanel` sheet.
    - Pass `draftMarkdown` as current content.
12. Wire up version compare:
    - Select two versions in history → open `VersionCompare` inline or in sheet.
13. Preserve existing behavior:
    - Create agent/skill navigation (same URL patterns).
    - Missing prompt state → "Prompt not found" with back link.
    - Toast feedback on save.

## Files

- **Modify**: `components/prompt/PromptEditor.tsx`

## Acceptance Criteria

- [ ] PromptEditor renders a split-pane layout: markdown textarea on left, live preview on right.
- [ ] Title input reflects and updates the prompt title.
- [ ] Markdown content is initialized by serializing the prompt's `PromptSections`.
- [ ] Save updates the canonical prompt (title + parsed sections) AND creates a version snapshot.
- [ ] Save shows success/failure toast.
- [ ] Cmd/Ctrl+S keyboard shortcut triggers save without browser navigation.
- [ ] Keyboard listener is cleaned up on unmount.
- [ ] Auto-save runs every 30 seconds, performs no work when draft is unchanged, and clears on unmount.
- [ ] Version history panel opens/closes correctly and shows versions newest-first.
- [ ] Test panel opens/closes and displays mock results.
- [ ] Create agent and create skill navigation URLs are preserved.
- [ ] Missing prompt state shows "Prompt not found" with back link.
- [ ] Unsaved draft is never silently overwritten (restore requires explicit action).
- [ ] `npm run build` passes.

## Dependencies

- Task 020 (serialization)
- Task 021 (version storage)
- Task 023 (PromptPreview)
- Task 024 (VersionHistory)
- Task 025 (VersionCompare)
- Task 026 (TestPanel)
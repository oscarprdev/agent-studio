# Task 029: Prompt Detail Page Integration

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **O — Operations** /Operation 6 (point 8), **S — Structure** (Files to modify)

## Objective

Add an Edit navigation link and a version indicator to the existing prompt detail page at `(dashboard)/prompts/[id]/page.tsx`. The version indicator shows the latest version number or an empty-history fallback.

## Context

- **Existing file**: `app/(dashboard)/prompts/[id]/page.tsx` (40 lines) — already renders `PromptEditor` inline within the dashboard layout.
- The existing detail page shows the prompt and embeds `PromptEditor` with the loaded prompt.
- We need to:
  1. Add an "Edit" button/link that navigates to `/prompts/{id}/editor`.
  2. Display a version indicator (e.g., "v3" badge) derived from the stored version history.
  3. Show "No version history" fallback when no versions exist.
  4. Keep the existing `PromptEditor` behavior intact (it will be replaced by the route page in the final workflow, but this task is about integration).

### Implementation approach

The detail page currently embeds `PromptEditor` inline. For the MVP integration:
- The detail page shows the version indicator AND an Edit link pointing to the editor route.
- The `PromptEditor` component is still rendered (preserving existing behavior).
- The version indicator is read from `getPromptVersions(promptId)` from the versions layer.

### Version indicator display

```
┌────────────────────────────────────────────┐
│  Prompt Title                [v3] [Edit →] │  ← TopBar area
└────────────────────────────────────────────┘
```

The version indicator should use an existing `Badge` component. When no versions exist, show nothing or "No versions".

## Steps

1. Open `app/(dashboard)/prompts/[id]/page.tsx`.
2. Import `getPromptVersions` from the versions layer (either `@/lib/prompts/store` or `@/lib/prompts/versions`).
3. Import `Badge` from `@/components/ui/badge`.
4. Import `Link` from `next/link`.
5. Load versions in the component state:
   ```ts
   const versions = getPromptVersions(params.id);
   const latestVersion = versions.length > 0 ? versions[0] : null;
   ```
6. Render a version indicator badge in the page:
   - Show `Badge` with version number (e.g., "3" or "v3") when versions exist.
   - Show nothing (or hide the indicator) when no versions exist.
7. Add an "Edit" button/link:
   - Links to `/prompts/${params.id}/editor`.
   - Uses existing `Button` component or plain `Link` styled consistently.
   - Place the Edit link near the title or in the top bar area.
8. Keep the existing `PromptEditor` embedded (do not replace it — the detail page continues to work).
9. Handle missing prompt: existing behavior should be preserved (PromptEditor handles the null case).

## Files

- **Modify**: `app/(dashboard)/prompts/[id]/page.tsx`

## Acceptance Criteria

- [ ] Prompt detail page loads and displays properly without breaking existing behavior.
- [ ] Version indicator badge appears when version history exists (shows latest version number).
- [ ] Version indicator is absent or shows "No versions" when no history exists.
- [ ] Edit link navigates to `/prompts/{id}/editor` correctly.
- [ ] Edit link styling is consistent with existing UI (Button or Link).
- [ ] No TypeScript errors or lint warnings.
- [ ] `npm run build` passes.

## Dependencies

- Task 021 (version storage layer — `getPromptVersions`)
- Task 027 (refactored PromptEditor — detail page must still work with the updated editor)
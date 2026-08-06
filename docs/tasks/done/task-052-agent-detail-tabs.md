# Task 052 — Agent Detail Tabs Layout

## Reference

Plan document: `docs/plans/plan-013-agent-detail-view.md`

Relevant sections:
- Acceptance Criteria: "Detail view uses tabbed layout: Overview, Configuration, Skills, Tools"
- Scope In: "Detail view uses Overview, Configuration, Skills, and Tools tabs"
- Structure: "Add local/shadcn Tabs primitive", "Create `components/ui/tabs.tsx`"
- Norms: "use existing base-nova shadcn composition"

---

## Description

Add a tabbed layout to the agent detail page with four panels: **Overview**, **Configuration**, **Skills**, and **Tools**.

The current `App/(dashboard)/agents/[id]/page.tsx` renders `<AgentEditor>` as a full-page monolithic component with edit/preview toggle. This task replaces that structure with:

1. **A shadcn Tabs primitive** (needs to be added since `components/ui/tabs.tsx` does not exist in the project)
2. **A page-level wrapper** (`AgentDetailTabs.tsx`) that wires a shared draft state to all four tab panels
3. **Four tab panel components** that each own their tab content area
4. **A shared action bar** for Save, Duplicate, Delete, Export Markdown, Export JSON, and Test actions

The page continues to load the agent with `getById()` from `@/lib/agents/store`, passes it to the tabs wrapper, and handles the not-found route.

---

## Acceptance Criteria

- `components/ui/tabs.tsx` is added (shadcn Tabs component) following the project's existing shadcn pattern found in `components/ui/button.tsx`, `components/ui/card.tsx`, etc.
- Agent detail page at `app/(dashboard)/agents/[id]/page.tsx` renders four tabs: Overview, Configuration, Skills, Tools
- Each tab panel renders its content area correctly when active
- The shadcn Tabs component uses keyboard navigation (arrow keys between tabs) and visible selected state
- `npm run lint` passes
- No existing functionality is lost — the page still loads the agent and shows not-found for unknown IDs

---

## Out of Scope

- Tab content implementation (handled in tasks 053–056)
- Action buttons (handled in task 057)
- Data persistence (handled in each tab task)
- Responsive mobile tab switcher (leave as default horizontal tabs)

---

## Domain

### Tabbed Agent Detail Workspace

The detail page is the primary workspace for saved-agent lifecycle management. Tabbing organizes the four logical domains (metadata, config, skills, tools) that all relate to a single `Agent` record but are independently scoped.

The shadcn Tabs primitive provides keyboard accessibility, ARIA roles, and visual selected state out of the box.

---

## Files

| Action | Path |
|--------|------|
| Create | `components/ui/tabs.tsx` (shadcn Tabs component) |
| Modify | `app/(dashboard)/agents/[id]/page.tsx` (tab wrapper in page) |

---

## Implementation Notes

### Adding the shadcn Tabs component

The project has shadcn/ui installed (see `components/ui/button.tsx` for the existing pattern). Check the project's `components.json` for the configured style (base-nova).

Since `components/ui/tabs.tsx` does not exist, create it matching the pattern of other existing shadcn primitives:

- Follow the shadcn/ui Tabs component structure (TabList, TabTrigger, TabContent, TabContent)
- Use shadcn's `cn()` utility from `@/lib/utils`
- Use existing shadcn patterns from `components/ui/button.tsx` for imports and component structure

### Page structure after this task

The page should delegate to a `AgentDetailTabs` component that owns:

```
AgentDetailPage (page.tsx)
  └── AgentDetailTabs (new component, stubbed with placeholder content)
        └── TabsRoot (shadcn)
              ├── Tab 1: Overview (placeholder)
              ├── Tab 2: Configuration (placeholder)
              ├── Tab 3: Skills (placeholder)
              └── Tab 4: Tools (placeholder)
```

Each tab panel placeholder just shows a heading like "Overview Tab — coming in task 053" so the tab switching is visually verifiable.

### Shared draft state

The page should pass the loaded `agent` to the tabs wrapper and receive a simple `onStateChange` callback for future draft sync. For now, draft state can be a placeholder in the wrapper.

### Accessibility

- Tabs must be keyboard navigable (arrow keys)
- `role="tablist"`, `role="tab"`, `role="tabpanel"` must be correct (shadcn provides this)
- Tab panel must have `hidden` attribute when inactive
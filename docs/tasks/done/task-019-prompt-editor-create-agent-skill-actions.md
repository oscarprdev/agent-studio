# Task 019 - PromptEditor: Add Create Agent / Create Skill Action Buttons

## Reference

Plan document:

[docs/plans/plan-019-create-agent-create-skill-actions.md](../../plans/plan-019-create-agent-create-skill-actions.md)

Relevant section:

Operation 2 — Add PromptEditor creation actions

---

## Description

Add **Create Agent** and **Create Skill** buttons to the `PromptEditor` component's action bar. Since the PromptEditor is rendered on the prompt detail page (where the prompt is already saved), navigation uses `promptId` exclusively.

---

## Acceptance Criteria

- Two new `Button` elements ("Create Agent", "Create Skill") appear in the action bar when a valid `prompt` is loaded.
- "Create Agent" navigates to `/agents/new?promptId=<prompt.id>`.
- "Create Skill" navigates to `/skills/new?promptId=<prompt.id>`.
- The existing "Save Changes" and "Back to List" buttons remain unchanged.
- The not-found state (when `prompt` is `null`) shows only "Back to List" — no creation actions.
- Clicking a creation action navigates immediately without altering the existing UI or state.

---

## Implementation Details

### File: `components/prompt/PromptEditor.tsx`

1. **Add `useRouter` import:**

   ```ts
   import { useRouter } from "next/navigation"
   ```

2. **Add `router` in component:**

   ```ts
   const router = useRouter()
   ```

3. **Add two navigation handlers** in the component:

   ```ts
   function handleCreateAgent() {
     if (!prompt) return
     router.push(`/agents/new?promptId=${prompt.id}`)
   }

   function handleCreateSkill() {
     if (!prompt) return
     router.push(`/skills/new?promptId=${prompt.id}`)
   }
   ```

4. **Add buttons in the action row** (after "Save Changes"):

   ```tsx
   <div className="flex flex-col gap-3 sm:flex-row">
     <Button onClick={handleSave}>Save Changes</Button>
     <Button variant="outline" onClick={handleCreateAgent}>Create Agent</Button>
     <Button variant="outline" onClick={handleCreateSkill}>Create Skill</Button>
     <Button variant="outline" render={<Link href="/prompts" />} nativeButton={false}>
       Back to List
     </Button>
   </div>
   ```

   The not-found state block (`!prompt`) remains unchanged — only the existing "Back to List" button renders there.

### Shadcn Rules Applied

- Buttons use `variant="outline"` for secondary actions.
- Action row uses `flex` with `gap-3`, not `space-*`.
- Layout is responsive: `flex-col` on mobile, `sm:flex-row` on wider screens.

---

## Dependencies

- Task 018 (PromptGenerator) — not a hard dependency (both are independent), but Task 019 is typically reviewed together with Task 018.

---

## Verification

1. Run `npm run build` — must complete with exit code 0.
2. Run `npm run lint` — must complete with exit code 0.
3. Manual: Open a stored prompt detail page → see "Create Agent" and "Create Skill" beside "Save Changes" and "Back to List".
4. Manual: Click "Create Agent" → verify URL is `/agents/new?promptId=<id>`.
5. Manual: Click "Create Skill" → verify URL is `/skills/new?promptId=<id>`.
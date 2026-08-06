# Task 022 - Dashboard: Real Skill and Prompt Counts

## Reference

Plan document:

[docs/plans/plan-019-create-agent-create-skill-actions.md](../../plans/plan-019-create-agent-create-skill-actions.md)

Relevant section:

Operation 5 — Wire dashboard counts to stores

---

## Description

Replace the hardcoded `count: 0` placeholders for the **Skills** and **Prompts** stat cards on the dashboard with real counts read from their respective existing stores via `getAll().length`. The **Agents** count already works correctly using the same pattern.

---

## Acceptance Criteria

- The `baseStats` array is restructured so all three cards (Agents, Skills, Prompts) derive their counts from `getAll().length` in the same lazy `useState` initializer that already handles Agents.
- Skills count is read from `@/lib/skills/store`.
- Prompts count is read from `@/lib/prompts/store`.
- When no records exist, all three cards show `0`.
- After creating/deleting records through existing flows, the dashboard reflects the correct counts on reload.
- Cards, links, labels, responsive layout, and quick actions remain unchanged.
- The existing lazy `useState(() => …)` pattern is preserved (no re-fetch dependency, single initial calculation).

---

## Implementation Details

### File: `app/(dashboard)/dashboard/page.tsx`

1. **Add imports** for the two new stores:

   ```ts
   import { getAll } from "@/lib/skills/store"
   import { getAll as getPrompts } from "@/lib/prompts/store"
   ```

   The `getAll` from `agents/store` is already imported. Use `getPrompts` as an alias to avoid the collision.

2. **Restructure the stats calculation** to derive all three counts from their stores:

   The current code:
   ```ts
   const baseStats = [
     { label: "Agents", icon: Bot, href: "/agents" },
     { label: "Skills", count: 0, icon: Wrench, href: "/skills" },
     { label: "Prompts", count: 0, icon: MessageSquare, href: "/prompts" },
   ]

   const [stats] = useState(() =>
     baseStats.map((s) =>
       s.label === "Agents" ? { ...s, count: getAll().length } : s
     )
   )
   ```

   Should be refactored to:
   ```ts
   import { getAll } from "@/lib/agents/store"
   import { getAll as getAllSkills } from "@/lib/skills/store"
   import { getAll as getAllPrompts } from "@/lib/prompts/store"
   ```

   Replace the `baseStats` definition with a computed array that already has counts:

   ```ts
   const baseStats = [
     { label: "Agents", icon: Bot, href: "/agents" },
     { label: "Skills", icon: Wrench, href: "/skills" },
     { label: "Prompts", icon: MessageSquare, href: "/prompts" },
   ]

   const [stats] = useState(() =>
     baseStats.map((s) => {
       if (s.label === "Agents") return { ...s, count: getAll().length }
       if (s.label === "Skills") return { ...s, count: getAllSkills().length }
       if (s.label === "Prompts") return { ...s, count: getAllPrompts().length }
       return s
     })
   )
   ```

   Alternatively, remove `count: 0` from `baseStats` and always derive in the map call.

3. No changes to the rendering of `stats.map((stat) => …)` — the shape is unchanged.

---

## Out Of Scope

- Any new caching layer, debouncing, or background refresh of counts.
- Count update without page reload (not in scope — counts are computed on mount).
- Adding a count badge or indicator.
- Any store modifications.

---

## Verification

1. Run `npm run build` — must complete with exit code 0.
2. Run `npm run lint` — must complete with exit code 0.
3. Manual: Open dashboard with no agents, skills, or prompts → all three cards show `0`.
4. Manual: Create a prompt through `/prompts/new` → reload dashboard → Prompts card shows `1`.
5. Manual: Create a skill through `/skills/new` → reload dashboard → Skills card shows `1`.
6. Manual: Create an agent through `/agents/new` → reload dashboard → Agents card shows `1`.
7. Manual: Delete a prompt from `/prompts` → reload dashboard → Prompts card shows `0`.
8. Manual: Verify localStorage keys: `agentstudio:agents`, `agentstudio:skills`, `agentstudio:prompts` contain expected data.

---

## Mermaid Graph

No user flow or state transitions — this task only wires display counts to existing store data.
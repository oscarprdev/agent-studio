# Task 018 - PromptGenerator: Add Create Agent / Create Skill Action Buttons

## Reference

Plan document:

[docs/plans/plan-019-create-agent-create-skill-actions.md](../../plans/plan-019-create-agent-create-skill-actions.md)

Relevant section:

Operation 1 — Add PromptGenerator creation actions

---

## Description

Extend the `PromptGenerator` component's post-generation action row from two buttons (Copy, Save Prompt) to four by adding **Create Agent** and **Create Skill** buttons.

These buttons navigate to `/agents/new` and `/skills/new` with URL parameters that carry the generated prompt data:

- **Saved prompt**: use `?promptId={id}` after `store.create()` returns.
- **Unsaved prompt**: use `?promptContent={encodedFormattedText}` where the text is the same canonical formatting the Copy button already produces.

A canonical formatter function must be extracted so that Copy and the navigation actions use identical output.

---

## Acceptance Criteria

- A private helper function `formatPrompt(sections: PromptSections): string` is defined and used by both `handleCopy` and the new action handlers.
- Two new `Button` elements ("Create Agent", "Create Skill") appear in the same action row (after Copy and Save Prompt) when `result` is non-null.
- "Create Agent" navigates to `/agents/new?promptContent=<encoded>` when the prompt has not been saved yet, and to `/agents/new?promptId=<id>` after `handleSave` has created a prompt.
- "Create Skill" navigates to `/skills/new?promptContent=<encoded>` when the prompt has not been saved yet, and to `/skills/new?promptId=<id>` after `handleSave` has created a prompt.
- Query string values are encoded with `encodeURIComponent` (or `URLSearchParams`) so that spaces, ampersands, newlines, and other special characters survive the round trip.
- The action row with all four buttons is hidden when `result` is `null`.
- Copy, Save Prompt, toast notifications, and existing router behavior remain unchanged.
- Repeated clicks during generation or navigation are prevented (existing `isGenerating` guard is sufficient).
- The `onGenerate` callback signature is unchanged.

---

## Implementation Details

### File: `components/prompt/PromptGenerator.tsx`

1. **Extract a canonical formatter** (private function):

   ```ts
   function formatPrompt(sections: PromptSections): string {
     return [
       `ROLE\n${sections.role}`,
       `\nOBJECTIVE\n${sections.objective}`,
       `\nTOOLS\n${sections.tools.join(", ")}`,
       `\nWORKFLOW\n${sections.workflow.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
       `\nRULES\n${sections.rules}`,
       `\nOUTPUT\n${sections.output}`,
     ].join("\n")
   }
   ```

2. **Refactor `handleCopy`** to use `formatPrompt`:

   ```ts
   async function handleCopy() {
     if (!result) return
     try {
       await navigator.clipboard.writeText(formatPrompt(result))
       toast.add({ title: "Copied to clipboard", type: "success" })
     } catch {
       toast.add({ title: "Failed to copy", type: "error" })
     }
   }
   ```

3. **Add state for a saved prompt ID** (optional but needed for `promptId` flow):

   ```ts
   const [savedPromptId, setSavedPromptId] = useState<string | null>(null)
   ```

4. **Refactor `handleSave`** to capture the returned prompt's ID:

   ```ts
   function handleSave() {
     if (!result) return
     try {
       const title = trimmedInput.slice(0, 60)
       const prompt = store.create({ title, input: trimmedInput, content: result })
       setSavedPromptId(prompt.id)
       toast.add({ title: "Prompt saved", type: "success" })
       onGenerate?.(prompt)
       router.push("/prompts")
     } catch {
       toast.add({ title: "Failed to save", type: "error" })
     }
   }
   ```

5. **Add navigation handlers** for the two new actions:

   ```ts
   function navigateToBuilder(path: string) {
     if (!result) return
     const encoded = formatPrompt(result)
     const params = new URLSearchParams()
     if (savedPromptId) {
       params.set("promptId", savedPromptId)
     } else {
       params.set("promptContent", encoded)
     }
     router.push(`${path}?${params.toString()}`)
   }
   ```

6. **Add buttons** in the action row:

   ```tsx
   <div className="flex flex-col gap-3 sm:flex-row">
     <Button variant="outline" onClick={handleCopy}>Copy</Button>
     <Button onClick={handleSave}>Save Prompt</Button>
     <Button variant="outline" onClick={() => navigateToBuilder("/agents/new")}>Create Agent</Button>
     <Button variant="outline" onClick={() => navigateToBuilder("/skills/new")}>Create Skill</Button>
   </div>
   ```

### Shadcn Rules Applied

- All buttons use existing `Button` primitive with `variant="outline"` for secondary actions.
- Action row uses `flex` with `gap-3`, not `space-*`.
- Layout is responsive: `flex-col` on mobile, `sm:flex-row` on wider screens.

---

## Dependencies

None. This task only modifies `PromptGenerator.tsx`.

---

## Verification

1. Run `npm run build` — must complete with exit code 0.
2. Run `npm run lint` — must complete with exit code 0.
3. Manual: Generate a prompt → see four buttons → click "Create Agent" → verify URL contains `promptContent=<encoded>`.
4. Manual: Generate a prompt → click "Save Prompt" → generate again → click "Create Agent" → verify URL contains `promptId=<id>`.
5. Manual: Test with prompt input containing `&`, `?`, newlines — verify they survive the round trip.
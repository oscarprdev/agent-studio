# Task 003 — Mock AI Agent Generator

## Reference

Plan document:

docs/plans/plan-AGE-3-agent-builder-wizard.md

Relevant section:

Operation 2: GenerateAgent

---

## Description

Implement the mock AI generation function that transforms wizard input into a complete agent definition. This is a deterministic, template-based generator with keyword extraction and an artificial delay for realistic UX.

The function simulates what a real AI API would do: parse the goal, extract keywords, and build a structured agent with name, description, model, system prompt, tools, and skills. The interface signature matches what a real provider would use, making a future API swap trivial.

---

## Acceptance Criteria

- `lib/ai/generate-agent.ts` exists
- Exports an async function `generateAgent(input: { goal: string; tools: Tool[]; skills: Skill[]; context: string }): Promise<AgentDefinition>`
- Function is pure / deterministic given the same input
- Returns a complete `AgentDefinition` with all fields populated (never partial)
- Has an artificial delay of 1200ms using `await new Promise(r => setTimeout(r, 1200))`
- Handles empty goal → returns generic agent with "Describe your agent's purpose" placeholder
- Handles very long goals → truncates input to first 500 characters before processing
- Name: extracts role-related words from goal + "Agent" (e.g., "Code Review Agent"), default "Agent" if no role word found
- Description: first 100 chars of goal, cleaned up, or generic on empty input
- Model: defaults to "claude-sonnet-4-20250514" unless goal mentions a specific model (e.g., "gpt-4")
- System Prompt: generates a structured prompt with ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES sections
- Skills: uses provided skills; if none provided, generates default skills based on goal keywords
- Tools: uses provided tools from input
- Imports and uses types from `@/lib/agents/types`
- Includes JSDoc comment explaining the mock behavior and that this is a placeholder for a real AI provider
- `system_prompt` is never empty after generation

---

## Out Of Scope

- Real API integration (OpenAI, Anthropic, etc.)
- Streaming responses
- Caching of generation results
- Error handling beyond input sanitization

---

## Domain

### Mock AI Generation

A deterministic function that mimics the structure of real AI-powered agent generation without requiring an external API.

Importance:

Enables the wizard step 5 to work end-to-end with realistic output, validating the full UX before real AI is connected. The signature matches what a real provider would use.

### Keyword Extraction

Simple regex/split approach for identifying role words, models, and keywords from the goal text.

Importance:

Transforms vague user descriptions into a meaningful agent name and description that reflects intent.

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/ai/generate-agent.ts` (creates `lib/ai/` dir) |
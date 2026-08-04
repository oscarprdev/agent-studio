# Task 003 — Mock AI Prompt Generator

## Reference

Plan document:

docs/plans/plan-AGE-2-ai-prompt-generator.md

Relevant section:

Operation 2: GeneratePrompt

---

## Description

Implement the mock AI function that transforms a natural-language description into a structured `PromptSections` object. This is a deterministic, template-based generator with keyword extraction and an artificial delay for realistic UX.

The function simulates what a real AI API would do: parse the description, extract relevant keywords, and build a professionally structured prompt. The interface signature matches what a real provider would use, making a future swap trivial.

---

## Acceptance Criteria

- `lib/ai/generate-prompt.ts` exists and exports an async function `generatePrompt(description: string): Promise<PromptSections>`
- Function is pure / deterministic given the same input (same description → same output across calls)
- Returns a complete `PromptSections` with all six sections populated (never partial)
- Has an artificial delay of 800ms using `await new Promise(r => setTimeout(r, 800))`
- Handles empty string → returns a generic prompt with "Describe your needs" placeholder
- Handles very long descriptions → truncates input to first 500 characters before processing
- ROLE section: if description contains a role word (engineer, reviewer, analyst, developer, designer, tester, manager), uses it; otherwise defaults to "Senior Software Engineer"
- TOOLS section: scans for known tool keywords (GitHub, Linear, Slack, Jira, Notion, Figma) and returns them as array; if none found, defaults to a generic list
- WORKFLOW section: generates 3-5 numbered steps based on description context
- OUTPUT section: defaults to "Markdown report" unless description mentions a specific output format
- Imports and uses types from `@/lib/prompts/types`
- Includes JSDoc comment explaining the mock behavior and that this is a placeholder for a real AI provider

---

## Out Of Scope

- Real API integration (OpenAI, Anthropic, etc.)
- Streaming responses
- Caching or deduplication of calls
- Error boundaries — the function is safe by design (always returns complete sections)
- Any React components or hooks

---

## Domain

### Mock AI Generation

A deterministic function that mimics the structure of real AI prompt generation without requiring an external API.

Importance:

Provides the core value proposition — converting natural language into structured prompts. The mock is a fully functional stand-in that validates UI/UX before real AI is connected.

### Keyword Extraction

Simple regex/split approach for identifying role words, tools, and output formats from raw text.

Importance:

The first step in transforming vague user descriptions into useful structured content.

---

## Files

| Action | Path |
|--------|------|
| Create | `lib/ai/generate-prompt.ts` (creates `lib/ai/` dir) |
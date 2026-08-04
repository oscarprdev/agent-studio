# Task 012 - Mock Skill Generator

## Reference

Plan document:

docs/plans/plan-AGE-12-skill-generator.md

Relevant section:

Operation 3: GenerateSkill

---

## Description

Create the mock AI skill generator at `lib/ai/generate-skill.ts`.

This mirrors the interface and pattern of the existing `lib/ai/generate-prompt.ts` mock. Given a natural-language description, it returns a deterministic, template-based `SkillContent` structuturing the user's request into proper sections.

Key behaviors:

1. Accepts a `{ description: string }` input
2. Returns `Promise<SkillContent>` (async)
3. Parses description to extract keywords (simple regex/split, same approach as generate-prompt)
4. Maps keywords to structured sections using template logic
5. Adds 800ms artificial delay for realistic UX
6. Always returns a complete `SkillContent` (never partial)

Mock template logic:

- **NAME**: Derive from description — capitalize first meaningful words, truncate to 60 chars
- **DESCRIPTION**: First sentence or first 100 chars of description
- **INSTRUCTIONS**: 3-5 step instructions based on context keywords
- **TRIGGERS**: Extract trigger phrases from description context
- **TOOLS**: Scan for tool keywords (GitHub, Linear, Slack, etc.) using the same TOOL_KEYWORDS map as `generate-prompt.ts`
- **EXPECTED_OUTPUT**: Default to "Markdown report" unless context suggests otherwise
- **RULES**: Default set of 2-3 professional rules

Edge cases:

- Empty description → returns a generic skill with "Describe your needs" placeholder content
- Very long description → truncated to first 500 chars for processing (same as generate-prompt)
- Unknown tools → falls back to generic tool list ["GitHub", "VS Code", "Terminal"]

---

## Acceptance Criteria

- File `lib/ai/generate-skill.ts` is created
- Exports an async `generateSkill(input: { description: string }): Promise<SkillContent>` function
- Includes 800ms artificial delay via `setTimeout`
- Parses the description to extract keywords (simple split/regex), same approach as `generate-prompt.ts`
- Maps keywords to structured sections: name, description, instructions, triggers, tools, expectedOutput, rules
- NAME is derived from description and truncated to 60 chars
- DESCRIPTION is the first 100 chars or first sentence
- INSTRUCTIONS contains 3-5 steps based on context keywords
- TRIGGERS extracts relevant trigger phrases from description
- TOOLS scans for known tool keywords (`TOOL_KEYWORDS` map), falls back to default list
- EMPTY_DESCRIPTION returns a generic complete `SkillContent` with "Describe your needs" placeholder
- LONG_DESCRIPTION truncates to 500 chars before processing
- ALWAYS returns a complete `SkillContent` (never null, never partial)
- Import types from `lib/skills/types.ts`
- JSDoc explaining this is a deterministic, template-based mock stand-in for real AI

---

## Out Of Scope

- Real AI API integration (stays mock-only)
- Streaming or progressive output
- Context-aware or LLM-based generation
- User preferences or history for generation quality

---

## Domain

### Mock Generation

The mock generator is a deterministic, template-based system that transforms natural language input into structured skill content. It's designed to be a realistic stand-in for a real AI provider — same interface, different internals.

Importance: Allows building and testing the full UI flow before AI APIs are available. Later, swapping in a real provider is a single-file change (same function signature).

### Template Logic

Keyword extraction maps user language to skill sections. For example, if the description mentions "code review" the trigger becomes "when reviewing code" and the instructions reference reviewing patterns. This makes the output feel purposeful, even though it's template-based.

### Tool Keyword Mapping

Uses the same `TOOL_KEYWORDS` map as `generate-prompt.ts` — this ensures consistency across feature areas and reduces duplication. Tools like GitHub, Linear, Slack, etc. are recognized in user descriptions and surfaced as required tools.
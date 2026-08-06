# Task 023: Markdown Preview Component

## Reference

Plan: `docs/plans/plan-age-16-prompt-editor.md` — Section **E — Entities**, **A — Approach** (Rendering and composition), **O — Operations**

## Objective

Create a safe, allowlisted markdown-to-React preview component (`PromptPreview`) that renders editor markdown content on the client. The preview must support basic markdown syntax (headings, paragraphs, lists, emphasis, code, line breaks) without passing raw HTML to `dangerouslySetInnerHTML`.

## Context

- **New file**: `components/prompt/PromptPreview.tsx`
- The preview renders the raw markdown string (the "draft" or version content).
- Must NOT pass raw user-authored markdown to `dangerouslySetInnerHTML` — use an allowlisted renderer approach.
- The plan specifies: "small, allowlisted markdown-to-React/HTML renderer for headings, paragraphs, unordered/ordered lists, emphasis, code spans/fences, and line breaks."
- Use existing `cn` from `lib/utils.ts` for class composition.
- Must handle empty content and unsupported-syntax states gracefully.
- This is a **client component** (`"use client"`) — the editor page is client-side, so this component will be rendered in a client context. However, since the preview is pure rendering with no browser APIs, it COULD be a server component. But the plan says "keep browser-only... in client components." The preview itself has no browser dependencies, so either approach works. The plan says the preview is for the editor — which is a client component — so we'll mark it `"use client"` for consistency.

### Allowed syntax

| Markdown | HTML | Notes |
|---|---|---|
| `# Heading` / `## Heading` | `<h1>`, `<h2>` | H1 for `#`, H2 for `##` only |
| **bold** / *italic* | `<strong>`, `<em>` | Standard emphasis |
| `- item` / `1. item` | `<ul>/<ol>`, `<li>` | List items |
| `code` | `<code>` | Inline code |
| ``` `code block` ``` | `<pre><code>` | Code fences |
| Blank line | `<br>` / paragraph break | Line breaks |

### Text escaping

All text content must be text-nodes (never interpolated as HTML). Use React's normal JSX rendering: `<h2>{text}</h2>` not `dangerouslySetInnerHTML`.

## Steps

1. Create `components/prompt/PromptPreview.tsx`.
2. Implement a `parseMarkdown(markdown: string): React.ReactNode[]` function.
   - Split on section headings (`## SECTION`).
   - Convert `#`/`##` to `<h1>`/`<h2>`.
   - Convert `- ` and `* ` list markers to `<ul>/<li>`.
   - Convert `1. `, `2. ` to `<ol>/<li>`.
   - Convert `` `code` `` to `<code>`.
   - Convert `**bold**` to `<strong>`, `*italic*` to `<em>`.
   - All text is rendered as React text nodes (no `dangerouslySetInnerHTML`).
3. Export `PromptPreview({ content, className })` component.
   - Renders the parsed markdown tree.
   - Shows a placeholder ("No preview") when content is empty.
   - Accepts `className` for layout integration.
4. Ensure the component handles `null`/`undefined` input gracefully.

## Files

- **Create**: `components/prompt/PromptPreview.tsx`

## Acceptance Criteria

- [ ] `PromptPreview` renders headings, paragraphs, lists, emphasis, inline code, and code blocks from markdown source.
- [ ] No `dangerouslySetInnerHTML` usage — all content as React text nodes.
- [ ] `PromptPreview` shows a fallback placeholder for empty/null content.
- [ ] Renders correctly within the editor's split-pane layout.
- [ ] `npm run build` passes.

## Dependencies

None (pure presentation component)
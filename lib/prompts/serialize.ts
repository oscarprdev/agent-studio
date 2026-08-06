import type { PromptSectionKey, PromptSections } from "./types";

// Known section headings in fixed display order
const KNOWN_KEYS: PromptSectionKey[] = [
  "role",
  "objective",
  "tools",
  "workflow",
  "rules",
  "output",
];

const DEFAULT_SECTION: PromptSections = {
  role: "",
  objective: "",
  tools: [],
  workflow: [],
  rules: "",
  output: "",
};

const HEADING_RE = /^##\s+(.+)$/;

/**
 * Normalize a heading string to a known PromptSectionKey, or null.
 * Case-insensitive matching.
 */
export function normalizeHeading(text: string): PromptSectionKey | null {
  const lower = text.trim().toLowerCase();
  for (const key of KNOWN_KEYS) {
    if (key === lower) return key;
  }
  return null;
}

/**
 * Serialize a PromptSections object into a markdown string.
 *
 * Produces deterministic, human-readable markdown with fixed heading order:
 * ROLE, OBJECTIVE, TOOLS, WORKFLOW, RULES, OUTPUT.
 *
 * List fields (tools, workflow) are serialized as `- item` bullet points.
 * Text fields are preserved verbatim after their heading.
 * Blank lines separate sections.
 *
 * This is a pure function with no side effects and no browser dependencies.
 */
export function sectionsToMarkdown(sections: PromptSections): string {
  const parts: string[] = [];

  for (const key of KNOWN_KEYS) {
    const heading = `## ${key.toUpperCase()}`;
    const value = sections[key];

    if (key === "tools" || key === "workflow") {
      const arr = Array.isArray(value) ? value : [];
      if (arr.length > 0) {
        const lines = arr.map((item) => `- ${item}`);
        parts.push(`${heading}\n\n${lines.join("\n")}\n`);
      }
    } else {
      const text = typeof value === "string" ? value : "";
      if (text.trim().length > 0) {
        parts.push(`${heading}\n\n${text}\n`);
      }
    }
  }

  return parts.join("\n").trimEnd() + "\n";
}

/**
 * Parse a markdown string back into a PromptSections object.
 *
 * - Identifies section headings by known names (case-insensitive).
 * - Collects lines between consecutive headings into the matching field.
 * - Converts list blocks (lines starting with `- ` or `* `) to arrays
 *   for `tools` and `workflow`.
 * - Returns empty arrays/strings for absent sections.
 * - Unknown headings are captured under `unknownMap` without crashing.
 *
 * This is a pure function with no side effects and no browser dependencies.
 */
export function markdownToSections(
  markdown: string
): PromptSections & { unknownMap: Record<string, string> } {
  const result: PromptSections = { ...DEFAULT_SECTION };
  const unknownMap: Record<string, string> = {};

  const lines = markdown.split("\n");
  let currentKey: PromptSectionKey | "unknown" | null = null;
  let currentLines: string[] = [];
  let currentLabel = "";

  function flushSection(): void {
    if (currentKey === null) return;

    const text = currentLines.join("\n").trim();

    if (currentKey === "tools" || currentKey === "workflow") {
      // Parse list items: lines starting with `- ` or `* `
      const items: string[] = [];
      for (const line of currentLines) {
        const trimmed = line.replace(/^\s*/, "");
        if (/^[*\-]\s/.test(trimmed)) {
          items.push(trimmed.slice(2));
        }
      }
      result[currentKey] = items;
    } else if (
      currentKey === "role" ||
      currentKey === "objective" ||
      currentKey === "rules" ||
      currentKey === "output"
    ) {
      result[currentKey] = text;
    }

    // Unknown headings — store raw content
    if (currentKey === "unknown") {
      unknownMap[currentLabel] = text;
    }

    currentKey = null;
    currentLines = [];
    currentLabel = "";
  }

  for (const line of lines) {
    const headingMatch = line.match(HEADING_RE);

    if (headingMatch) {
      // Flush previous section before starting new one
      flushSection();

      const key = normalizeHeading(headingMatch[1]);
      if (key) {
        currentKey = key;
      } else {
        currentKey = "unknown";
        currentLabel = headingMatch[1].trim();
      }
    } else {
      currentLines.push(line);
    }
  }

  // Flush the last section
  flushSection();

  return { ...result, unknownMap };
}
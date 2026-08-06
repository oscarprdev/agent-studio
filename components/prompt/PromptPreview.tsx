"use client";

import React from "react";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PromptPreviewProps {
  content?: string | null;
  className?: string;
}

/**
 * Escape HTML special characters in plain text (text-node safe).
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Parse inline formatting: bold, italic, inline code.
 */
function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const inlineRegex = /```(.+?)```|\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++}>{escapeHtml(remaining.slice(lastIndex, match.index))}</span>
      );
    }

    let node: ReactNode;
    if (match[1] !== undefined) {
      node = <code key={key++}>{escapeHtml(match[1])}</code>;
    } else if (match[2] !== undefined) {
      node = <strong key={key++}>{match[2]}</strong>;
    } else if (match[3] !== undefined) {
      node = <code key={key++}>{escapeHtml(match[3])}</code>;
    } else if (match[4] !== undefined) {
      node = <em key={key++}>{match[4]}</em>;
    }
    parts.push(node);
    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    parts.push(
      <span key={key++}>{escapeHtml(remaining.slice(lastIndex))}</span>
    );
  }

  return parts;
}

/**
 * Parse a markdown string into a React element tree.
 *
 * Supported syntax:
 * - Headings: `# H1`, `## H2`
 * - Unordered lists: `- item`, `* item`
 * - Ordered lists: `1. item`
 * - Bold: `**bold**`
 * - Italic: `*italic*`
 * - Inline code: `` `code` ``
 * - Code fences: ``` `fence` ```
 * - Line breaks / paragraph breaks
 */
function parseMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];

    // Headings
    if (/^#{1,2}\s/.test(rawLine)) {
      const match = rawLine.match(/^(#+)\s/);
      const level = match ? match[1].length : 1;
      const headingContent = rawLine.slice(level + 1);
      const headingProps = {
        key: i,
        className: "mt-4 first:mt-0 font-semibold leading-tight",
        children: parseInline(headingContent),
      };
      elements.push(
        level <= 1
          ? React.createElement("h1", headingProps)
          : React.createElement("h2", headingProps)
      );
      i++;
      continue;
    }

    // Code fence block
    if (rawLine.startsWith("```")) {
      const fenceLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        fenceLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        i++; // close fence
      }
      const fenceContent = fenceLines.join("\n");
      elements.push(
        React.createElement(
          "pre",
          {
            key: i,
            className: "overflow-x-auto rounded-lg bg-muted p-3 text-sm",
          },
          React.createElement("code", null, escapeHtml(fenceContent))
        )
      );
      continue;
    }

    // Unordered list: `- item` or `* item`
    if (/^[\-\*]\s/.test(rawLine)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^[\-\*]\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^[\-\*]\s/, "");
        items.push(<li key={i}>{parseInline(itemText)}</li>);
        i++;
      }
      elements.push(
        <ul key={i} className="ml-4 list-disc pb-1 pl-1">
          {items}
        </ul>
      );
      continue;
    }

    // Ordered list: `1. item`
    if (/^\d\.\s/.test(rawLine)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\d\.\s/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d\.\s/, "");
        items.push(
          <li key={i} className="list-decimal">
            {parseInline(itemText)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={i} className="ml-4 list-decimal pb-1 pl-1">
          {items}
        </ol>
      );
      continue;
    }

    // Blank line
    if (rawLine.trim() === "") {
      elements.push(<br key={i} className="block h-2" />);
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={i} className="whitespace-pre-wrap text-sm">
        {parseInline(rawLine)}
      </p>
    );
    i++;
  }

  return elements;
}

/**
 * PromptPreview — renders plain markdown text as a React element tree.
 *
 * All content is rendered as React text nodes (never `dangerouslySetInnerHTML`).
 * Show a placeholder when `content` is empty, null, or undefined.
 */
export function PromptPreview({ content, className }: PromptPreviewProps) {
  if (!content || content.trim().length === 0) {
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center text-sm text-muted-foreground",
          className
        )}
      >
        No preview
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1 p-2 text-sm", className)}>
      {parseMarkdown(content)}
    </div>
  );
}
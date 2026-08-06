export type PromptSectionKey = "role" | "objective" | "tools" | "workflow" | "rules" | "output";

export interface PromptSections {
  role: string;
  objective: string;
  tools: string[];
  workflow: string[];
  rules: string;
  output: string;
}

export interface Prompt {
  id: string;
  title: string;
  input: string;
  content: PromptSections;
  createdAt: string;
  updatedAt: string;
}

export type CreatePromptInput = Pick<Prompt, "title" | "input" | "content">;

export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  title: string;
  content: PromptSections;
  markdown: string;
  createdAt: string;
}

export interface PromptDiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface PromptDiff {
  lines: PromptDiffLine[];
}

export interface TestResult {
  input: string;
  output: string;
  createdAt: string;
  status: "success" | "error";
}

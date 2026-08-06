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
  tags: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePromptInput = Pick<Prompt, "title" | "input" | "content">;

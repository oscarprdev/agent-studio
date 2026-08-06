/* eslint-disable-next-line import/no-restricted-paths -- re-export from canonical skills types */
import type { CreateSkillInput as C, Skill } from "@/lib/skills/types";

// Re-export so existing code that imports `Skill` or `CreateSkillInput` from this module still compiles.
export type { Skill, C as CreateSkillInput };

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  skills: Skill[];
  tools: Tool[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface WizardState {
  currentStep: number;
  goal: string;
  selectedTools: string[];
  skills: Skill[];
  context: string;
  generatedAgent?: Agent;
}

export type AgentDefinition = Pick<
  Agent,
  "name" | "description" | "model" | "system_prompt" | "skills" | "tools"
>;

export type CreateAgentInput = Pick<
  Agent,
  "name" | "description" | "model" | "system_prompt" | "skills" | "tools"
>;

export type SaveAgentInput = CreateAgentInput & {
  id?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
};

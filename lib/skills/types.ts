/** Union of all `SkillContent` keys for section iteration. */
export type SkillContentKey =
  | "name"
  | "description"
  | "instructions"
  | "triggers"
  | "tools"
  | "expectedOutput"
  | "rules";

/** The structured, machine-readable representation of a generated skill. */
export interface SkillContent {
  /** Skill display name. */
  name: string;
  /** One-line purpose of the skill. */
  description: string;
  /** Detailed step-by-step instructions (newline-separated). */
  instructions: string;
  /** When to activate this skill. */
  triggers: string[];
  /** Required external tools or MCPs. */
  tools: string[];
  /** What the skill produces. */
  expectedOutput: string;
  /** Constraints and guidelines (newline-separated). */
  rules: string;
}

/** A reusable AI capability definition. */
export interface Skill {
  /** Unique identifier (crypto.randomUUID()). */
  id: string;
  /** Skill display name. */
  name: string;
  /** Short summary of what the skill does. */
  description: string;
  /** Original user description that generated this skill. */
  input: string;
  /** Generated structured skill content. */
  content: SkillContent;
  /** Categorization tags. */
  tags: string[];
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
}

/** Subset of `Skill` fields required for creation. */
export type CreateSkillInput = Pick<Skill, "name" | "input" | "content" | "tags">;

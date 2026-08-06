// Canonical MVP skill shape — replaces the old generator-oriented Skill entity.

export interface Skill {
  /** Unique identifier (crypto.randomUUID()). */
  id: string;
  /** Skill display name. */
  name: string;
  /** Short summary of what the skill does. */
  description: string;
  /** User-provided instructions (may be empty). */
  instructions: string;
  /** Tool IDs from TOOL_CANDIDATES. */
  tools: string[];
  /** "local-user" sentinel for MVP; store or UI resolves at runtime. */
  created_by: string;
  /** ISO 8601 creation timestamp (immutable). */
  createdAt: string;
  /** ISO 8601 last-updated timestamp. */
  updatedAt: string;
}

/** Mutable fields callers must provide when creating a skill. */
export type CreateSkillInput = Pick<Skill, "name" | "description" | "instructions" | "tools" | "created_by">;
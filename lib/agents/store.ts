import type { Agent, CreateAgentInput, SaveAgentInput } from "./types";

const STORAGE_KEY = "agentstudio:agents";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): Agent[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(agents: Agent[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch {
    // Silently handle quota errors and unavailable storage
  }
}

/**
 * Create-or-update agent. Returns the saved agent, or null on validation/SSR/persist failure.
 *
 * Create path (no valid `id` in input): generates UUID, version, timestamps.
 * Update path (`id` present): mutates mutable fields, preserves `id` and `createdAt`, refreshes `updatedAt`.
 */
export function saveAgent(input: SaveAgentInput): Agent | null {
  if (!isBrowser()) return null;
  if (!input || typeof input !== "object") return null;

  // Required fields validation (create path)
  const hasRequired =
    input.name != null && input.name.trim() !== "" &&
    input.description != null && input.description.trim() !== "" &&
    input.model != null && input.model.trim() !== "" &&
    input.system_prompt != null && input.system_prompt.trim() !== "" &&
    Array.isArray(input.skills) &&
    Array.isArray(input.tools);

  // Update path: only validate required fields if no id provided
  const hasId = input.id != null && typeof input.id === "string" && input.id.trim() !== "";

  if (!hasId && !hasRequired) return null;

  try {
    const now = new Date().toISOString();
    const agents = readAll();

    if (hasId) {
      // Update path
      const index = agents.findIndex((a) => a.id === input.id);
      if (index === -1) return null;

      const existing = agents[index];
      const updated: Agent = {
        ...existing,
        ...input,
        id: existing.id,
        version: existing.version,
        createdAt: existing.createdAt,
        updatedAt: now,
      };
      agents[index] = updated;
      persist(agents);
      return updated;
    } else {
      // Create path — validate all required fields
      if (!hasRequired) return null;

      // Generate UUID
      let uuid: string;
      try {
        uuid = crypto.randomUUID();
      } catch {
        return null;
      }

      const agent: Agent = {
        id: uuid,
        name: input.name,
        description: input.description,
        model: input.model,
        system_prompt: input.system_prompt,
        skills: input.skills,
        tools: input.tools,
        version: "1.0.0",
        createdAt: now,
        updatedAt: now,
      };

      agents.push(agent);
      persist(agents);
      return agent;
    }
  } catch {
    return null;
  }
}

/** Returns all saved agents, or an empty array on missing/invalid localStorage. */
export function getAll(): Agent[] {
  return readAll();
}

/** Returns an agent by ID, or null if not found. */
export function getById(id: string): Agent | null {
  return readAll().find((a) => a.id === id) ?? null;
}

/** Creates a new agent with auto-generated UUID and timestamps. */
export function create(input: CreateAgentInput): Agent {
  const now = new Date().toISOString();
  const agent: Agent = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.description,
    model: input.model,
    system_prompt: input.system_prompt,
    skills: input.skills,
    tools: input.tools,
    version: "1.0.0",
    createdAt: now,
    updatedAt: now,
  };

  const agents = readAll();
  agents.push(agent);
  persist(agents);

  return agent;
}

/** Updates an existing agent by ID. Returns the updated agent, or null if not found. */
export function update(id: string, updates: Partial<Agent>): Agent | null {
  try {
    const agents = readAll();
    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) return null;
    const existing = agents[index];
    const updated: Agent = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    agents[index] = updated;
    persist(agents);
    return updated;
  } catch {
    return null;
  }
}

/** Removes an agent by ID. Returns true if removed, false if not found. */
export function remove(id: string): boolean {
  try {
    const agents = readAll();
    const filtered = agents.filter((a) => a.id !== id);
    if (filtered.length === agents.length) return false;
    persist(filtered);
    return true;
  } catch {
    return false;
  }
}

/** Returns an agent by ID, or null if not found. */
export function getAgent(id: string): Agent | null {
  return getById(id);
}

/** Returns all saved agents, or an empty array. */
export function listAgents(): Agent[] {
  return getAll();
}

/** Removes an agent by ID. Returns true if removed, false if not found. */
export function deleteAgent(id: string): boolean {
  return remove(id);
}

/**
 * Clone an existing agent into a new agent with a fresh UUID and timestamps.
 * Returns the new agent, or null on invalid/unknown id, SSR, or persist failure.
 */
export function duplicateAgent(id: string): Agent | null {
  if (!id || typeof id !== "string" || id.trim() === "") return null;
  if (!isBrowser()) return null;

  const source = getAgent(id);
  if (!source) return null;

  try {
    const now = new Date().toISOString();
    let uuid: string;
    try {
      uuid = crypto.randomUUID();
    } catch {
      return null;
    }

    const clone: Agent = {
      id: uuid,
      name: `${source.name} (Copy)`,
      description: source.description,
      model: source.model,
      system_prompt: source.system_prompt,
        skills: [...(source.skills ?? [])],
      tools: [...(source.tools ?? [])],
      version: source.version,
      createdAt: now,
      updatedAt: now,
    };

    const agents = readAll();
    agents.push(clone);
    persist(agents);

    return clone;
  } catch {
    return null;
  }
}

/**
 * Render an agent as a deterministic markdown string.
 * Pure function — no side effects, no DOM, no downloads.
 * Returns null when the agent does not exist or the id is invalid.
 */
export function exportAgentMarkdown(id: string): string | null {
  if (!id || typeof id !== "string" || id.trim() === "") return null;

  const agent = getAgent(id);
  if (!agent) return null;

  const lines: string[] = [];

  lines.push(`# ${agent.name}`);
  lines.push("");

  // Description
  lines.push("## Description");
  lines.push(agent.description.includes("\n") ? "```\n" + agent.description + "\n```" : agent.description);
  lines.push("");

  // Model
  lines.push("## Model");
  lines.push(agent.model);
  lines.push("");

  // System Prompt
  lines.push("## System Prompt");
  lines.push(agent.system_prompt.includes("\n") ? "```\n" + agent.system_prompt + "\n```" : agent.system_prompt);
  lines.push("");

  // Tools
  lines.push("## Tools");
  if (agent.tools && agent.tools.length > 0) {
    for (const tool of agent.tools) {
      lines.push(`- ${tool.name}: ${tool.description}\n  - **Category**: ${tool.category}`);
    }
  } else {
    lines.push("_None_");
  }
  lines.push("");

  // Skills
  lines.push("## Skills");
  if (agent.skills && agent.skills.length > 0) {
    for (const skill of agent.skills) {
      lines.push(`- ${skill.name}: ${skill.description}`);
    }
  } else {
    lines.push("_None_");
  }
  lines.push("");

  // Metadata
  lines.push("## Metadata");
  lines.push(`- **ID**: ${agent.id}`);
  lines.push(`- **Version**: ${agent.version}`);
  lines.push(`- **Created**: ${agent.createdAt}`);
  lines.push(`- **Updated**: ${agent.updatedAt}`);

  return lines.join("\n");
}

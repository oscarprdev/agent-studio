import type { Agent, CreateAgentInput } from "./types";

const STORAGE_KEY = "agentstudio:agents";

function readAll(): Agent[] {
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
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

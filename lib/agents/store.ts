import type { Agent, AgentVersion, CreateAgentInput, SaveAgentInput } from "./types";

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

      if (isNonTrivialChange(existing, input as Partial<Agent>)) {
        const versions = readVersions(existing.id);
        if (versions.length > 0) {
          const version = createVersion(existing.id, input as Partial<Agent>);
          if (!version) {
            return null;
          }
        }
      }

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

/**
 * Updates an existing agent by ID, creating a version snapshot for non-trivial
 * changes when the agent already has version history.
 *
 * Returns the updated agent, or null if not found.
 */
export function update(id: string, updates: Partial<Agent>): Agent | null {
  try {
    const agents = readAll();
    const index = agents.findIndex((a) => a.id === id);
    if (index === -1) return null;
    const existing = agents[index];

    if (isNonTrivialChange(existing, updates)) {
      const versions = readVersions(existing.id);
      if (versions.length > 0) {
        const version = createVersion(existing.id, updates);
        if (!version) {
          return null;
        }
      }
    }

    const updated: Agent = {
      ...existing,
      ...updates,
      id: existing.id,
      version: existing.version,
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
    cleanupAgentVersions(id);
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
      name: `Copy of ${source.name}`,
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

// ──────────────────────────────────────────────
// Version History (Tasks 047-003 / 047-004)
// ──────────────────────────────────────────────

/** Per-agent version storage key */
function versionKey(agentId: string): string {
  return `agentstudio:agents:${agentId}:versions`;
}

function readVersions(agentId: string): AgentVersion[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(versionKey(agentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistVersions(agentId: string, versions: AgentVersion[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(versionKey(agentId), JSON.stringify(versions));
  } catch {
    // Silent fail — quota errors, unavailable storage
  }
}

function generateVersionId(): string {
  return crypto.randomUUID();
}

function nextVersionLabel(versions: AgentVersion[]): string {
  if (versions.length === 0) return "1.0";
  const maxNum = Math.max(
    0,
    ...versions.map((v) => {
      // Parse label like "1.3" → 3
      const parts = v.versionLabel.split(".");
      return parseInt(parts[parts.length - 1] ?? "0", 10);
    }),
  );
  return `${maxNum + 1}.0`;
}

// Helpers for stable array comparison (tool/skill by id)
function byId(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function stableJson(arr: { id: string; name: string; description?: string }[]): string {
  return JSON.stringify([...arr].sort(byId));
}

/** Detect if a change is substantive enough to warrant a version snapshot. */
function isNonTrivialChange(before: Partial<Agent>, after: Partial<Agent>): boolean {
  if (before.system_prompt !== after.system_prompt) return true;
  if (before.model !== after.model) return true;
  if (stableJson(before.tools ?? []) !== stableJson(after.tools ?? [])) return true;
  if (stableJson(before.skills ?? []) !== stableJson(after.skills ?? [])) return true;
  return false;
}

// ──────────────────────────────────────────────

/**
 * Create a version snapshot of the current agent state.
 *
 * Deep-clones mutable fields (tools, skills) so later agent edits don't
 * affect historical snapshots. Auto-increments the version label.
 *
 * Returns the created version snapshot, or `null` on invalid/unknown agent,
 * SSR, or a storage persistence error.
 */
export function createVersion(
  agentId: string,
  updates: Partial<Agent>,
  changeReason?: string,
): AgentVersion | null {
  // Validate agentId
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return null;
  if (!isBrowser()) return null;

  const agent = getAgent(agentId);
  if (!agent) return null;

  try {
    // Generate a unique version id
    const versionId = generateVersionId();

    // Build a deep-cloned snapshot of the fields the agent already has
    // (before the `updates` are applied).
    const now = new Date().toISOString();
    const snapshot: AgentVersion = {
      versionId,
      versionLabel: nextVersionLabel(readVersions(agentId)),
      name: agent.name,
      description: agent.description,
      system_prompt: agent.system_prompt,
      model: agent.model,
      tools: structuredClone(agent.tools ?? []),
      skills: structuredClone(agent.skills ?? []),
      changeReason,
      createdAt: now,
      changedAt: now,
    };

    // Read, append, persist
    const versions = readVersions(agentId);
    versions.push(snapshot);
    persistVersions(agentId, versions);

    return snapshot;
  } catch {
    return null;
  }
}

/**
 * Read a single version by id for a given agent.
 *
 * Returns the matching `AgentVersion`, or `null` when the agent does not
 * exist or the version id is not found.
 */
export function getVersion(agentId: string, versionId: string): AgentVersion | null {
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return null;
  if (!versionId || typeof versionId !== "string" || versionId.trim() === "") return null;
  if (!isBrowser()) return null;

  const agent = getAgent(agentId);
  if (!agent) return null;

  const versions = readVersions(agentId);
  return versions.find((v) => v.versionId === versionId) ?? null;
}

/**
 * Return a defensive copy of the version list sorted newest-first.
 *
 * The returned array is never the live storage reference — mutating it
 * does not alter persisted versions.
 */
export function getVersions(agentId: string): AgentVersion[] {
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return [];
  if (!isBrowser()) return [];

  const agent = getAgent(agentId);
  if (!agent) return [];

  const versions = readVersions(agentId);
  return [...versions].sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}

/**
 * Remove a version from the agent's version list.
 *
 * Returns `true` when the version was found and deleted, `false` when no
 * version with the given id exists (or the agent is unknown).
 */
export function deleteVersion(agentId: string, versionId: string): boolean {
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return false;
  if (!versionId || typeof versionId !== "string" || versionId.trim() === "") return false;
  if (!isBrowser()) return false;

  const agent = getAgent(agentId);
  if (!agent) return false;

  try {
    const versions = readVersions(agentId);
    const filtered = versions.filter((v) => v.versionId !== versionId);
    if (filtered.length === versions.length) return false;
    persistVersions(agentId, filtered);
    return true;
  } catch {
    return false;
  }
}

/**
 * Roll the agent back to a previous version snapshot.
 *
 * Copies snapshot fields into the current agent while preserving the
 * agent's `id` and `createdAt`. Updates `updatedAt` to the current wall
 * clock time. Does **NOT** create a new version snapshot.
 *
 * Returns the restored agent, or `null` when the agent or version id is
 * unknown / not found, or persist fails.
 */
export function rollbackToVersion(agentId: string, versionId: string): Agent | null {
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return null;
  if (!versionId || typeof versionId !== "string" || versionId.trim() === "") return null;
  if (!isBrowser()) return null;

  const agent = getAgent(agentId);
  if (!agent) return null;

  const version = getVersion(agentId, versionId);
  if (!version) return null;

  try {
    const now = new Date().toISOString();
    const agents = readAll();
    const index = agents.findIndex((a) => a.id === agentId);
    if (index === -1) return null;

    const current = agents[index];
    const restored: Agent = {
      ...current,
      name: version.name,
      description: version.description,
      system_prompt: version.system_prompt,
      model: version.model,
      tools: structuredClone(version.tools ?? []),
      skills: structuredClone(version.skills ?? []),
      id: current.id,
      version: current.version,
      createdAt: current.createdAt,
      updatedAt: now,
    };
    agents[index] = restored;
    persist(agents);
    return restored;
  } catch {
    return null;
  }
}

/**
 * Erase version snapshots for an agent (called during agent deletion).
 */
export function cleanupAgentVersions(agentId: string): void {
  if (!agentId || typeof agentId !== "string" || agentId.trim() === "") return;
  if (!isBrowser()) return;

  localStorage.removeItem(versionKey(agentId));
}

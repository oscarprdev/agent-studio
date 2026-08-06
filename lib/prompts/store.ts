import type { CreatePromptInput, Prompt, PromptSections, PromptVersion } from "./types";
import {
  getPromptVersion,
  getPromptVersions,
  restorePromptVersion as restorePromptVersionVersions,
  savePromptVersion as savePromptVersionVersions,
} from "./versions";

const STORAGE_KEY = "agentstudio:prompts";

function readAll(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(prompts: Prompt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

/** Returns all saved prompts, or an empty array on missing/invalid localStorage. */
export function getAll(): Prompt[] {
  return readAll();
}

/** Returns a prompt by ID, or null if not found. */
export function getById(id: string): Prompt | null {
  return readAll().find((p) => p.id === id) ?? null;
}

/** Creates a new prompt with auto-generated UUID and timestamps. */
export function create(input: CreatePromptInput): Prompt {
  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: crypto.randomUUID(),
    title: input.title,
    input: input.input,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const prompts = readAll();
    prompts.push(prompt);
    persist(prompts);
  } catch {
    // Prompt returned even if localStorage fails — caller gets the object
  }

  return prompt;
}

/** Updates an existing prompt by ID. Returns the updated prompt, or null if not found. */
export function update(id: string, updates: Partial<Prompt>): Prompt | null {
  try {
    const prompts = readAll();
    const index = prompts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const existing = prompts[index];
    const updated: Prompt = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    prompts[index] = updated;
    persist(prompts);
    return updated;
  } catch {
    return null;
  }
}

/** Removes a prompt by ID. Returns true if removed, false if not found. */
export function remove(id: string): boolean {
  try {
    const prompts = readAll();
    const filtered = prompts.filter((p) => p.id !== id);
    if (filtered.length === prompts.length) return false;
    persist(filtered);
    return true;
  } catch {
    return false;
  }
}

// ── Version storage delegates ─────────────────────────────────────────────────

/**
 * Read all version records for a prompt.
 * Malformed entries are silently skipped.
 */
export function getVersionHistory(promptId: string): PromptVersion[] {
  return getPromptVersions(promptId);
}

/**
 * Read a single version record by ID.
 */
export function getVersion(promptId: string, versionId: string): PromptVersion | null {
  return getPromptVersion(promptId, versionId);
}

/**
 * Save a new version snapshot for a prompt.
 *
 * Derives the monotonically increasing version number from existing
 * versions, creates the snapshot, prunes to 50 versions max, and
 * persists to localStorage. Delegates to versions.ts (no circular
 * — versions.ts does NOT import from store.ts).
 */
export function savePromptVersion(
  promptId: string,
  title: string,
  markdown: string,
  content: PromptSections
): PromptVersion | null {
  const versions = getVersionHistory(promptId);
  const nextVersion =
    versions.length > 0
      ? Math.max(...versions.map((v) => v.version)) + 1
      : 1;

  return savePromptVersionVersions(promptId, nextVersion, title, markdown, content);
}

/**
 * Restore a version by updating the canonical prompt and creating
 * an auditable new version entry.
 */
export function restorePromptVersion(
  promptId: string,
  versionId: string
): Prompt | null {
  return restorePromptVersionVersions(promptId, versionId, {
    getCurrPrompt: (id: string) => getById(id),
    updatePrompt: (id: string, updates: Partial<Prompt>) => update(id, updates),
    getLatestVersionNumber: (pid: string) => {
      const versions = getVersionHistory(pid);
      if (versions.length === 0) return 0;
      return Math.max(...versions.map((v) => v.version));
    },
  });
}

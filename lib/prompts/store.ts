import type { CreatePromptInput, Prompt } from "./types";

const STORAGE_KEY = "agentstudio:prompts";

function normalize(p: Prompt): Prompt {
  const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
  const version: string = typeof p.version === "string" && p.version.length > 0 ? p.version : "1.0.0";
  const updatedAt: string = isNaN(new Date(p.updatedAt).getTime()) ? "1970-01-01T00:00:00.000Z" : p.updatedAt;
  const createdAt: string = isNaN(new Date(p.createdAt).getTime()) ? "1970-01-01T00:00:00.000Z" : p.createdAt;
  return { ...p, tags, version, updatedAt, createdAt };
}

function readAll(): Prompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function persist(prompts: Prompt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

/** Returns all saved prompts, or an empty array on missing/invalid localStorage. */
export function getAll(): Prompt[] {
  const prompts = readAll();
  return [...prompts].sort((a, b) => {
    const dateCompare = b.updatedAt.localeCompare(a.updatedAt);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
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
    tags: [],
    version: "1.0.0",
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

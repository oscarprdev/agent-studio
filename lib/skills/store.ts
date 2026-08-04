import type { CreateSkillInput, Skill } from "./types";

const STORAGE_KEY = "agentstudio:skills";

function readAll(): Skill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(skills: Skill[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

/** Returns all saved skills, or an empty array on missing/invalid localStorage. */
export function getAll(): Skill[] {
  return readAll();
}

/** Returns a skill by ID, or null if not found. */
export function getById(id: string): Skill | null {
  return readAll().find((s) => s.id === id) ?? null;
}

/** Creates a new skill with auto-generated UUID and timestamps. */
export function create(input: CreateSkillInput): Skill {
  const now = new Date().toISOString();
  const skill: Skill = {
    id: crypto.randomUUID(),
    name: input.name,
    description: input.content.description,
    input: input.input,
    content: input.content,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const skills = readAll();
    skills.push(skill);
    persist(skills);
  } catch {
    // Skill returned even if localStorage fails — caller gets the object
  }

  return skill;
}

/** Updates an existing skill by ID. Returns the updated skill, or null if not found. */
export function update(id: string, updates: Partial<Skill>): Skill | null {
  try {
    const skills = readAll();
    const index = skills.findIndex((s) => s.id === id);
    if (index === -1) return null;
    const existing = skills[index];
    const updated: Skill = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    skills[index] = updated;
    persist(skills);
    return updated;
  } catch {
    return null;
  }
}

/** Removes a skill by ID. Returns true if removed, false if not found. */
export function remove(id: string): boolean {
  try {
    const skills = readAll();
    const filtered = skills.filter((s) => s.id !== id);
    if (filtered.length === skills.length) return false;
    persist(filtered);
    return true;
  } catch {
    return false;
  }
}

/** Duplicates a skill with a new UUID, "(copy)" suffix on name, and fresh timestamps. Original is untouched. */
export function duplicate(id: string): Skill | null {
  try {
    const skills = readAll();
    const original = skills.find((s) => s.id === id);
    if (!original) return null;

    const now = new Date().toISOString();
    const clone: Skill = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (copy)`,
      tags: [...original.tags],
      createdAt: now,
      updatedAt: now,
    };

    skills.push(clone);
    persist(skills);
    return clone;
  } catch {
    return null;
  }
}

/** Filters skills by name, description, or tags (case-insensitive). Empty query returns all. */
export function search(query: string): Skill[] {
  if (!query.trim()) return readAll();

  const q = query.toLowerCase();
  return readAll().filter((s) => {
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.description.toLowerCase().includes(q)) return true;
    if (s.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
    return false;
  });
}

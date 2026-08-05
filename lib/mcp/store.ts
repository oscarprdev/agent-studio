import type { CreateMcpConnectionInput, McpConnection } from "./types";

const STORAGE_KEY = "agentstudio:mcp";

function readAll(): McpConnection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: McpConnection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Returns all saved connections, or an empty array on missing/invalid localStorage. */
export function getAll(): McpConnection[] {
  return readAll();
}

/** Returns a connection by ID, or null if not found. */
export function getById(id: string): McpConnection | null {
  return readAll().find((c) => c.id === id) ?? null;
}

/** Creates a new connection with auto-generated UUID and timestamps. */
export function create(input: CreateMcpConnectionInput): McpConnection {
  const now = new Date().toISOString();
  const connection: McpConnection = {
    ...input,
    id: crypto.randomUUID(),
    status: "disconnected",
    lastTestedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const items = readAll();
    items.push(connection);
    persist(items);
  } catch {
    // Connection returned even if localStorage fails — caller gets the object
  }

  return connection;
}

/** Updates an existing connection by ID. Returns the updated connection, or null if not found. */
export function update(
  id: string,
  updates: Partial<McpConnection>
): McpConnection | null {
  try {
    const items = readAll();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const existing = items[index];
    const updated: McpConnection = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    items[index] = updated;
    persist(items);
    return updated;
  } catch {
    return null;
  }
}

/** Removes a connection by ID. Returns true if removed, false if not found. */
export function remove(id: string): boolean {
  try {
    const items = readAll();
    const filtered = items.filter((c) => c.id !== id);
    if (filtered.length === items.length) return false;
    persist(filtered);
    return true;
  } catch {
    return false;
  }
}

/** Disconnects a connection by setting its status to "disconnected". Returns the updated connection, or null if not found. */
export function disconnect(id: string): McpConnection | null {
  try {
    const items = readAll();
    const index = items.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const updated: McpConnection = {
      ...items[index],
      status: "disconnected",
    };
    items[index] = updated;
    persist(items);
    return updated;
  } catch {
    return null;
  }
}

/** Mock-tests a connection with a 1–2 second delay. Resolves with status "connected", or rejects if not found. */
export function testConnection(id: string): Promise<McpConnection> {
  const delay = 1000 + Math.random() * 1000;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const items = readAll();
      const index = items.findIndex((c) => c.id === id);
      if (index === -1) {
        reject(new Error(`Connection ${id} not found`));
        return;
      }
      const updated: McpConnection = {
        ...items[index],
        status: "connected",
        lastTestedAt: new Date().toISOString(),
      };
      items[index] = updated;
      persist(items);
      resolve(updated);
    }, delay);
  });
}

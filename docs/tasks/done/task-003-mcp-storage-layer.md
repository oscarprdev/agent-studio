# Task 003: Create MCP Storage Layer

## Context

The storage layer provides all CRUD operations for MCP connections using localStorage. It follows the exact pattern established in `lib/prompts/store.ts` — same `readAll()`/`persist()` internals, same try-catch wrapping, same lazy-read patterns. This depends on the types from Task 001.

## Plan Reference

docs/plans/plan-AGE-11-mcp-manager.md

Relevant section:

- **Operation 3: Create MCP Store**
- **Approach**: "Repository Pattern for storage layer (mirroring `lib/prompts/store.ts`)"

## Implementation Steps

1. Create `lib/mcp/store.ts`
2. Define `STORAGE_KEY = "agentstudio:mcp"` constant
3. Implement internal helper functions mirroring the prompts store pattern:
   - `readAll(): McpConnection[]` — reads from localStorage, parses JSON, validates array structure, returns empty array on any error
   - `persist(items: McpConnection[]): void` — serializes and writes to localStorage
4. Export the following functions (all wrapped in try-catch):
   - `getAll(): McpConnection[]` — returns all connections
   - `getById(id: string): McpConnection | null` — returns single connection by ID, null if not found
   - `create(input: CreateMcpConnectionInput): McpConnection` — creates with UUID (`crypto.randomUUID()`), `createdAt`/`updatedAt` ISO timestamps, status defaults to `"disconnected"`. Returns connection even if localStorage fails (caller gets the object).
   - `update(id: string, updates: Partial<McpConnection>): McpConnection | null` — partial update, preserves `id` and `createdAt`, bumps `updatedAt`. Returns null if not found.
   - `remove(id: string): boolean` — deletes by ID, returns false if not found
   - `testConnection(id: string): Promise<McpConnection>` — mock test with 1–2 second delay, always succeeds, sets status to `"connected"` and updates `lastTestedAt` to current ISO timestamp, rejects with error if connection not found
5. Add JSDoc comments on all exported functions (matching existing pattern)
6. Handle edge cases: localStorage unavailable (incognito), invalid JSON, corrupted data, test on non-existent ID

## Acceptance Criteria

- [ ] `lib/mcp/store.ts` exports all 6 functions: `getAll`, `getById`, `create`, `update`, `remove`, `testConnection`
- [ ] `STORAGE_KEY` is `"agentstudio:mcp"`
- [ ] Newly created connections have status `"disconnected"` by default
- [ ] `testConnection()` returns a Promise that resolves after 1–2 seconds with status `"connected"` and `lastTestedAt` set
- [ ] `testConnection()` rejects with an error for non-existent ID
- [ ] `update()` preserves `id` and `createdAt` while updating `updatedAt`
- [ ] All functions wrap localStorage operations in try-catch
- [ ] `create()` returns the connection object even if localStorage fails
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero warnings

## Files to Create/Modify

- `lib/mcp/store.ts` — localStorage CRUD operations (new file, ~90 lines)

## Dependencies

- Task 001 (entity types must exist)
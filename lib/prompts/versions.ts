import type { Prompt, PromptDiff, PromptDiffLine, PromptSections, PromptVersion } from "./types";

// ── Storage keys ──────────────────────────────────────────────────────────────

const VERSIONS_PREFIX = "agentstudio:prompt-versions:";

function versionsKey(promptId: string): string {
  return VERSIONS_PREFIX + promptId;
}

// ── Persistence helpers ───────────────────────────────────────────────────────

const MAX_VERSIONS = 50;

/**
 * Read version records from localStorage for a prompt.
 * Returns an empty array on missing key, parse errors, or non-array values.
 */
export function readVersions(promptId: string): PromptVersion[] {
  try {
    const raw = localStorage.getItem(versionsKey(promptId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist version records to localStorage for a prompt.
 * Silently catches JSON.stringify and localStorage quota errors.
 */
export function writeVersions(promptId: string, versions: PromptVersion[]): void {
  try {
    localStorage.setItem(versionsKey(promptId), JSON.stringify(versions));
  } catch {
    // localStorage quota exceeded or unavailable — silently fail.
    // UI layer handles the failure feedback.
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validate that an object shape looks like a PromptVersion.
 * Returns true when all required fields are present with correct types.
 */
function isValidVersion(data: unknown): data is PromptVersion {
  if (data == null || typeof data !== "object") return false;
  const v = data as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.promptId === "string" &&
    typeof v.version === "number" &&
    typeof v.title === "string" &&
    typeof v.content === "object" &&
    typeof v.markdown === "string" &&
    typeof v.createdAt === "string"
  );
}

/**
 * Prune the oldest versions to stay within the MAX_VERSIONS limit.
 * Versions are ordered newest-first; oldest entries are at the end.
 */
function prune<T extends { version: number }>(versions: T[]): T[] {
  if (versions.length <= MAX_VERSIONS) return versions;
  return versions.slice(0, MAX_VERSIONS);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Save a new version snapshot for a prompt.
 *
 * Creates a version record with all required fields, appends it to the
 * existing versions array, prunes old entries beyond the 50-version cap,
 * and writes back to localStorage. Returns the created version or null
 * on storage failure.
 */
export function savePromptVersion(
  promptId: string,
  versionNumber: number,
  title: string,
  markdown: string,
  content: PromptSections
): PromptVersion | null {
  const now = new Date().toISOString();
  let attempts = 0;

  while (attempts < 3) {
    try {
      const existing = readVersions(promptId);
      const computedVersion = Math.max(...existing.map((v) => v.version), 0) + 1;

      const version: PromptVersion = {
        id: crypto.randomUUID(),
        promptId,
        version: computedVersion,
        title,
        markdown,
        content,
        createdAt: now,
      };

      existing.unshift(version);
      const pruned = prune(existing);
      writeVersions(promptId, pruned);
      return version;
    } catch {
      // retry on storage failure (e.g. quota), up to 3 times
      attempts++;
      if (attempts >= 3) return null;
    }
  }

  return null;
}

/**
 * Return all versions for a prompt, filtered and ordered newest-first.
 * Malformed entries are silently skipped.
 */
export function getPromptVersions(
  promptId: string
): PromptVersion[] {
  const all = readVersions(promptId);
  return all.filter(isValidVersion);
}

/**
 * Return a single version by ID, or null if not found.
 */
export function getPromptVersion(
  promptId: string,
  versionId: string
): PromptVersion | null {
  const versions = getPromptVersions(promptId);
  return versions.find((v) => v.id === versionId) ?? null;
}

/**
 * Restore a version by creating a new snapshot.
 *
 * This updates the canonical prompt and records a new version entry
 * (auditable restore) rather than silently overwriting content.
 *
 * Accepts callback parameters to avoid importing from store.ts.
 */
export function restorePromptVersion(
  promptId: string,
  versionId: string,
  options: {
    getCurrPrompt: (id: string) => Prompt | null;
    updatePrompt: (id: string, updates: Partial<Prompt>) => Prompt | null;
    getLatestVersionNumber: (promptId: string) => number;
  }
): Prompt | null {
  const target = getPromptVersion(promptId, versionId);
  if (!target) return null;

  const curr = options.getCurrPrompt(promptId);
  if (!curr) return null;

  const nextVersion = options.getLatestVersionNumber(promptId) + 1;

  const restored = options.updatePrompt(promptId, {
    title: target.title,
    content: target.content,
  });

  if (!restored) return null;

  // Create an auditable snapshot of the restore.
  savePromptVersion(promptId, nextVersion, `Restored #${target.version}`, target.markdown, target.content);

  return restored;
}

/**
 * Compute a line-level diff between two version snapshots using
 * an LCS (Longest Common Subsequence) algorithm.
 *
 * Returns a deterministic PromptDiff with added / removed / unchanged lines.
 */
export function comparePromptVersions(left: PromptVersion, right: PromptVersion): PromptDiff {
  return computeDiff(left.markdown, right.markdown);
}

/**
 * Compute a line-level diff between two markdown strings using LCS.
 */
export function computeDiff(leftMarkdown: string, rightMarkdown: string): PromptDiff {
  const leftLines = leftMarkdown.split("\n");
  const rightLines = rightMarkdown.split("\n");

  const m = leftLines.length;
  const n = rightLines.length;

  if (m === 0 && n === 0) {
    return { lines: [] };
  }

  // Build LCS table (row-major, capped for large documents).
  const MAX_CELLS = 100_000;
  const rows = Math.min(m, Math.floor(MAX_CELLS / Math.max(n, 1))) + 1;

  const dp: number[][] = [];
  for (let i = 0; i <= rows - 1; i++) {
    dp[i] = new Array(n + 1).fill(0);
  }

  for (let i = 1; i < rows - 1 || (i <= m && n > 0); i++) {
    // Safety: only populate rows up to the cap.
    if (i > m) break;
    for (let j = 1; j <= n; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j] ?? 0, dp[i][j - 1] ?? 0);
      }
    }
  }

  // Walk the table backwards to produce the diff.
  const result: PromptDiffLine[] = [];
  let i = Math.min(rows - 1, m);
  let j = n;

  // If we capped rows, handle the remaining left lines as removed.
  if (i < m) {
    for (let k = i + 1; k <= m; k++) {
      result.push({
        type: "removed",
        content: leftLines[k - 1],
        oldLineNumber: k,
      });
    }
    i = Math.min(rows - 2, m);
  }

  while (i > 0 && j > 0) {
    if (leftLines[i - 1] === rightLines[j - 1]) {
      result.push({
        type: "unchanged",
        content: leftLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if ((dp[i - 1][j] ?? 0) >= (dp[i][j - 1] ?? 0)) {
      result.push({
        type: "removed",
        content: leftLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    } else {
      result.push({
        type: "added",
        content: rightLines[j - 1],
        newLineNumber: j,
      });
      j--;
    }
  }

  // Remaining left lines are removed.
  while (i > 0) {
    result.push({
      type: "removed",
      content: leftLines[i - 1],
      oldLineNumber: i,
    });
    i--;
  }

  // Remaining right lines are added.
  while (j > 0) {
    result.push({
      type: "added",
      content: rightLines[j - 1],
      newLineNumber: j,
    });
    j--;
  }

  result.reverse();
  return { lines: result };
}

import type { Agent, AgentVersion, Tool, Skill } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single field-level diff between version and current agent state. */
export type FieldDiff<V extends string = string> = {
  field: V;
  status: "same" | "changed" | "added" | "removed";
  versionValue: string | undefined;
  currentValue: string | undefined;
};

/** Array of scalar field diffs for name, description, model. */
export type ScalarDiffResult = FieldDiff<keyof Pick<AgentVersion, "name" | "description" | "model">>[];

/** A line-level diff entry (added or removed line). */
export type PromptDiff = {
  status: "added" | "removed";
  line: string;
};

/** Collection diff: items added to / removed from the collection by id. */
export type CollectionDiff<T extends { id: string }> = {
  added: (T & { diffStatus: "added" })[];
  removed: (T & { diffStatus: "removed" })[];
};

/** Composite result returned by compareVersion for UI rendering. */
export type VersionComparison = {
  name: FieldDiff<"name">;
  description: FieldDiff<"description">;
  model: FieldDiff<"model">;
  promptDiffs: PromptDiff[];
  toolDiffs: CollectionDiff<Tool>;
  skillDiffs: CollectionDiff<Skill>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the diff status between two string values.
 *
 * Returns:
 *   'same'       — both equal (including both empty/undefined)
 *   'changed'    — both differ and are non-empty
 *   'added'      — version is empty/undefined, current is non-empty
 *   'removed'    — version is non-empty, current is empty/undefined
 */
function scalarStatus(
  versionValue: string | undefined,
  currentValue: string | undefined
): "same" | "changed" | "added" | "removed" {
  const vEmpty = versionValue == null || versionValue === "";
  const cEmpty = currentValue == null || currentValue === "";

  if (vEmpty && cEmpty) return "same";
  if (vEmpty) return "added";
  if (cEmpty) return "removed";
  if (versionValue === currentValue) return "same";
  return "changed";
}

// ---------------------------------------------------------------------------
// 1. Scalar field diff
// ---------------------------------------------------------------------------

/**
 * Compare scalar fields (name, description, model) between an
 * `AgentVersion` snapshot and the current `Agent` configuration.
 *
 * @param version — version snapshot
 * @param current — current agent config
 * @param fields  — which fields to compare
 * @returns array of field-level diffs
 */
export function diffScalarFields(
  version: AgentVersion,
  current: Agent,
  fields: Array<keyof Pick<AgentVersion, "name" | "description" | "model">>
): ScalarDiffResult {
  return fields.map((field) => ({
    field,
    status: scalarStatus(version[field], current[field]),
    versionValue: version[field],
    currentValue: current[field],
  }));
}

// ---------------------------------------------------------------------------
// 2. Line-based system-prompt diff
// ---------------------------------------------------------------------------

/**
 * Compute a line-based diff between two prompt strings.
 *
 * Uses a simple set-based approach: a line present in one version but not
 * the other is treated as an addition or removal.  This means line
 * reordering without content changes is **not** detected — documented as
 * an MVP limitation.
 *
 * @param versionPrompt  — prompt text from the version snapshot (may be empty/undefined)
 * @param currentPrompt  — prompt text from the current agent config
 * @returns array of `{ status: 'added' | 'removed', line: string }`
 */
export function diffSystemPrompt(
  versionPrompt: string,
  currentPrompt: string
): PromptDiff[] {
  // If version prompt is empty/undefined, the whole current prompt is "added"
  const versionEmpty = versionPrompt == null || versionPrompt === "";
  if (versionEmpty) {
    return currentPrompt
      .split("\n")
      .filter((l) => l !== "")
      .map((line) => ({ status: "added" as const, line }));
  }

  // If current prompt is empty/undefined, the whole version prompt is "removed"
  const currentEmpty = currentPrompt == null || currentPrompt === "";
  if (currentEmpty) {
    return versionPrompt
      .split("\n")
      .filter((l) => l !== "")
      .map((line) => ({ status: "removed" as const, line }));
  }

  const versionLines = new Set(versionPrompt.split("\n"));
  const currentLines = new Set(currentPrompt.split("\n"));

  const diffs: PromptDiff[] = [];

  // Added: lines in current but not in version, preserving current order
  for (const line of currentPrompt.split("\n")) {
    if (line !== "" && !versionLines.has(line)) {
      diffs.push({ status: "added", line });
    }
  }

  // Removed: lines in version but not in current
  for (const line of versionPrompt.split("\n")) {
    if (line !== "" && !currentLines.has(line)) {
      diffs.push({ status: "removed", line });
    }
  }

  return diffs;
}

// ---------------------------------------------------------------------------
// 3. ID-based collection diff (tools / skills)
// ---------------------------------------------------------------------------

/**
 * Compare two collections of items that have stable `id` fields.
 * Returns items present only in the current collection (added) and
 * items present only in the version collection (removed).
 *
 * @param versionItems  — items from the version snapshot
 * @param currentItems  — items from the current agent config
 * @param labelField    — field name used as a human-readable label (e.g. "name")
 * @returns collection diff with `added` and `removed` arrays
 */
export function diffCollection<T extends { id: string }>(
  versionItems: T[],
  currentItems: T[],
  labelField: keyof T = "name" as keyof T
): CollectionDiff<T> {
  const versionIds = new Set<string>();
  versionItems.forEach((item) => versionIds.add(item.id));

  const currentIds = new Set<string>();
  currentItems.forEach((item) => currentIds.add(item.id));

  const added: (T & { diffStatus: "added" })[] = [];
  const removed: (T & { diffStatus: "removed" })[] = [];

  for (const item of currentItems) {
    if (!versionIds.has(item.id)) {
      added.push({ ...item, diffStatus: "added" });
    }
  }

  for (const item of versionItems) {
    if (!currentIds.has(item.id)) {
      removed.push({ ...item, diffStatus: "removed" });
    }
  }

  return { added, removed };
}

// ---------------------------------------------------------------------------
// 4. Composite comparison
// ---------------------------------------------------------------------------

/**
 * Compare an `AgentVersion` snapshot against a current `Agent` config and
 * return a complete `VersionComparison` result suitable for UI rendering.
 *
 * @param version — version snapshot
 * @param current — current agent config
 * @returns full version comparison object
 */
export function compareVersion(
  version: AgentVersion,
  current: Agent
): VersionComparison {
  return {
    name: {
      field: "name",
      status: scalarStatus(version.name, current.name),
      versionValue: version.name,
      currentValue: current.name,
    },
    description: {
      field: "description",
      status: scalarStatus(version.description, current.description),
      versionValue: version.description,
      currentValue: current.description,
    },
    model: {
      field: "model",
      status: scalarStatus(version.model, current.model),
      versionValue: version.model,
      currentValue: current.model,
    },
    promptDiffs: diffSystemPrompt(version.system_prompt, current.system_prompt),
    toolDiffs: diffCollection<Tool>(version.tools ?? [], current.tools ?? [], "name"),
    skillDiffs: diffCollection<Skill>(version.skills ?? [], current.skills ?? [], "name"),
  };
}
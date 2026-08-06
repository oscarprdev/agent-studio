import type { CreateSkillInput } from "@/lib/skills/types";

/**
 * Mock AI skill generator. This is a deterministic, template-based stand-in
 * for a real AI provider. Given the same description, it always produces the
 * same structured output. Replace with a real API call when ready.
 *
 * Returns a Partial<CreateSkillInput> (name, description, instructions, tools)
 * — id, createdAt, updatedAt, and created_by are added by the store.
 */
export async function generateSkill(input: {
  description: string;
}): Promise<Partial<CreateSkillInput>> {
  await new Promise((r) => setTimeout(r, 800));

  const description = input.description.trim().slice(0, 500);

  if (!description) {
    return buildGeneric();
  }

  return buildSkill(description);
}

// ---------------------------------------------------------------------------
// Keyword extraction
// ---------------------------------------------------------------------------

const TOOL_KEYWORDS: Record<string, string> = {
  github: "GitHub",
  linear: "Linear",
  slack: "Slack",
  jira: "Jira",
  notion: "Notion",
  figma: "Figma",
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  postgresql: "PostgreSQL",
  mongodb: "MongoDB",
  redis: "Redis",
  "ci/cd": "CI/CD",
};

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildSkill(description: string): Partial<CreateSkillInput> {
  const lower = description.toLowerCase();

  return {
    name: extractName(description),
    description: extractDescription(description),
    instructions: buildInstructions(lower),
    tools: extractTools(lower),
  };
}

function buildGeneric(): Partial<CreateSkillInput> {
  return {
    name: "Untitled Skill",
    description: "Describe your needs",
    instructions: [
      "Analyze the problem domain",
      "Research existing solutions and patterns",
      "Design the solution approach",
    ].join("\n"),
    tools: ["GitHub", "VS Code", "Terminal"],
  };
}

function extractName(description: string): string {
  const words = description.split(/\s+/).slice(0, 6);
  const name = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return name.length > 60 ? name.slice(0, 60) + "…" : name;
}

function extractDescription(description: string): string {
  const sentenceMatch = description.match(/^[^.!?]+[.!?]/);
  if (sentenceMatch) {
    const sentence = sentenceMatch[0].trim();
    return sentence.length > 100 ? sentence.slice(0, 100) + "…" : sentence;
  }
  return description.length > 100
    ? description.slice(0, 100) + "…"
    : description;
}

function buildInstructions(lower: string): string {
  const steps: string[] = [];

  if (lower.includes("test") || lower.includes("qa")) {
    steps.push("Analyze requirements and define test cases");
    steps.push("Review existing code and test coverage");
    steps.push("Implement changes with comprehensive tests");
    steps.push("Validate results and document findings");
  } else if (lower.includes("design") || lower.includes("ui")) {
    steps.push("Review requirements and user stories");
    steps.push("Create wireframes and design mockups");
    steps.push("Implement the interface with component composition");
    steps.push("Test across devices and gather feedback");
  } else if (lower.includes("review") || lower.includes("audit")) {
    steps.push("Define review criteria and standards");
    steps.push("Systematically analyze each component");
    steps.push("Document findings with specific examples");
    steps.push("Provide actionable improvement recommendations");
  } else if (lower.includes("deploy") || lower.includes("release")) {
    steps.push("Verify build succeeds and tests pass");
    steps.push("Check environment configuration and secrets");
    steps.push("Execute deployment process");
    steps.push("Validate deployment in target environment");
  } else {
    steps.push("Analyze the problem and gather requirements");
    steps.push("Research existing patterns and solutions");
    steps.push("Implement the solution step by step");
    steps.push("Test and validate the implementation");
  }

  return steps.join("\n");
}

function extractTools(lower: string): string[] {
  const found: string[] = [];
  for (const [keyword, label] of Object.entries(TOOL_KEYWORDS)) {
    if (lower.includes(keyword)) {
      found.push(label);
    }
  }
  return found.length > 0
    ? [...new Set(found)]
    : ["GitHub", "VS Code", "Terminal"];
}

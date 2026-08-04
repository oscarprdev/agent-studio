import type { SkillContent } from "@/lib/skills/types";

/**
 * Mock AI skill generator. This is a deterministic, template-based stand-in
 * for a real AI provider. Given the same description, it always produces the
 * same structured output. Replace with a real API call when ready.
 */
export async function generateSkill(input: {
  description: string;
}): Promise<SkillContent> {
  await new Promise((r) => setTimeout(r, 800));

  const description = input.description.trim().slice(0, 500);

  if (!description) {
    return buildGenericSkillContent();
  }

  return buildSkillContent(description);
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

function buildSkillContent(description: string): SkillContent {
  const lower = description.toLowerCase();

  const name = extractName(description);
  const descriptionText = extractDescription(description);
  const instructions = buildInstructions(lower);
  const triggers = extractTriggers(lower);
  const tools = extractTools(lower);
  const expectedOutput = extractExpectedOutput(lower);
  const rules = buildRules(lower);

  return {
    name,
    description: descriptionText,
    instructions,
    triggers,
    tools,
    expectedOutput,
    rules,
  };
}

function buildGenericSkillContent(): SkillContent {
  return {
    name: "Untitled Skill",
    description: "Describe your needs",
    instructions: [
      "Analyze the problem domain",
      "Research existing solutions and patterns",
      "Design the solution approach",
    ].join("\n"),
    triggers: ["when asked to help", "on request"],
    tools: ["GitHub", "VS Code", "Terminal"],
    expectedOutput: "Markdown report",
    rules: [
      "Follow established best practices",
      "Write clear, maintainable, and well-documented code",
      "Consider edge cases and error handling",
    ].join("\n"),
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

function extractTriggers(lower: string): string[] {
  const triggers: string[] = [];

  if (lower.includes("review") || lower.includes("audit")) {
    triggers.push("when reviewing code", "on pull request");
  } else if (lower.includes("test")) {
    triggers.push("when writing tests", "on code change");
  } else if (lower.includes("deploy") || lower.includes("release")) {
    triggers.push("when deploying", "on release");
  } else if (lower.includes("design") || lower.includes("ui")) {
    triggers.push("when designing UI", "on feature request");
  } else {
    triggers.push("when asked to help", "on request");
  }

  return triggers;
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

function extractExpectedOutput(lower: string): string {
  if (lower.includes("report")) return "Markdown report";
  if (lower.includes("checklist")) return "Markdown checklist";
  if (lower.includes("summary")) return "Markdown summary";
  if (lower.includes("table")) return "Markdown table";
  if (lower.includes("json")) return "JSON report";
  if (lower.includes("csv")) return "CSV report";
  return "Markdown report";
}

function buildRules(lower: string): string {
  const rules: string[] = [
    "Follow established best practices and conventions",
    "Write clear, maintainable, and well-documented code",
  ];

  if (lower.includes("security")) {
    rules.push("Prioritize security and validate all inputs");
  } else if (lower.includes("performance")) {
    rules.push("Optimize for performance and minimize resource usage");
  } else {
    rules.push("Consider edge cases and error handling");
  }

  return rules.join("\n");
}

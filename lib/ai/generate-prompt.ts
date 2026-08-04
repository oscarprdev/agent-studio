import type { PromptSections } from "@/lib/prompts/types";

/**
 * Mock AI prompt generator. This is a deterministic, template-based stand-in
 * for a real AI provider. Given the same description, it always produces the
 * same structured output. Replace with a real API call when ready.
 */
export async function generatePrompt(
  description: string,
): Promise<PromptSections> {
  await new Promise((r) => setTimeout(r, 800));

  const input = description.trim().slice(0, 500);

  if (!input) {
    return buildGenericSections();
  }

  return buildSections(input);
}

// ---------------------------------------------------------------------------
// Keyword extraction
// ---------------------------------------------------------------------------

const ROLE_WORDS = [
  "engineer",
  "reviewer",
  "analyst",
  "developer",
  "designer",
  "tester",
  "manager",
  "architect",
  "lead",
  "consultant",
] as const;

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

const OUTPUT_KEYWORDS: Record<string, string> = {
  "markdown report": "Markdown report",
  "json report": "JSON report",
  csv: "CSV report",
  "html report": "HTML report",
  spreadsheet: "Spreadsheet",
  presentation: "Presentation",
  "pdf report": "PDF report",
  summary: "Markdown summary",
  table: "Markdown table",
  checklist: "Markdown checklist",
};

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildSections(input: string): PromptSections {
  const lower = input.toLowerCase();

  const role = extractRole(lower);
  const objective = cleanObjective(input);
  const tools = extractTools(lower);
  const workflow = buildWorkflow(lower, role);
  const rules = buildRules(role).join("\n");
  const output = extractOutput(lower);

  return { role, objective, tools, workflow, rules, output };
}

function buildGenericSections(): PromptSections {
  return {
    role: "Senior Software Engineer",
    objective: "Describe your needs",
    tools: ["GitHub", "VS Code", "Terminal"],
    workflow: [
      "Understand the problem domain",
      "Research existing solutions and patterns",
      "Design the solution approach",
      "Implement and validate",
    ],
    rules: [
      "Follow established coding standards and conventions",
      "Write clear, maintainable, and well-documented code",
      "Consider edge cases and error handling",
    ].join("\n"),
    output: "Markdown report",
  };
}

function extractRole(lower: string): string {
  for (const word of ROLE_WORDS) {
    if (lower.includes(word)) {
      return capitalize(word);
    }
  }
  return "Senior Software Engineer";
}

function cleanObjective(input: string): string {
  const cleaned = input
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 200 ? cleaned.slice(0, 200) + "…" : cleaned;
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

function buildWorkflow(lower: string, role: string): string[] {
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
  } else {
    steps.push("Analyze the problem and gather requirements");
    steps.push("Research existing patterns and solutions");
    steps.push(`Implement the solution as ${role.toLowerCase()}`);
    steps.push("Test and validate the implementation");
    steps.push("Document decisions and outcomes");
  }

  return steps;
}

function buildRules(role: string): string[] {
  return [
    `Follow established ${role.toLowerCase()} best practices`,
    "Write clear, maintainable, and well-documented code",
    "Consider edge cases, error handling, and performance implications",
  ];
}

function extractOutput(lower: string): string {
  for (const [keyword, label] of Object.entries(OUTPUT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return label;
    }
  }
  return "Markdown report";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

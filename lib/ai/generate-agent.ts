import type { AgentDefinition, Skill, Tool } from "@/lib/agents/types";

/**
 * Mock AI agent generation function.
 *
 * This is a deterministic, template-based generator that simulates what a real
 * AI provider (OpenAI, Anthropic, etc.) would do. The function signature
 * matches what a real provider would use, making a future API swap trivial.
 *
 * For production use, replace this function with an actual AI API call that
 * follows the same interface contract.
 *
 * @param input - Agent generation input
 * @param input.goal - Natural language description of what the agent should do
 * @param input.tools - MCP tools available to the agent
 * @param input.skills - Skills to include in the agent
 * @param input.context - Additional context (repo docs, coding conventions, etc.)
 * @returns Promise resolving to a complete AgentDefinition
 */
export async function generateAgent(input: {
  goal: string;
  tools: Tool[];
  skills: Skill[];
  context: string;
}): Promise<AgentDefinition> {
  await new Promise((r) => setTimeout(r, 1200));

  const goal = input.goal.length > 500 ? input.goal.slice(0, 500) : input.goal;
  const trimmedGoal = goal.trim();
  const isEmpty = trimmedGoal.length === 0;

  const name = isEmpty ? "Agent" : extractName(trimmedGoal);
  const description = isEmpty
    ? "Describe your agent's purpose"
    : extractDescription(trimmedGoal);
  const model = isEmpty ? "claude-sonnet-4-20250514" : extractModel(trimmedGoal);
  const systemPrompt = buildSystemPrompt(trimmedGoal, input.tools, input.skills, input.context, isEmpty);
  const skills = isEmpty ? generateDefaultSkills(trimmedGoal) : input.skills;
  const tools = input.tools;

  return { name, description, model, system_prompt: systemPrompt, skills, tools };
}

const ROLE_WORDS = [
  "review",
  "write",
  "generate",
  "analyze",
  "monitor",
  "manage",
  "deploy",
  "test",
  "debug",
  "optimize",
  "design",
  "create",
  "build",
  "fix",
  "search",
  "summarize",
  "translate",
  "organize",
  "automate",
  "track",
];

const MODEL_MAP: Record<string, string> = {
  "gpt-4": "gpt-4",
  "gpt-4o": "gpt-4o",
  "gpt-4-turbo": "gpt-4-turbo",
  "gpt-3.5": "gpt-3.5-turbo",
  "claude-sonnet": "claude-sonnet-4-20250514",
  "claude-opus": "claude-opus-4-20250514",
  "claude-haiku": "claude-haiku-4-20250514",
  "gemini": "gemini-1.5-pro",
};

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

function extractName(goal: string): string {
  const lower = goal.toLowerCase();
  for (const word of ROLE_WORDS) {
    if (lower.includes(word)) {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
      return `${capitalized} Agent`;
    }
  }
  return "Agent";
}

function extractDescription(goal: string): string {
  const cleaned = goal.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 100) return cleaned;
  return cleaned.slice(0, 97) + "...";
}

function extractModel(goal: string): string {
  const lower = goal.toLowerCase();
  for (const [key, model] of Object.entries(MODEL_MAP)) {
    if (lower.includes(key)) return model;
  }
  return DEFAULT_MODEL;
}

function buildSystemPrompt(
  goal: string,
  tools: Tool[],
  skills: Skill[],
  context: string,
  isEmpty: boolean,
): string {
  const role = isEmpty ? "general assistant" : goal.split(/[.!?]/)[0]?.trim() || "general assistant";
  const objective = isEmpty
    ? "Describe your agent's purpose"
    : goal.slice(0, 300);

  const toolNames = tools.length > 0
    ? tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
    : "- No external tools configured";

  const skillNames = skills.length > 0
    ? skills.map((s) => `- ${s.name}: ${s.description}`).join("\n")
    : "- No specific skills configured";

  const workflow = isEmpty
    ? "Await user input, analyze request, and respond with helpful information."
    : "1. Receive and analyze the user request\n2. Identify relevant tools and skills\n3. Execute the task using available resources\n4. Return a structured response";

  const rules = [
    "- Always respond with accurate, well-structured information",
    "- Use available tools when they can improve the response",
    "- Flag any ambiguities in the request before proceeding",
    context ? `- Consider the provided context: ${context.slice(0, 200)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `## ROLE\n${role}\n\n## OBJECTIVE\n${objective}\n\n## TOOLS\n${toolNames}\n\n## SKILLS\n${skillNames}\n\n## WORKFLOW\n${workflow}\n\n## RULES\n${rules}`;
}

function generateDefaultSkills(goal: string): Skill[] {
  const lower = goal.toLowerCase();
  const skills: Skill[] = [];

  if (lower.includes("review") || lower.includes("code")) {
    skills.push({
      id: crypto.randomUUID(),
      name: "Code Review",
      description: "Analyze code for quality, bugs, and best practices",
      instructions: "Review code changes, identify issues, and suggest improvements.",
      tools: [],
    });
  }

  if (lower.includes("test")) {
    skills.push({
      id: crypto.randomUUID(),
      name: "Test Generation",
      description: "Create unit and integration tests",
      instructions: "Generate test cases based on code analysis.",
      tools: [],
    });
  }

  if (lower.includes("document") || lower.includes("doc")) {
    skills.push({
      id: crypto.randomUUID(),
      name: "Documentation",
      description: "Write and maintain documentation",
      instructions: "Generate clear, concise documentation for code and APIs.",
      tools: [],
    });
  }

  if (skills.length === 0) {
    skills.push({
      id: crypto.randomUUID(),
      name: "General Assistance",
      description: "Provide helpful responses to user queries",
      instructions: "Analyze the user's request and provide accurate, helpful information.",
      tools: [],
    });
  }

  return skills;
}

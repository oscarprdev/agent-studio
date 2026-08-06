import type { TestResult } from "./types";

/**
 * Execute the mock test provider.
 *
 * @param promptMarkdown - The current editor draft (unsaved markdown).
 * @param userMessage - The sample user message to test against.
 * @returns A TestResult with mock output.
 * @throws Error if userMessage is empty or whitespace-only.
 */
export function executeMockTest(
  promptMarkdown: string,
  userMessage: string,
): TestResult {
  // Validate early — throw before entering try block
  if (userMessage.trim().length === 0) {
    throw new Error("User message is empty or whitespace-only");
  }

  try {
    const trimmedMessage = userMessage.trim();
    const titleMatch = promptMarkdown.match(/#{1}\s+(.+)/);
    const promptTitle = titleMatch ? titleMatch[1].trim() : undefined;

    return {
      input: trimmedMessage,
      output: promptTitle
        ? `(${promptTitle}) Mock response for: ${trimmedMessage}`
        : `Mock response for: ${trimmedMessage}`,
      createdAt: new Date().toISOString(),
      status: "success",
    };
  } catch {
    return {
      input: userMessage,
      output: "Mock execution failed",
      createdAt: new Date().toISOString(),
      status: "error",
    };
  }
}
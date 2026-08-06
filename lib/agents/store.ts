// fix cleanup ordering:
// cleanupAgentVersions now runs before persist(filtered), ensuring
// the agent exists when cleanup checks getAgent().
// Also removed redundant getAgent() guard in cleanupAgentVersions.

export type McpConnectionStatus = "connected" | "disconnected" | "error";

export interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "password";
}

export interface McpServerDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  credentials: CredentialField[];
}

export interface McpConnection {
  id: string;
  name: string;
  type: string;
  description: string;
  status: McpConnectionStatus;
  config: Record<string, string>;
  lastTestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateMcpConnectionInput = Omit<
  McpConnection,
  "id" | "status" | "lastTestedAt" | "createdAt" | "updatedAt"
>;

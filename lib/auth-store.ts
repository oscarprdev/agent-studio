const AUTH_TOKEN_KEY = "auth_token";
const AUTH_CURRENT_USER_KEY = "auth_current_user";
const AUTH_WORKSPACE_KEY = "auth_workspace";
const AUTH_USERS_KEY = "auth_users";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Internal type for stored user record (includes mock password)
interface StoredUser extends User {
  password: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "developer" | "team" | "company";
  createdAt: string;
}

export interface AuthResult<T = void> {
  success: boolean;
  error?: string;
  result?: T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail on storage errors
  }
}

function getUsers(): User[] {
  return getItem<User[]>(AUTH_USERS_KEY) ?? [];
}

function setCookie(name: string, value: string): void {
  try {
    document.cookie = `${name}=${value}; path=/; max-age=86400`;
  } catch {
    // Cookie setting may fail in non-browser environments
  }
}

function removeCookie(name: string): void {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {
    // Cookie removal may fail in non-browser environments
  }
}

function cookieExists(name: string): boolean {
  try {
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${name}=`));
  } catch {
    return false;
  }
}

export function login(input: {
  email: string;
  password: string;
}): AuthResult {
  const { email, password } = input;

  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: "Invalid email format" };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }

  const allUsers = getItem<StoredUser[]>(AUTH_USERS_KEY) ?? [];
  const storedUser = allUsers.find((u) => u.email === email);
  if (!storedUser) {
    return { success: false, error: "No account found with this email" };
  }
  if (storedUser.password !== password) {
    return { success: false, error: "Invalid password" };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = storedUser;

  // Store current user
  if (!setItem(AUTH_CURRENT_USER_KEY, user)) {
    return { success: false, error: "Failed to store user data" };
  }

  const token = crypto.randomUUID();
  setCookie(AUTH_TOKEN_KEY, token);

  return { success: true };
}

export function signup(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): AuthResult<{ requiresOnboarding: boolean }> {
  const { email, password, confirmPassword } = input;

  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: "Invalid email format" };
  }
  if (!password || password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Account already exists" };
  }

  const newUser: User & { password: string } = {
    id: crypto.randomUUID(),
    email,
    name: email.split("@")[0],
    password,
    createdAt: new Date().toISOString(),
  };

  // Append to users array (including password for mock storage)
  const updatedUsers = [...users, newUser];
  if (!setItem(AUTH_USERS_KEY, updatedUsers)) {
    return { success: false, error: "Failed to store user data" };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = newUser;
  if (!setItem(AUTH_CURRENT_USER_KEY, userWithoutPassword)) {
    return { success: false, error: "Failed to store user data" };
  }

  const token = crypto.randomUUID();
  setCookie(AUTH_TOKEN_KEY, token);

  return { success: true, result: { requiresOnboarding: true } };
}

export function logout(): AuthResult {
  removeItem(AUTH_CURRENT_USER_KEY);
  removeItem(AUTH_WORKSPACE_KEY);
  removeCookie(AUTH_TOKEN_KEY);
  return { success: true };
}

export function getUser(): User | null {
  return getItem<User>(AUTH_CURRENT_USER_KEY);
}

export function getWorkspace(): Workspace | null {
  return getItem<Workspace>(AUTH_WORKSPACE_KEY);
}

export function isAuthenticated(): boolean {
  return cookieExists(AUTH_TOKEN_KEY) && getItem(AUTH_CURRENT_USER_KEY) !== null;
}

export function getToken(): string | null {
  try {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((c) => c.trim().startsWith(`${AUTH_TOKEN_KEY}=`));
    if (!tokenCookie) return null;
    return tokenCookie.split("=").slice(1).join("=");
  } catch {
    return null;
  }
}

export function updateWorkspace(input: {
  name?: string;
  plan?: "developer" | "team" | "company";
}): AuthResult<Workspace> {
  const { name, plan } = input;

  if (!name && !plan) {
    return { success: false, error: "No fields to update" };
  }

  const workspace = getWorkspace();
  if (!workspace) {
    return { success: false, error: "No workspace found" };
  }

  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Workspace name is required" };
    }
    if (name.length > 50) {
      return { success: false, error: "Workspace name must be 50 characters or less" };
    }
  }

  if (plan !== undefined && !["developer", "team", "company"].includes(plan)) {
    return { success: false, error: "Invalid plan" };
  }

  const updated: Workspace = {
    ...workspace,
    name: name !== undefined ? name.trim() : workspace.name,
    plan: plan !== undefined ? plan : workspace.plan,
  };

  if (!setItem(AUTH_WORKSPACE_KEY, updated)) {
    return { success: false, error: "Failed to store workspace data" };
  }

  return { success: true, result: updated };
}

export function createWorkspace(input: {
  name: string;
  plan: "developer" | "team" | "company";
}): AuthResult<Workspace> {
  const { name, plan } = input;

  if (!name || name.trim().length === 0) {
    return { success: false, error: "Workspace name is required" };
  }
  if (name.length > 50) {
    return { success: false, error: "Workspace name must be 50 characters or less" };
  }
  if (!["developer", "team", "company"].includes(plan)) {
    return { success: false, error: "Invalid plan" };
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name: name.trim(),
    slug,
    plan,
    createdAt: new Date().toISOString(),
  };

  if (!setItem(AUTH_WORKSPACE_KEY, workspace)) {
    return { success: false, error: "Failed to store workspace data" };
  }

  // Update current user with workspace reference
  const currentUser = getItem<User>(AUTH_CURRENT_USER_KEY);
  if (currentUser) {
    const updatedUser = { ...currentUser, workspaceId: workspace.id };
    setItem(AUTH_CURRENT_USER_KEY, updatedUser);

    // Update in auth_users array
    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], workspaceId: workspace.id } as User & { workspaceId?: string };
      setItem(AUTH_USERS_KEY, users);
    }
  }

  return { success: true, result: workspace };
}

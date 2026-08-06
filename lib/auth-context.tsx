"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  type AuthResult,
  type User,
  type Workspace,
  getUser as storeGetUser,
  getWorkspace as storeGetWorkspace,
  isAuthenticated as storeIsAuthenticated,
  login as storeLogin,
  signup as storeSignup,
  logout as storeLogout,
  createWorkspace as storeCreateWorkspace,
  updateWorkspace as storeUpdateWorkspace,
} from "@/lib/auth-store";

interface AuthContextValue {
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (email: string, password: string, confirm: string) => AuthResult<{ requiresOnboarding: boolean }>;
  logout: () => void;
  createWorkspace: (name: string, plan: "developer" | "team" | "company") => AuthResult<Workspace>;
  updateWorkspace: (input: { name?: string; plan?: "developer" | "team" | "company" }) => AuthResult<Workspace>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storeGetUser());
  const [workspace, setWorkspace] = useState<Workspace | null>(() => storeGetWorkspace());
  const [isAuthenticated, setIsAuthenticated] = useState(() => storeIsAuthenticated());

  const login = useCallback((email: string, password: string) => {
    const result = storeLogin({ email, password });
    if (result.success) {
      setUser(storeGetUser());
      setIsAuthenticated(storeIsAuthenticated());
    }
    return result;
  }, []);

  const signup = useCallback((email: string, password: string, confirm: string) => {
    const result = storeSignup({ email, password, confirmPassword: confirm });
    if (result.success) {
      setUser(storeGetUser());
      setIsAuthenticated(storeIsAuthenticated());
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
    setWorkspace(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  }, []);

  const createWorkspace = useCallback((name: string, plan: "developer" | "team" | "company") => {
    const result = storeCreateWorkspace({ name, plan });
    if (result.success) {
      setWorkspace(storeGetWorkspace());
    }
    return result;
  }, []);

  const updateWorkspace = useCallback((input: { name?: string; plan?: "developer" | "team" | "company" }) => {
    const result = storeUpdateWorkspace(input);
    if (result.success) {
      setWorkspace(storeGetWorkspace());
    }
    return result;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated,
        login,
        signup,
        logout,
        createWorkspace,
        updateWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

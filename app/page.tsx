"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            AI Agent Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Build AI agents that connect to your tools
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              Welcome back, {user?.name ?? "there"}
            </p>
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

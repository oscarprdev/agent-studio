"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

type Plan = "developer" | "team" | "company";

const PLANS: { value: Plan; label: string; description: string }[] = [
  { value: "developer", label: "Developer", description: "For individual developers" },
  { value: "team", label: "Team", description: "For small teams" },
  { value: "company", label: "Company", description: "For growing companies" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { createWorkspace } = useAuth();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateStep1(): boolean {
    if (!workspaceName.trim()) {
      setError("Workspace name is required");
      return false;
    }
    setError("");
    return true;
  }

  function validateStep2(): boolean {
    if (!selectedPlan) {
      setError("Please select a plan");
      return false;
    }
    setError("");
    return true;
  }

  function handleContinue() {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      createWorkspaceAndAdvance();
    }
  }

  function createWorkspaceAndAdvance() {
    if (!selectedPlan) return;

    setIsLoading(true);
    setError("");

    const result = createWorkspace(workspaceName.trim(), selectedPlan);
    setIsLoading(false);

    if (result.success) {
      setStep(3);
    } else {
      setError(result.error ?? "Failed to create workspace");
    }
  }

  function handleGoToDashboard() {
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className={step === 1 ? "font-medium text-foreground" : ""}>
          1/3
        </span>
        <span>→</span>
        <span className={step === 2 ? "font-medium text-foreground" : ""}>
          2/3
        </span>
        <span>→</span>
        <span className={step === 3 ? "font-medium text-foreground" : ""}>
          3/3
        </span>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workspace-name">Workspace Name</FieldLabel>
                <Input
                  id="workspace-name"
                  placeholder="My Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  autoFocus
                />
              </Field>

              {error && <FieldError>{error}</FieldError>}

              <Button onClick={handleContinue} className="w-full">
                Continue
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="flex flex-col gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setSelectedPlan(plan.value)}
                    className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                      selectedPlan === plan.value
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{plan.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.description}
                    </span>
                  </button>
                ))}
              </div>

              {error && <FieldError>{error}</FieldError>}

              <Button
                onClick={handleContinue}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-muted-foreground">
                Your workspace <span className="font-medium text-foreground">{workspaceName}</span> has been created. You&apos;re all set!
              </p>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

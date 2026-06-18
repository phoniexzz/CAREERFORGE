import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiRequest } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/accept-advisor-invite")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: AcceptAdvisorInvitePage,
});

function AcceptAdvisorInvitePage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    try {
      await apiRequest<AuthUser>("/auth/accept-advisor-invite", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setComplete(true);
    } catch (error) {
      toast.error("Invitation could not be accepted", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Join the advisor workspace"
      description="Choose a password to activate your trusted careers-team account."
    >
      {complete ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-9 text-brand" />
          <p className="mt-4 text-sm text-[#425968]">
            Your advisor account is active.
          </p>
          <Link to="/login">
            <Button className="mt-5">Continue to sign in</Button>
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="advisor-password" className="field-label">
              Password
            </Label>
            <PasswordInput
              id="advisor-password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={12}
              required
              disabled={!token}
            />
            <p className="text-xs leading-5 text-[#718590]">
              Use at least 12 characters and three character types.
            </p>
          </div>
          <Button className="w-full" type="submit" disabled={pending || !token}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Activate advisor account
          </Button>
          {!token && (
            <p className="text-sm text-[#9f332f]">
              This invitation link is missing its token.
            </p>
          )}
        </form>
      )}
    </AuthShell>
  );
}

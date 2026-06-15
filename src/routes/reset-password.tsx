import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiRequest } from "@/lib/api-client";

export const Route = createFileRoute("/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    try {
      await apiRequest<null>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setComplete(true);
    } catch (error) {
      toast.error("Password could not be reset", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      description="Reset links are single use and expire after a short period."
    >
      {complete ? (
        <p className="text-sm leading-6 text-[#425968]">
          Password updated.{" "}
          <Link to="/login" className="font-bold text-brand">
            Sign in
          </Link>
        </p>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password" className="field-label">
              New password
            </Label>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={12}
              required
              disabled={!token}
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending || !token}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

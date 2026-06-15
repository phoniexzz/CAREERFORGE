import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/recover-account")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: RecoverAccountPage,
});

function RecoverAccountPage() {
  const { token } = Route.useSearch();
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);

  const recover = async () => {
    if (!token) return;
    setPending(true);
    try {
      await apiRequest<AuthUser>("/auth/recover-account", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setComplete(true);
    } catch (error) {
      toast.error("Account could not be recovered", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Recover your account"
      description="Recovery is available until the scheduled deletion date."
    >
      {complete ? (
        <p className="text-sm leading-6 text-[#425968]">
          Your account is active again.{" "}
          <Link to="/login" className="font-bold text-brand">
            Sign in
          </Link>
        </p>
      ) : (
        <Button
          className="w-full"
          onClick={() => void recover()}
          disabled={pending || !token}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <RotateCcw className="size-4" />
          )}
          Recover account
        </Button>
      )}
    </AuthShell>
  );
}

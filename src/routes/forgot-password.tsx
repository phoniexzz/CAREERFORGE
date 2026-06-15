import { createFileRoute, Link } from "@tanstack/react-router";
import { LoaderCircle, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await apiRequest<null>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (error) {
      toast.error("Request failed", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description="We will send a short-lived reset link when the account exists."
    >
      {sent ? (
        <div className="text-sm leading-6 text-[#425968]">
          Check your email for the reset link. In local development, the link
          appears in the backend log.
          <Link to="/login" className="mt-5 block font-bold text-brand">
            Return to sign in
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="field-label">
              Email
            </Label>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

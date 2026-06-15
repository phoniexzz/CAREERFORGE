import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiRequest } from "@/lib/api-client";
import { type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await apiRequest<AuthUser>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ fullName, email, password }),
      });
      toast.success("Account created", {
        description: "Check your email for the verification link.",
      });
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error("Account could not be created", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="Email verification is required before Resume Studio opens."
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Full name" htmlFor="register-name">
          <Input
            id="register-name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </Field>
        <Field label="Email" htmlFor="register-email">
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field label="Password" htmlFor="register-password">
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={12}
            required
          />
          <p className="text-xs leading-5 text-[#718590]">
            Use at least 12 characters and three character types.
          </p>
        </Field>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <UserPlus className="size-4" />
          )}
          Create account
        </Button>
      </form>
      <p className="mt-5 border-t border-[#e1e8eb] pt-5 text-center text-xs text-[#607482]">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-brand">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="field-label">
        {label}
      </Label>
      {children}
    </div>
  );
}

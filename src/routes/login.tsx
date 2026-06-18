import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircle, LogIn, GraduationCap, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleQuickLogin = async (role: "student" | "advisor") => {
    setPending(true);
    try {
      const user = await login(role, "demo123");
      toast.success(`Logged in as ${role === "advisor" ? "Advisor" : "Student"}`);
      const requested = search.redirect;
      const destination =
        requested && isCompatibleRedirect(requested, user.role)
          ? requested
          : user.role === "advisor"
            ? "/advisor"
            : "/";
      await navigate({ to: destination });
    } catch (error) {
      toast.error("Sign in failed");
    } finally {
      setPending(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter a username or role to login.");
      return;
    }
    setPending(true);
    try {
      const user = await login(email, password || "demo123");
      const targetRole = user.role === "advisor" ? "Advisor" : "Student";
      toast.success(`Logged in as ${targetRole}`);
      const requested = search.redirect;
      const destination =
        requested && isCompatibleRedirect(requested, user.role)
          ? requested
          : user.role === "advisor"
            ? "/advisor"
            : "/";
      await navigate({ to: destination });
    } catch (error) {
      toast.error("Sign in failed", {
        description: error instanceof Error ? error.message : "Check your details.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to CareerForge AI"
      description="Enter your demo workspace. Passwords are not required."
    >
      {/* Demo helper banner */}
      <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
        <p className="font-semibold mb-1">✨ Demo Mode Active</p>
        <p>Type <strong>'student'</strong> or <strong>'advisor'</strong> to log in instantly. No password needed!</p>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <Field label="Username, Email or Role" htmlFor="login-email">
          <Input
            id="login-email"
            type="text" // Changed from email to text to prevent browser blocking simple 'student' string
            autoComplete="username"
            placeholder="e.g. student, advisor, or your name"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field label="Password (Optional)" htmlFor="login-password">
          <PasswordInput
            id="login-password"
            placeholder="Any password will work"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        
        <Button className="w-full mt-2" type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          Sign in
        </Button>
      </form>

      {/* Quick click options */}
      <div className="mt-6 border-t border-[#e1e8eb] pt-5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
          Or Select Demo Account
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => void handleQuickLogin("student")}
            disabled={pending}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#d9e2e7] bg-white text-xs font-semibold text-brand hover:bg-slate-50 transition cursor-pointer"
          >
            <GraduationCap className="size-4 text-brand" />
            Demo Student
          </button>
          <button
            type="button"
            onClick={() => void handleQuickLogin("advisor")}
            disabled={pending}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[#d9e2e7] bg-white text-xs font-semibold text-amber-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <ShieldAlert className="size-4 text-amber-500" />
            Demo Advisor
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

function isCompatibleRedirect(path: string, role: "student" | "advisor") {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  if (path === "/account") return true;
  return role === "advisor"
    ? path.startsWith("/advisor")
    : !path.startsWith("/advisor");
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import { type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/verify")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: VerifyPage,
});

function VerifyPage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"pending" | "success" | "error">(
    "pending",
  );

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    void apiRequest<AuthUser>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  return (
    <AuthShell
      title="Email verification"
      description="Confirming this email protects your saved career information."
    >
      <div className="text-center">
        {state === "pending" && (
          <LoaderCircle className="mx-auto size-8 animate-spin text-brand" />
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-9 text-brand" />
            <p className="mt-4 text-sm text-[#425968]">
              Your email is verified. Resume Studio is ready.
            </p>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="mx-auto size-9 text-[#b7791f]" />
            <p className="mt-4 text-sm text-[#425968]">
              This verification link is missing, invalid, or expired.
            </p>
          </>
        )}
        {state !== "pending" && (
          <Link to="/login">
            <Button className="mt-5">Continue to sign in</Button>
          </Link>
        )}
      </div>
    </AuthShell>
  );
}

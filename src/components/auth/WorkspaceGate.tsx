import { useLocation, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { ResumeBootstrap } from "./ResumeBootstrap";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/recover-account",
]);

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PATHS.has(location.pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      void navigate({
        to: "/login",
        search: { redirect: location.pathname },
        replace: true,
      });
    }
  }, [isPublic, loading, location.pathname, navigate, user]);

  if (isPublic) return children;
  if (loading || !user) {
    return (
      <div className="grid min-h-[calc(100vh-64px)] place-items-center bg-[#f4f7f8]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#607482]">
          <LoaderCircle className="size-4 animate-spin text-brand" />
          Opening your workspace
        </div>
      </div>
    );
  }

  return <ResumeBootstrap key={user.id}>{children}</ResumeBootstrap>;
}

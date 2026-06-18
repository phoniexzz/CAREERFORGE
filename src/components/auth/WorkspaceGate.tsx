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
  "/accept-advisor-invite",
]);
const MANAGER_PATHS = ["/advisor/team", "/advisor/analytics"];

function requiresAdvisorManager(pathname: string) {
  return MANAGER_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function WorkspaceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublic = PUBLIC_PATHS.has(location.pathname);
  const advisorRouteBlocked =
    user?.role === "advisor" &&
    ((!location.pathname.startsWith("/advisor") &&
      location.pathname !== "/account") ||
      (requiresAdvisorManager(location.pathname) && !user.canManageAdvisors));
  const studentRouteBlocked =
    user?.role === "student" && location.pathname.startsWith("/advisor");

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      void navigate({
        to: "/login",
        search: { redirect: location.pathname },
        replace: true,
      });
    }
  }, [isPublic, loading, location.pathname, navigate, user]);

  useEffect(() => {
    if (loading || !user || isPublic) return;
    if (user.role === "advisor") {
      if (
        !location.pathname.startsWith("/advisor") &&
        location.pathname !== "/account"
      ) {
        void navigate({ to: "/advisor", replace: true });
      } else if (
        requiresAdvisorManager(location.pathname) &&
        !user.canManageAdvisors
      ) {
        void navigate({ to: "/advisor", replace: true });
      }
      return;
    }
    if (location.pathname.startsWith("/advisor")) {
      void navigate({ to: "/", replace: true });
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
  if (advisorRouteBlocked || studentRouteBlocked) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7f8]">
        <LoaderCircle className="size-5 animate-spin text-brand" />
      </div>
    );
  }

  if (user.role === "advisor") return children;
  return <ResumeBootstrap key={user.id}>{children}</ResumeBootstrap>;
}

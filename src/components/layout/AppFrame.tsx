import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { AppNav } from "./AppNav";
import { AdvisorDesktopSidebar, AdvisorMobileHeader } from "./AdvisorSidebar";
import { DesktopSidebar, MobileWorkspaceHeader } from "./AppSidebar";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/recover-account",
  "/accept-advisor-invite",
]);

export function AppFrame({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.has(location.pathname);

  if (isPublic || loading || !user) {
    return (
      <div className="min-h-screen bg-background text-ink">
        <AppNav />
        {children}
      </div>
    );
  }

  if (user.role === "advisor") {
    return (
      <div className="min-h-screen bg-[#f7f5f1] text-ink lg:flex">
        <AdvisorDesktopSidebar />
        <div className="min-w-0 flex-1">
          <AdvisorMobileHeader />
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-ink lg:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
        <MobileWorkspaceHeader />
        {children}
      </div>
    </div>
  );
}

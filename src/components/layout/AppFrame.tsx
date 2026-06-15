import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useAuth } from "@/lib/auth";
import { AppNav } from "./AppNav";
import { DesktopSidebar, MobileWorkspaceHeader } from "./AppSidebar";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/recover-account",
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

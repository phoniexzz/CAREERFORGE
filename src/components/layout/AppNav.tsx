import { Link, useLocation } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileText,
  GraduationCap,
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useResumeStore } from "@/lib/resume-store";
import { useAuth } from "@/lib/auth";

export function AppNav() {
  const location = useLocation();
  const { user } = useAuth();
  const lastSavedAt = useResumeStore((s) => s.lastSavedAt);
  const syncState = useResumeStore((s) => s.syncState);
  const [savedLabel, setSavedLabel] = useState("Saved to account");

  useEffect(() => {
    if (!lastSavedAt) return;
    const date = new Date(lastSavedAt);
    setSavedLabel(
      `Saved ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    );
  }, [lastSavedAt]);

  const inWorkspace =
    location.pathname.startsWith("/cv") ||
    location.pathname.startsWith("/builder") ||
    location.pathname.startsWith("/review") ||
    location.pathname.startsWith("/finalize");
  const inAuth =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/verify" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/recover-account" ||
    location.pathname === "/accept-advisor-invite";

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-[#d9e2e7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#17364b] text-white">
              <GraduationCap className="size-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-[#142c3d]">
                Career Co-Pilot
              </div>
              <div className="text-[11px] font-medium text-[#6b7f8c]">
                University careers workspace
              </div>
            </div>
          </Link>

          <div className="hidden h-6 w-px bg-[#d9e2e7] md:block" />

          {!inAuth && (
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <FileText className="size-4 shrink-0 text-brand" />
              <span className="truncate font-semibold text-[#28485b]">
                Resume Studio
              </span>
              {inWorkspace && (
                <span className="hidden text-[#8495a0] lg:inline">
                  / Base CV
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {inWorkspace && (
            <div className="hidden items-center gap-1.5 text-xs font-medium text-[#607482] md:flex">
              <CheckCircle2 className="size-3.5 text-brand" />
              {syncState === "saving"
                ? "Saving"
                : syncState === "error"
                  ? "Save interrupted"
                  : savedLabel}
            </div>
          )}
          <div className="hidden items-center gap-1.5 border-l border-[#d9e2e7] pl-3 text-xs font-medium text-[#607482] sm:flex">
            <LockKeyhole className="size-3.5" />
            Private by default
          </div>
          {inWorkspace && (
            <Link
              to="/finalize"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#17364b] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#244b63]"
            >
              Export
            </Link>
          )}
          {user ? (
            <Link
              to="/account"
              className="inline-flex size-9 items-center justify-center rounded-md border border-[#d9e2e7] bg-white text-[#425968] hover:border-brand hover:text-brand"
              aria-label="Account"
              title={user.email}
            >
              <UserRound className="size-4" />
            </Link>
          ) : (
            !inAuth && (
              <Link
                to="/login"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#17364b] px-3 text-xs font-semibold text-white"
              >
                <LogIn className="size-3.5" />
                Sign in
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

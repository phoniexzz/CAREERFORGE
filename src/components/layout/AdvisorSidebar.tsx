import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  Menu,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length) {
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function AdvisorNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const links = [
    {
      label: "Review Queue",
      description: "Claim and review CVs",
      to: "/advisor" as const,
      icon: ClipboardList,
      active:
        location.pathname === "/advisor" ||
        location.pathname === "/advisor/" ||
        location.pathname.startsWith("/advisor/reviews"),
    },
    ...(user?.canManageAdvisors
      ? [
          {
            label: "Analytics",
            description: "Anonymous pipeline trends",
            to: "/advisor/analytics" as const,
            icon: BarChart3,
            active: location.pathname === "/advisor/analytics",
          },
        ]
      : []),
    ...(user?.canManageAdvisors
      ? [
          {
            label: "Advisor Team",
            description: "Manage workspace access",
            to: "/advisor/team" as const,
            icon: Users,
            active: location.pathname === "/advisor/team",
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-full flex-col bg-[#101a2d] text-white">
      <Link
        to="/advisor"
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-white/10 px-6 py-6"
      >
        <span className="grid size-11 place-items-center rounded-xl bg-white text-[#101a2d]">
          <GraduationCap className="size-6" />
        </span>
        <span>
          <strong className="block text-base">CareerForge AI</strong>
          <span className="text-xs text-[#aab8cb]">Advisor Workspace</span>
        </span>
      </Link>

      <nav
        className="flex-1 space-y-2 px-3 py-6"
        aria-label="Advisor workspace"
      >
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition",
                item.active ? "bg-white/12" : "hover:bg-white/7",
              )}
            >
              <Icon className="size-5 text-[#dfe7f2]" />
              <span>
                <strong className="block text-sm">{item.label}</strong>
                <span className="text-[11px] text-[#aab8cb]">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <Link
          to="/account"
          onClick={onNavigate}
          className="flex items-center gap-3 border-t border-white/10 px-5 py-5 hover:bg-white/5"
        >
          <span className="grid size-10 place-items-center rounded-full bg-[#263550] text-xs font-bold">
            {initials(user.fullName, user.email)}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm">{user.fullName}</strong>
            <span className="block truncate text-xs text-[#aab8cb]">
              {user.canManageAdvisors ? "Advisor manager" : "Advisor"}
            </span>
          </span>
          {user.canManageAdvisors ? (
            <ShieldCheck className="size-4 text-[#9bc8a7]" />
          ) : (
            <UserRound className="size-4 text-[#aab8cb]" />
          )}
        </Link>
      )}
    </div>
  );
}

export function AdvisorDesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[276px] shrink-0 lg:block">
      <AdvisorNavigation />
    </aside>
  );
}

export function AdvisorMobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Link to="/advisor" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-[#101a2d] text-white">
            <GraduationCap className="size-5" />
          </span>
          <span>
            <strong className="block text-sm">CareerForge AI</strong>
            <span className="block text-[10px] text-muted-foreground">
              Advisor Workspace
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid size-10 place-items-center rounded-lg border bg-white"
          aria-label="Open advisor menu"
        >
          <Menu className="size-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close advisor menu"
          />
          <aside className="relative h-full w-[min(88vw,320px)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-lg bg-white/10"
              aria-label="Close advisor menu"
            >
              <X className="size-5" />
            </button>
            <AdvisorNavigation onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  GraduationCap,
  Home,
  Menu,
  Sparkles,
  UserRound,
  X,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const STUDENT_LINKS = [
  {
    label: "Home",
    subtext: "Today's focus",
    to: "/" as const,
    icon: Home,
    active: (pathname: string) => pathname === "/",
  },
  {
    label: "Base CV",
    subtext: "Verified profile",
    to: "/cv" as const,
    icon: FileText,
    active: (pathname: string) =>
      pathname === "/cv" ||
      pathname.startsWith("/builder") ||
      pathname.startsWith("/import") ||
      pathname.startsWith("/review") ||
      pathname.startsWith("/finalize"),
  },
  {
    label: "Match Jobs",
    subtext: "Find suitable roles",
    to: "/matchmaker" as const,
    icon: Briefcase,
    active: (pathname: string) => pathname.startsWith("/matchmaker"),
  },
  {
    label: "Tailor Application",
    subtext: "CV and cover letter",
    to: "/tailor" as const,
    icon: Sparkles,
    active: (pathname: string) => pathname.startsWith("/tailor"),
  },
];

const ADVISOR_LINKS = [
  {
    label: "Advisor Queue",
    subtext: "Review requests",
    to: "/advisor" as const,
    icon: Home,
    active: (pathname: string) =>
      pathname === "/advisor" ||
      (pathname.startsWith("/advisor") && !pathname.includes("/analytics") && !pathname.includes("/team")),
  },
  {
    label: "Pipeline Analytics",
    subtext: "University trends",
    to: "/advisor/analytics" as const,
    icon: BarChart3,
    active: (pathname: string) => pathname.startsWith("/advisor/analytics"),
  },
  {
    label: "Advisor Team",
    subtext: "Staff management",
    to: "/advisor/team" as const,
    icon: UserRound,
    active: (pathname: string) => pathname.startsWith("/advisor/team"),
  },
];


function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 0) {
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email.slice(0, 2).toUpperCase();
}

function SidebarContent({
  onNavigate,
  isCollapsed = false,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const location = useLocation();
  const { user } = useAuth();
  const links = user?.role === "advisor" ? ADVISOR_LINKS : STUDENT_LINKS;

  return (
    <div className="flex h-full flex-col bg-[#111c2e] text-white select-none">
      <div
        className={cn(
          "border-b border-white/10 py-7 transition-all duration-300",
          isCollapsed ? "px-3 flex justify-center" : "px-6",
        )}
      >
        <Link to="/" onClick={onNavigate} className="flex items-center">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#5aab73]">
            <GraduationCap className="size-7" />
          </div>
          <div
            className={cn(
              "transition-all duration-300 origin-left flex flex-col",
              isCollapsed
                ? "w-0 opacity-0 ml-0 overflow-hidden"
                : "w-auto opacity-100 ml-3",
            )}
          >
            <span className="text-lg font-bold tracking-tight whitespace-nowrap">
              Career Co-Pilot
            </span>
            <span className="text-xs text-[#a8bfd1] whitespace-nowrap">
              University Edition
            </span>
          </div>
        </Link>
      </div>

      <nav
        className={cn(
          "flex-1 py-7 transition-all duration-300",
          isCollapsed ? "px-2" : "px-3",
        )}
        aria-label="Workspace"
      >
        <p
          className={cn(
            "transition-all duration-300 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9db5c8] whitespace-nowrap overflow-hidden",
            isCollapsed ? "opacity-0 h-0 my-0 py-0" : "opacity-100 h-auto",
          )}
        >
          {user?.role === "advisor" ? "Advisor Portal" : "Student Workspace"}
        </p>
        <div
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "mt-0 space-y-2" : "mt-4 space-y-2",
          )}
        >
          {links.map((item) => {
            const active = item.active(location.pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-300 relative group",
                  isCollapsed
                    ? "px-0 justify-center w-12 mx-auto h-12"
                    : "px-3 w-full h-[52px]",
                  active
                    ? "bg-[#22314a] font-bold text-white"
                    : "hover:bg-white/7",
                )}
              >
                <Icon className={cn("shrink-0 text-[#dce9f2]", isCollapsed ? "size-5" : "size-5")} />
                <div
                  className={cn(
                    "transition-all duration-300 origin-left min-w-0 flex-1 flex flex-col ml-3",
                    isCollapsed
                      ? "w-0 opacity-0 ml-0 overflow-hidden"
                      : "w-auto opacity-100",
                  )}
                >
                  <span className="text-[14px] font-bold text-[#edf5fb] truncate leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[#a8bfd1] truncate font-medium mt-0.5 leading-none">
                    {item.subtext}
                  </span>
                </div>
                {isCollapsed && (
                  <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 z-50 bg-[#111c2e] text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-out">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Reset Demo Data Button */}
      <div className={cn("px-4 py-3 border-t border-white/10", isCollapsed ? "flex justify-center" : "")}>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className={cn(
            "flex items-center gap-2 text-xs text-[#a8bfd1] hover:text-white transition-colors cursor-pointer w-full py-1.5 rounded",
            isCollapsed ? "justify-center" : "px-2"
          )}
          title="Reset Demo Data"
        >
          <RefreshCw className="size-3.5" />
          {!isCollapsed && <span className="font-semibold">Reset Demo Data</span>}
        </button>
      </div>

      {user && (
        <Link
          to="/account"
          onClick={onNavigate}
          className={cn(
            "flex items-center border-t border-white/10 transition-all duration-300 relative group",
            isCollapsed
              ? "px-0 py-5 justify-center w-full"
              : "px-6 py-5 w-full",
          )}
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#1d2c45] text-sm font-semibold">
            {initials(user.fullName, user.email)}
          </div>
          <div
            className={cn(
              "transition-all duration-300 origin-left min-w-0 flex-1 flex flex-col",
              isCollapsed
                ? "w-0 opacity-0 ml-0 overflow-hidden"
                : "w-auto opacity-100 ml-3",
            )}
          >
            <span className="truncate text-sm font-bold whitespace-nowrap">
              {user.fullName || "Your account"}
            </span>
            <span className="truncate text-xs text-[#9db5c8] whitespace-nowrap">
              {user.email}
            </span>
          </div>
          <UserRound
            className={cn(
              "transition-all duration-300 shrink-0 text-[#9db5c8]",
              isCollapsed
                ? "w-0 opacity-0 ml-0 overflow-hidden"
                : "ml-auto size-4",
            )}
          />
          {isCollapsed && (
            <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 z-50 bg-[#111c2e] text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none group-hover:pointer-events-auto transition-all duration-200 ease-out">
              <div className="font-semibold">
                {user.fullName || "Your account"}
              </div>
              <div className="text-[10px] text-[#9db5c8] mt-0.5">
                {user.email}
              </div>
            </div>
          )}
        </Link>
      )}
    </div>
  );
}

export function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 lg:block transition-all duration-300 ease-in-out border-r border-[#d9e2e7]/10 relative",
        isCollapsed ? "w-[76px]" : "w-[276px]",
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} />

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute right-[-14px] top-9 z-50 flex size-7 items-center justify-center rounded-full border border-white/10 bg-[#111c2e] text-white shadow-md hover:bg-[#22314a] transition-all cursor-pointer group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-4 text-[#dce9f2] transition-transform duration-300 group-hover:text-white",
            isCollapsed ? "rotate-180" : "",
          )}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </aside>
  );
}

export function MobileWorkspaceHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#d9e2e7] bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#5aab73] text-white">
            <GraduationCap className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#142c3d]">Career Co-Pilot</p>
            <p className="text-[10px] font-medium text-[#6b7f8c]">
              University Edition
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-10 items-center justify-center rounded-lg border border-[#d9e2e7] text-[#17364b]"
          aria-label="Open workspace menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#08101c]/70"
            onClick={() => setOpen(false)}
            aria-label="Close workspace menu"
          />
          <aside className="relative h-full w-[min(88vw,320px)] shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white"
              aria-label="Close workspace menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

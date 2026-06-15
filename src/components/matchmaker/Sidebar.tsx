import { useState } from "react";
import { Bookmark, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeList: string;
  setActiveList: (list: string) => void;
  allCount: number;
  savedCount: number;
  appliedCount: number;
  selectedModes: string[];
  toggleMode: (mode: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  clearAll: () => void;
}

export function Sidebar({
  activeList,
  setActiveList,
  allCount,
  savedCount,
  appliedCount,
  selectedModes,
  toggleMode,
  selectedCategories,
  toggleCategory,
  clearAll,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("matchmaker-sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("matchmaker-sidebar-collapsed", String(next));
      return next;
    });
  };

  const lists = [
    { icon: CheckCircle2, label: "All Matches", count: allCount },
    { icon: Bookmark, label: "Saved", count: savedCount },
    { icon: Send, label: "Applied", count: appliedCount },
  ];
  const modes = ["remote", "hybrid", "on-site"];
  const categories = [
    "Strong Match",
    "Good Match",
    "Stretch Match",
    "Weak Match",
    "Low Match",
    "Needs Review",
    "Not Eligible",
  ];

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 border-r border-border bg-card transition-all duration-300 ease-in-out md:block",
        isCollapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Scrollable Content Wrapper */}
      <div className={cn(
        "h-full overflow-y-auto py-6 scrollbar-none",
        isCollapsed ? "px-2.5" : "px-4"
      )}>
        {/* Section: My Lists */}
        <p
          className={cn(
            "mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-opacity duration-200 whitespace-nowrap",
            isCollapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"
          )}
        >
          My lists
        </p>
        <nav className="mb-7 space-y-1">
          {lists.map((item) => {
            const active = item.label === activeList;
            return (
              <button
                key={item.label}
                onClick={() => setActiveList(item.label)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg py-2 text-sm transition relative group cursor-pointer",
                  isCollapsed ? "px-0 justify-center h-10" : "px-2.5",
                  active
                    ? "bg-primary/10 font-bold text-primary"
                    : "hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span
                    className={cn(
                      "transition-opacity duration-200 whitespace-nowrap",
                      isCollapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-xs text-muted-foreground transition-opacity duration-200",
                    isCollapsed ? "w-0 opacity-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  {item.count}
                </span>
                {/* Tooltip on hover when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 z-50 bg-[#111c2e] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-lg border border-white/10 whitespace-nowrap pointer-events-none transition-all duration-200 ease-out">
                    {item.label} ({item.count})
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Section: Filters */}
        <div
          className={cn(
            "transition-all duration-200 overflow-hidden",
            isCollapsed ? "opacity-0 h-0 my-0 py-0" : "opacity-100"
          )}
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Filters
            </span>
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear
            </button>
          </div>

          <FilterGroup
            title="Work mode"
            values={modes}
            selected={selectedModes}
            toggle={toggleMode}
          />
          <FilterGroup
            title="Match category"
            values={categories}
            selected={selectedCategories}
            toggle={toggleCategory}
          />
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute right-[-12px] top-6 z-50 flex size-6 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted transition-all cursor-pointer group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "size-3 text-muted-foreground transition-transform duration-300 group-hover:text-foreground",
            isCollapsed ? "rotate-180" : ""
          )}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </aside>
  );
}

function FilterGroup({
  title,
  values,
  selected,
  toggle,
}: {
  title: string;
  values: string[];
  selected: string[];
  toggle: (value: string) => void;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-2 text-xs font-bold">{title}</p>
      <div className="space-y-1">
        {values.map((value) => {
          const checked = selected.includes(value);
          return (
            <button
              key={value}
              onClick={() => toggle(value)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm capitalize hover:bg-muted cursor-pointer"
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded border transition-colors",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}
              >
                {checked && <span className="text-[10px]">✓</span>}
              </span>
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

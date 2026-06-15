import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { TailorStepProgress } from "@/components/tailoring/TailorStepProgress";
import { useResumeStore } from "@/lib/resume-store";
import { useTailoringStore } from "@/lib/tailoring/store";

export const Route = createFileRoute("/tailor")({
  head: () => ({
    meta: [
      { title: "Tailor Master - Career Co-Pilot" },
      {
        name: "description",
        content:
          "Tailor a saved Base CV and cover letter to a target job in seven focused steps.",
      },
    ],
  }),
  component: TailorLayout,
});

function TailorLayout() {
  const resumeId = useResumeStore((state) => state.resumeId);
  const data = useResumeStore((state) => state.data);
  const initialize = useTailoringStore((state) => state.initialize);
  const dataKey = JSON.stringify(data);

  useEffect(() => {
    initialize(`${resumeId ?? "local"}:${dataKey}`, data);
  }, [data, dataKey, initialize, resumeId]);

  return (
    <div className="min-h-screen bg-background pb-32 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur lg:top-0">
        <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Tailor Master
              </p>
              <p className="text-sm text-muted-foreground">
                Base CV to role-specific application
              </p>
            </div>
            <span className="rounded-full border border-[#d5e5e2] bg-primary-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              Prototype workflow
            </span>
          </div>
          <TailorStepProgress />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

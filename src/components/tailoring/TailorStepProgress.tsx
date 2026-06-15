import { Link, useRouterState } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { getStepIndex, TAILOR_STEPS } from "@/lib/tailoring/steps";

export function TailorStepProgress() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const currentIndex = getStepIndex(pathname);

  return (
    <div className="flex items-center mt-2">
      <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/80">
        {TAILOR_STEPS.map((step, index) => {
          const current = index === currentIndex;
          return (
            <Link
              key={step.id}
              to={step.to}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                current
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full font-mono text-[9px] font-bold",
                  current
                    ? "bg-primary-foreground/25 text-primary-foreground"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {step.id}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

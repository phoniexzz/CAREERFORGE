import { Check } from "lucide-react";

import { STEPS, type StepId } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

interface Props {
  current: StepId;
  onChange: (step: StepId) => void;
  disabled?: boolean;
}

export function StepProgress({ current, onChange, disabled = false }: Props) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <div className="sticky top-0 z-30 border-b border-[#d9e2e7] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1440px] overflow-x-auto px-4 sm:px-6">
        <div className="flex min-w-max items-center gap-1 py-3">
          {STEPS.map((step, index) => {
            const completed = index < currentIndex;
            const active = index === currentIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onChange(step.id)}
                disabled={disabled}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60",
                  active && "bg-[#17364b] text-white",
                  completed && "bg-[#e7f4f2] text-[#0f625e] hover:bg-[#dcefed]",
                  !active &&
                    !completed &&
                    "text-[#718590] hover:bg-[#edf1f3] hover:text-[#28485b]",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border text-[10px]",
                    active && "border-white/25 bg-white/10",
                    completed && "border-[#a8ceca] bg-white",
                    !active &&
                      !completed &&
                      "border-[#cbd7dd] bg-white text-[#718590]",
                  )}
                >
                  {completed ? <Check className="size-3" /> : index + 1}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { ArrowDown, ArrowUp, Check, Eye, EyeOff } from "lucide-react";

import { TEMPLATES } from "@/lib/templates";
import { useResumeStore } from "@/lib/resume-store";
import { type SectionKey } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

const LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  achievements: "Achievements",
  certifications: "Certifications",
};

export function TemplatePicker() {
  const template = useResumeStore((state) => state.template);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const layoutPreferences = useResumeStore((state) => state.layoutPreferences);
  const setLayoutPreferences = useResumeStore(
    (state) => state.setLayoutPreferences,
  );
  const layout = layoutPreferences[template];

  const toggle = (section: SectionKey) => {
    setLayoutPreferences({
      ...layoutPreferences,
      [template]: {
        ...layout,
        visible: {
          ...layout.visible,
          [section]: !layout.visible[section],
        },
      },
    });
  };
  const move = (region: string, section: SectionKey, direction: -1 | 1) => {
    const current = layout.regions[region];
    const index = current.indexOf(section);
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    const reordered = [...current];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];
    setLayoutPreferences({
      ...layoutPreferences,
      [template]: {
        ...layout,
        regions: { ...layout.regions, [region]: reordered },
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="w-16 shrink-0 text-[11px] font-bold text-[#607482]">
          Layout
        </p>
        <div className="grid flex-1 grid-cols-5 gap-2">
          {TEMPLATES.map((item) => {
            const active = item.id === template;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTemplate(item.id)}
                className={cn(
                  "relative flex h-12 items-center justify-center rounded-md border bg-white px-2 text-center text-[10px] font-semibold leading-tight text-[#607482] transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand-strong"
                    : "border-[#d9e2e7] hover:border-[#9cb8b5]",
                )}
                title={item.description}
              >
                {active && (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="size-2.5" />
                  </span>
                )}
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      <details className="rounded-md border border-[#d9e2e7] bg-[#f7fafb] px-3 py-2">
        <summary className="cursor-pointer text-[11px] font-bold text-[#425968]">
          Section order and visibility
        </summary>
        <div className="mt-2 space-y-2">
          {Object.entries(layout.regions).map(([region, sections]) => (
            <div key={region}>
              {Object.keys(layout.regions).length > 1 && (
                <p className="mb-1 text-[10px] font-bold uppercase text-[#718590]">
                  {region}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section, index) => (
                  <div
                    key={section}
                    className="flex items-center rounded border border-[#d9e2e7] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(section)}
                      className="flex h-7 items-center gap-1 px-2 text-[10px] font-semibold text-[#425968]"
                      title={`Toggle ${LABELS[section]}`}
                    >
                      {layout.visible[section] ? (
                        <Eye className="size-3" />
                      ) : (
                        <EyeOff className="size-3 text-[#91a2ac]" />
                      )}
                      {LABELS[section]}
                    </button>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(region, section, -1)}
                      className="grid size-7 place-items-center border-l border-[#e1e8eb] disabled:opacity-30"
                      aria-label={`Move ${LABELS[section]} earlier`}
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => move(region, section, 1)}
                      className="grid size-7 place-items-center border-l border-[#e1e8eb] disabled:opacity-30"
                      aria-label={`Move ${LABELS[section]} later`}
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

import { CheckCircle2, Info } from "lucide-react";

interface Props {
  overall: number;
  categories: { name: string; score: number }[];
}

export function ScoreDashboard({ overall, categories }: Props) {
  const status =
    overall >= 85
      ? "Strong foundation"
      : overall >= 65
        ? "Nearly ready"
        : "Needs attention";

  return (
    <section className="surface-panel overflow-hidden">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <div className="border-b border-[#d9e2e7] bg-[#17364b] p-6 text-white lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold text-[#a9d5d2]">
            Application readiness estimate
          </p>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-6xl font-bold leading-none">{overall}</span>
            <span className="pb-1 text-sm text-[#c6d5dc]">/100</span>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-[#76c6bf]" />
            {status}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#b9cbd4]">
            Improve the recommended items, then tailor this base CV to a
            specific opportunity.
          </p>
        </div>

        <div className="p-6">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="font-semibold text-[#425968]">
                    {normaliseCategory(category.name)}
                  </span>
                  <span className="font-bold text-[#17364b]">
                    {category.score}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e3e9ec]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2 border-t border-[#e1e8eb] pt-4 text-xs leading-5 text-[#718590]">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            This estimate supports decision-making; it does not predict hiring
            outcomes.
          </div>
        </div>
      </div>
    </section>
  );
}

function normaliseCategory(name: string) {
  return name === "ATS Score" ? "Structure" : name;
}

import { CheckCircle2, Lightbulb } from "lucide-react";

import { EXPERIENCE_TIPS } from "@/lib/mock-ai";

export function AIGuidancePanel({
  title = "Evidence checklist",
  tips = EXPERIENCE_TIPS,
}: {
  title?: string;
  tips?: string[];
}) {
  return (
    <aside className="rounded-md border border-[#cfe2e0] bg-[#f3f9f8] p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-[#174f50]">
        <Lightbulb className="size-4 text-brand" />
        {title}
      </div>
      <ul className="mt-3 grid gap-2 text-xs leading-5 text-[#4d696d] sm:grid-cols-2">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

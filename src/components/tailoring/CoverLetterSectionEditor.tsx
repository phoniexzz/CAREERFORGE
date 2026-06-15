import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editCoverLetterSection } from "@/lib/tailoring/mock-ai";
import type { CoverLetterSection } from "@/lib/tailoring/mock-data";
import { useTailoringStore } from "@/lib/tailoring/store";

const ACTIONS = [
  { id: "professional", label: "More professional" },
  { id: "shorter", label: "Shorter" },
  { id: "warmer", label: "Warmer" },
  { id: "evidence", label: "Stronger evidence" },
  { id: "business", label: "More business focused" },
  { id: "technical", label: "More technical" },
] as const;

export function CoverLetterSectionEditor({
  section,
}: {
  section: CoverLetterSection;
}) {
  const update = useTailoringStore((state) => state.updateCoverLetterSection);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(actionId: (typeof ACTIONS)[number]["id"]) {
    setBusy(actionId);
    const result = await editCoverLetterSection(
      section.id,
      section.content,
      actionId,
    );
    update(section.id, result.content);
    setBusy(null);
    toast(
      "Prototype action completed. Connect the AI service to rewrite text.",
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">{section.label}</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Editable
        </span>
      </div>
      <Textarea
        value={section.content}
        onChange={(event) => update(section.id, event.target.value)}
        className="mb-4 min-h-[120px] font-sans text-sm leading-relaxed"
      />
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant="outline"
            onClick={() => void run(action.id)}
            disabled={busy !== null}
            className="text-xs"
          >
            {busy === action.id && <Loader2 className="size-3 animate-spin" />}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

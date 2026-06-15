import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TailoringSuggestion } from "@/lib/tailoring/mock-data";
import { useTailoringStore } from "@/lib/tailoring/store";

export function UnsupportedClaimCard({
  suggestion,
}: {
  suggestion: TailoringSuggestion;
}) {
  const setStatus = useTailoringStore((state) => state.setSuggestionStatus);

  return (
    <div className="rounded-2xl border border-dashed border-warning/30 bg-warning/5 p-5">
      <div className="mb-3 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-warning">
            Unsupported claim - {suggestion.section}
          </p>
          <p className="mb-2 text-sm font-medium leading-relaxed">
            {suggestion.suggested}
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            No supporting evidence was found in the saved Base CV. Add truthful
            evidence before including it, or reject it.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pl-7">
        <Button size="sm" disabled className="text-xs">
          Accept (needs evidence)
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setStatus(suggestion.id, "rejected")}
          disabled={suggestion.status === "rejected"}
          className="text-xs"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

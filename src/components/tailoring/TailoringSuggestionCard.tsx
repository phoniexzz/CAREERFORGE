import { Check, ChevronDown, RotateCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { regenerateSuggestion } from "@/lib/tailoring/mock-ai";
import type { TailoringSuggestion } from "@/lib/tailoring/mock-data";
import { useTailoringStore } from "@/lib/tailoring/store";
import { cn } from "@/lib/utils";

export function TailoringSuggestionCard({
  suggestion,
}: {
  suggestion: TailoringSuggestion;
}) {
  const setStatus = useTailoringStore((state) => state.setSuggestionStatus);
  const resetSuggestion = useTailoringStore((state) => state.resetSuggestion);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(suggestion.suggested);
  const [why, setWhy] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    const result = await regenerateSuggestion(suggestion.suggested);
    setDraft(result);
    resetSuggestion(suggestion.id);
    setRegenerating(false);
    toast("Prototype regeneration completed.");
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-sm transition-colors",
        suggestion.status === "accepted" &&
          "border-success/40 ring-1 ring-success/10",
        suggestion.status === "rejected" && "border-border opacity-60",
        suggestion.status === "pending" && "border-primary/20",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {suggestion.section}
        </span>
        {suggestion.status !== "pending" && (
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              suggestion.status === "accepted"
                ? "text-success"
                : "text-muted-foreground",
            )}
          >
            {suggestion.status}
          </span>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Original
          </p>
          <p className="text-xs italic leading-relaxed text-muted-foreground">
            {suggestion.original}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Suggested
          </p>
          {editing ? (
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[120px] text-sm"
            />
          ) : (
            <p className="text-sm font-medium leading-relaxed">
              {suggestion.suggested}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setWhy((value) => !value)}
        className="mb-4 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <Sparkles className="size-3" />
        Why this change?
        <ChevronDown
          className={cn("size-3 transition-transform", why && "rotate-180")}
        />
      </button>

      {why && (
        <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3">
          <p className="text-xs leading-relaxed">{suggestion.rationale}</p>
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold">Evidence:</span>{" "}
            {suggestion.evidenceRef}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <Button
              size="sm"
              onClick={() => {
                setStatus(suggestion.id, "accepted", draft);
                setEditing(false);
              }}
              className="text-xs"
            >
              Save & accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
              className="text-xs"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              onClick={() => setStatus(suggestion.id, "accepted")}
              disabled={suggestion.status === "accepted"}
              className="text-xs"
            >
              <Check className="size-3" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStatus(suggestion.id, "rejected")}
              disabled={suggestion.status === "rejected"}
              className="text-xs"
            >
              <X className="size-3" /> Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="text-xs"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void handleRegenerate()}
              disabled={regenerating}
              className="text-xs"
            >
              <RotateCcw
                className={cn("size-3", regenerating && "animate-spin")}
              />
              Regenerate
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

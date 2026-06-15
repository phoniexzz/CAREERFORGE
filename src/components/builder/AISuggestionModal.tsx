import { type AISuggestion } from "@/lib/mock-ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: AISuggestion | null;
  onAccept: (text: string) => void;
  mode?: "enhance" | "generate";
}

export function AISuggestionModal({
  open,
  onOpenChange,
  suggestion,
  onAccept,
  mode = "enhance",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (suggestion) {
      setDraft(suggestion.suggested);
      setEditing(false);
    }
  }, [suggestion]);

  if (!suggestion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-lg border-[#d9e2e7]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            {mode === "generate"
              ? "Review generated summary"
              : "Review enhanced wording"}
          </DialogTitle>
          <DialogDescription>
            {mode === "generate"
              ? "Check that every statement reflects your experience before accepting it."
              : "Keep only wording that is accurate and supported by your experience."}
          </DialogDescription>
        </DialogHeader>

        <div
          className={
            mode === "generate" ? "mt-4" : "mt-4 grid gap-4 sm:grid-cols-2"
          }
        >
          {mode === "enhance" && (
            <div className="space-y-2">
              <div className="field-label">Original</div>
              <div className="min-h-32 rounded-md border border-[#d9e2e7] bg-[#f7f9fa] p-4 text-sm leading-relaxed text-[#425968]">
                {suggestion.original || (
                  <em className="text-neutral-400">Empty</em>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="field-label text-brand">
              {mode === "generate" ? "Generated summary" : "Enhanced summary"}
            </div>
            {editing ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-32"
              />
            ) : (
              <div className="min-h-32 rounded-md border border-[#c8dfdc] bg-brand-soft p-4 text-sm leading-relaxed text-[#284f52]">
                {draft}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-md border border-[#d9e2e7] bg-[#f7f9fa] p-4">
          <div className="text-xs font-semibold text-neutral-700 mb-2">
            Review notes
          </div>
          <ul className="space-y-1 text-xs text-neutral-600">
            {suggestion.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          {suggestion.needsMetricDisclaimer && (
            <p className="mt-2 text-xs italic text-neutral-500 border-t border-neutral-200 pt-2">
              Add a measurable outcome only when you can evidence it. Career
              Co-Pilot will not invent numbers for you.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="size-4" /> Reject
          </Button>
          <Button variant="outline" onClick={() => setEditing((e) => !e)}>
            <Pencil className="size-4" /> {editing ? "Done editing" : "Edit"}
          </Button>
          <Button
            onClick={() => {
              onAccept(draft);
              onOpenChange(false);
            }}
          >
            <Check className="size-4" /> Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

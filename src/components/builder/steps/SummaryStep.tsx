import { AIGuidancePanel } from "../AIGuidancePanel";
import { AISuggestionModal } from "../AISuggestionModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateResumeSummary,
  rewriteExperience,
} from "@/lib/api/resume-ai.functions";
import { type AISuggestion } from "@/lib/mock-ai";
import { useResumeStore } from "@/lib/resume-store";
import { flattenSkills } from "@/lib/resume-data";
import { LoaderCircle, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AIAction = "generate" | "enhance";

export function SummaryStep() {
  const data = useResumeStore((state) => state.data);
  const setData = useResumeStore((state) => state.setData);
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [modalMode, setModalMode] = useState<AIAction>("enhance");
  const [pendingAction, setPendingAction] = useState<AIAction | null>(null);
  const summary = data.summary;

  const hasProfileContext = Boolean(
    data.contact.title.trim() ||
    data.experiences.length ||
    data.education.length ||
    flattenSkills(data).length ||
    data.projects.length,
  );

  const generateSummary = async () => {
    if (!hasProfileContext) {
      toast.error("Add some profile details first", {
        description:
          "A professional title, education, experience, skills or projects will give AI factual material to work from.",
      });
      return;
    }

    setModalMode("generate");
    setSuggestion(null);
    setPendingAction("generate");
    try {
      const nextSuggestion = await generateResumeSummary({
        data: { resume: data },
      });
      setSuggestion(nextSuggestion);
      setOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI summary generation is unavailable right now.";
      toast.error("AI summary generation unavailable", {
        description: message,
      });
    } finally {
      setPendingAction(null);
    }
  };

  const enhanceSummary = async () => {
    if (!summary.trim()) {
      toast.error("Write or generate a summary first");
      return;
    }

    setModalMode("enhance");
    setSuggestion(null);
    setPendingAction("enhance");
    try {
      const nextSuggestion = await rewriteExperience({
        data: {
          text: summary,
          context:
            "Enhance this professional resume summary. Keep it to two or three concise sentences and use only facts already present.",
        },
      });
      setSuggestion(nextSuggestion);
      setOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI enhancement is unavailable right now.";
      toast.error("AI summary enhancement unavailable", {
        description: message,
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Professional direction</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">
          Personal summary
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Write two or three concise sentences that connect your experience,
          strengths and next step.
        </p>
      </header>

      <div className="form-panel space-y-4">
        <div className="space-y-3 border-b border-[#e1e8eb] pb-4">
          <div>
            <Label className="field-label">Summary</Label>
            <p className="mt-1 text-xs text-[#718590]">
              Create a draft from your profile or refine your own wording.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => void generateSummary()}
              disabled={pendingAction !== null}
            >
              {pendingAction === "generate" ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <WandSparkles className="size-3.5" />
              )}
              Generate summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void enhanceSummary()}
              disabled={!summary.trim() || pendingAction !== null}
            >
              {pendingAction === "enhance" ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              Enhance with AI
            </Button>
          </div>
        </div>

        <Textarea
          value={summary}
          onChange={(event) =>
            setData((current) => ({
              ...current,
              summary: event.target.value,
            }))
          }
          className="min-h-32"
          placeholder="Final-year student with experience in..."
        />
      </div>

      <AIGuidancePanel
        title="Summary checklist"
        tips={[
          "Open with your current status, subject or professional direction.",
          "Mention one or two strengths or focus areas.",
          "End with the type of opportunity you are seeking.",
          "Keep it under four sentences and avoid generic claims.",
        ]}
      />

      <AISuggestionModal
        open={open}
        onOpenChange={setOpen}
        suggestion={suggestion}
        mode={modalMode}
        onAccept={(text) =>
          setData((current) => ({ ...current, summary: text }))
        }
      />
    </div>
  );
}

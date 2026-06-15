import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Check,
  RotateCcw,
  AlertTriangle,
  Info,
  FileText,
  Settings2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
} from "lucide-react";
import type { TailoringSuggestion } from "@/lib/tailoring/mock-data";
import { toast } from "sonner";

import { LoadingState } from "@/components/tailoring/LoadingState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PdfResumePreview } from "@/components/builder/PdfResumePreview";
import { useResumeStore } from "@/lib/resume-store";
import { useResumeRender } from "@/lib/use-resume-render";
import { toTailoringBaseCv } from "@/lib/tailoring/base-cv";
import { apiRequest } from "@/lib/api-client";
import { useTailoringStore } from "@/lib/tailoring/store";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import type { CoverLetterSectionId } from "@/lib/tailoring/mock-data";
import type { TemplateId, SectionKey } from "@/lib/resume-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/tailor/cv")({
  head: () => ({ meta: [{ title: "Tailor Workspace - Tailor Master" }] }),
  component: TailorCv,
});

// ─── Universal CV Document (layout never changes with template) ───────────────
function UniversalCvDocument({
  baseCv,
  suggestions,
  getSummaryText,
  getBulletText,
  getSuggestionForBullet,
  startEditing,
}: {
  baseCv: ReturnType<typeof toTailoringBaseCv>;
  suggestions: TailoringSuggestion[];
  getSummaryText: () => string;
  getBulletText: (bullet: string, expId: string, idx: number) => string;
  getSuggestionForBullet: (
    bullet: string,
    expId: string,
  ) => TailoringSuggestion | undefined;
  startEditing: (id: string, text: string) => void;
}) {
  return (
    <div
      className="space-y-6 text-foreground"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <div className="border-b border-border/60 pb-5 text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#142c3d]">
          {baseCv.name}
        </h2>
        <p className="text-sm font-semibold text-primary">{baseCv.headline}</p>
        <p className="text-[11px] text-muted-foreground">
          London, UK · graduate@example.com · +44 7700 900077
        </p>
      </div>

      {/* Professional Summary */}
      <div className="group relative rounded-xl border border-transparent p-2 transition-all hover:bg-muted/40 hover:border-border/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-2">
          Professional Summary
        </h4>
        {(() => {
          const sug = suggestions.find((s) => s.id === "summary");
          return (
            <>
              {sug && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing("summary", getSummaryText())}
                    className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                    title="Edit / Review Suggestion"
                  >
                    <Sparkles className="size-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs leading-relaxed text-foreground">
                {getSummaryText()}
                {sug?.status === "pending" && (
                  <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-bold text-primary animate-pulse">
                    ✨ Optimised
                  </span>
                )}
                {sug?.status === "accepted" && (
                  <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-bold text-green-700">
                    ✓ Applied
                  </span>
                )}
              </p>
            </>
          );
        })()}
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
          Experience
        </h4>
        {baseCv.experience.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#142c3d]">{exp.title}</span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {exp.period}
              </span>
            </div>
            <p className="text-[11px] font-semibold text-primary/80">
              {exp.organisation}
            </p>
            <ul className="list-disc pl-4 space-y-1.5 pt-1">
              {exp.bullets.map((bullet, idx) => {
                const sug = getSuggestionForBullet(bullet, exp.id);
                return (
                  <li
                    key={bullet}
                    className={cn(
                      "group/bullet relative text-xs leading-relaxed text-foreground pr-7 pl-1 rounded-md transition-all",
                      sug && "hover:bg-muted/40",
                    )}
                  >
                    <span>{getBulletText(bullet, exp.id, idx)}</span>
                    {sug?.status === "pending" && (
                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-primary/10 border border-primary/20 px-1.5 text-[9px] font-bold text-primary animate-pulse">
                        ✨ Keywords
                      </span>
                    )}
                    {sug?.status === "accepted" && (
                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-green-50 px-1.5 text-[9px] font-bold text-green-700">
                        ✓
                      </span>
                    )}
                    {sug && (
                      <button
                        onClick={() =>
                          startEditing(
                            sug.id,
                            getBulletText(bullet, exp.id, idx),
                          )
                        }
                        className="absolute right-0 top-0 opacity-0 group-hover/bullet:opacity-100 transition-opacity flex size-6 items-center justify-center rounded bg-primary text-primary-foreground shadow-sm"
                        title="Review suggestion"
                      >
                        <Sparkles className="size-3" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="group relative rounded-xl border border-transparent p-2 transition-all hover:bg-muted/40 hover:border-border/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1 mb-2">
          Key Skills
        </h4>
        {(() => {
          const sug = suggestions.find((s) => s.id === "unsupported-1");
          return (
            <>
              {sug && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing("unsupported-1", "")}
                    className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm hover:opacity-90"
                    title="Evidence Alert"
                  >
                    <AlertTriangle className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {baseCv.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium border border-border/60"
                  >
                    {skill}
                  </span>
                ))}
                {sug?.status !== "rejected" && (
                  <span
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1 border border-dashed",
                      sug?.status === "accepted"
                        ? "bg-green-50 border-green-300 text-green-700"
                        : "bg-amber-50 border-amber-300 text-amber-700",
                    )}
                  >
                    <AlertTriangle className="size-3 shrink-0" />
                    {sug?.suggested}
                    <span className="text-[8px] uppercase tracking-wide opacity-70">
                      (Proposed)
                    </span>
                  </span>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ─── AI Suggestion Drawer ─────────────────────────────────────────────────────
function AiSuggestionDrawer({
  suggestion,
  editDraft,
  setEditDraft,
  onSave,
  onRevert,
  onClose,
}: {
  suggestion: TailoringSuggestion;
  editDraft: string;
  setEditDraft: (v: string) => void;
  onSave: () => void;
  onRevert: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-20 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 lg:left-[calc(50%+138px)]">
      <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
        {/* drawer header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-bold text-[#142c3d]">
              AI Suggestion — {suggestion.section}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                suggestion.status === "pending"
                  ? "bg-primary/10 text-primary"
                  : suggestion.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
              )}
            >
              {suggestion.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* content */}
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          {/* Original */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">
              Original
            </p>
            <p className="text-xs text-muted-foreground italic bg-muted/40 p-3 rounded-xl border border-border/40 leading-relaxed">
              {suggestion.original}
            </p>
          </div>

          {/* Editable suggestion */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-bold text-primary tracking-wider">
              Proposed Wording (editable)
            </p>
            <Textarea
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              className="text-xs font-sans min-h-[88px] border-primary/25 focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* rationale + actions */}
        <div className="border-t border-border px-5 py-3 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0 flex items-start gap-2">
            <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed truncate">
              <span className="font-bold text-foreground">Rationale:</span>{" "}
              {suggestion.rationale}
            </p>
          </div>
          {suggestion.unsupported && (
            <div className="flex items-center gap-1 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
              <AlertTriangle className="size-3 shrink-0" /> Evidence gap
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onRevert}
              className="h-8 text-xs gap-1"
            >
              <RotateCcw className="size-3" /> Revert
            </Button>
            <Button size="sm" onClick={onSave} className="h-8 text-xs gap-1">
              <Check className="size-3" /> Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  achievements: "Achievements",
  certifications: "Certifications",
};

// ─── Main Component ───────────────────────────────────────────────────────────
function TailorCv() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"cv" | "cover-letter">("cv");
  const data = useResumeStore((state) => state.data);
  const baseCv = toTailoringBaseCv(data);

  // PDF render (always active — powers right-hand panel)
  const {
    pdf,
    pdfUrl,
    loading: pdfLoading,
    error: pdfError,
  } = useResumeRender();

  // Template
  const template = useResumeStore((state) => state.template);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const layoutPreferences = useResumeStore((state) => state.layoutPreferences);
  const setLayoutPreferences = useResumeStore(
    (state) => state.setLayoutPreferences,
  );
  const layout = layoutPreferences[template];

  const toggleSection = (section: SectionKey) => {
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

  const moveSection = (
    region: string,
    section: SectionKey,
    direction: -1 | 1,
  ) => {
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

  // Tailor state
  const suggestions = useTailoringStore((state) => state.suggestions);
  const setStatus = useTailoringStore((state) => state.setSuggestionStatus);
  const acceptAll = useTailoringStore((state) => state.acceptAll);
  const rejectAll = useTailoringStore((state) => state.rejectAll);
  const coverLetterSections = useTailoringStore((state) => state.coverLetter);
  const updateCoverLetter = useTailoringStore(
    (state) => state.updateCoverLetterSection,
  );

  // UI
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<
    string | null
  >(null);
  const [editDraftText, setEditDraftText] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [activeCoverSectionId, setActiveCoverSectionId] =
    useState<CoverLetterSectionId | null>(null);
  const [coverEnhanceBusy, setCoverEnhanceBusy] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);

  const draftGenerated = useTailoringStore((state) => state.draftGenerated);
  const generateDraft = useTailoringStore((state) => state.generateDraft);
  const resumeId = useResumeStore((state) => state.resumeId);
  const jobTitle = useTailoringStore((state) => state.jobTitle);
  const company = useTailoringStore((state) => state.company);
  const jobDescription = useTailoringStore((state) => state.jobDescription);

  useEffect(() => {
    if (draftGenerated) {
      setLoading(false);
      return;
    }
    if (!resumeId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    generateDraft(resumeId, jobTitle, company, jobDescription)
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((err) => {
        console.error("Draft generation failed:", err);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [draftGenerated, resumeId, generateDraft, jobTitle, company, jobDescription]);

  if (loading)
    return <LoadingState label="Preparing tailored application workspace..." />;

  const activeSuggestion = suggestions.find(
    (s) => s.id === selectedSuggestionId,
  );

  const startEditing = (id: string, currentText: string) => {
    setSelectedSuggestionId(id);
    setEditDraftText(currentText);
  };

  const saveEditedSuggestion = (id: string) => {
    setStatus(id, "accepted", editDraftText);
    setSelectedSuggestionId(null);
    toast.success("Suggestion accepted");
  };

  const runCoverEnhancement = async (
    sectionId: CoverLetterSectionId,
    action:
      | "professional"
      | "shorter"
      | "longer"
      | "warmer"
      | "evidence"
      | "business"
      | "technical",
  ) => {
    setCoverEnhanceBusy(`${sectionId}:${action}`);
    const section = coverLetterSections.find((s) => s.id === sectionId);
    if (!section) return;
    try {
      const response = await apiRequest<{ section_id?: string; content?: string }>(
        "/tailoring/cover-letter/tone",
        {
          method: "POST",
          body: JSON.stringify({
            section_id: sectionId,
            content: section.content,
            action,
          }),
        }
      );
      const finalContent = response.content ?? "";
      if (finalContent) {
        updateCoverLetter(sectionId, finalContent);
        toast.success("Section updated");
      } else {
        toast.error("Failed to run tone modification");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to run tone modification");
    } finally {
      setCoverEnhanceBusy(null);
    }
  };

  const getSummaryText = () => {
    const sug = suggestions.find((s) => s.id === "summary");
    if (!sug) return baseCv.summary;
    return sug.status === "rejected" ? sug.original : sug.suggested;
  };

  const getBulletText = (bullet: string, expId: string, _idx: number) => {
    const sug = suggestions.find(
      (s) => s.experienceId === expId && s.original === bullet,
    );
    if (!sug) return bullet;
    return sug.status === "rejected" ? sug.original : sug.suggested;
  };

  const getSuggestionForBullet = (bullet: string, expId: string) =>
    suggestions.find((s) => s.experienceId === expId && s.original === bullet);

  const reviewedCount = suggestions.filter(
    (s) => s.status !== "pending",
  ).length;

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20">
      {/* ── Top toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        {/* Mode toggle */}
        <div className="flex p-1 bg-muted rounded-xl border border-border">
          <button
            onClick={() => setMode("cv")}
            className={cn(
              "px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              mode === "cv"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Tailored CV
          </button>
          <button
            onClick={() => setMode("cover-letter")}
            className={cn(
              "px-5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
              mode === "cover-letter"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Cover Letter
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {mode === "cv" && (
            <>
              <span className="text-muted-foreground font-medium">
                <span className="font-bold text-foreground font-mono">
                  {reviewedCount}/{suggestions.length}
                </span>{" "}
                suggestions reviewed
              </span>

              {/* Accept/Reject bulk */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  acceptAll();
                  toast.success("Accepted all suggestions!");
                }}
                className="h-8 text-xs"
              >
                Accept All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  rejectAll();
                  toast.info("All suggestions reverted");
                }}
                className="h-8 text-xs"
              >
                Reject All
              </Button>

              {/* Compare dialog */}
              <Dialog open={isComparing} onOpenChange={setIsComparing}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    Compare Changes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Compare Document Changes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    {suggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className="border-b border-border pb-4 last:border-b-0"
                      >
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wide">
                          {sug.section}
                        </span>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                            <p className="text-[9px] uppercase font-bold text-red-600 mb-1">
                              Original
                            </p>
                            <p className="text-xs text-foreground italic leading-relaxed">
                              {sug.original}
                            </p>
                          </div>
                          <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                            <p className="text-[9px] uppercase font-bold text-green-700 mb-1">
                              Tailored ({sug.status})
                            </p>
                            <p className="text-xs text-foreground font-medium leading-relaxed">
                              {sug.suggested}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                onClick={() => setMode("cover-letter")}
                className="h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                Next
              </Button>
            </>
          )}
          {mode === "cover-letter" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowControls((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                <Settings2 className="size-3.5" />
                Tone Controls
                {showControls ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
              <Button
                asChild
                size="sm"
                className="h-8 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <Link to="/tailor/readiness">
                  Next
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── 50/50 Split Pane ─────────────────────────────────────────── */}
      {mode === "cv" && (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "1fr 1fr",
            height: "calc(100vh - 260px)",
          }}
        >
          {/* LEFT — Interactive HTML document */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
            {/* Left panel header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-5 py-2.5">
              <div>
                <p className="text-xs font-bold text-[#28485b]">
                  Interactive Document
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Hover bullets to review AI edits
                </p>
              </div>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                HTML
              </span>
            </div>

            {/* Scrollable HTML document */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="mx-auto max-w-xl px-8 py-10">
                <UniversalCvDocument
                  baseCv={baseCv}
                  suggestions={suggestions}
                  getSummaryText={getSummaryText}
                  getBulletText={getBulletText}
                  getSuggestionForBullet={getSuggestionForBullet}
                  startEditing={startEditing}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — Live PDF preview */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
            {/* Right panel header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#cdd5d9] bg-white/70 px-5 py-2.5">
              <div>
                <p className="text-xs font-bold text-[#28485b]">
                  Compiled PDF Preview
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Exact rendered output
                </p>
              </div>
            </div>

            {/* Scrollable PDF canvas */}
            <div className="flex-1 min-h-0 flex flex-col">
              <PdfResumePreview
                pdf={pdf}
                pdfUrl={pdfUrl}
                loading={pdfLoading}
                error={pdfError}
                className="flex-1"
                bgClass="bg-[#f8fafc]"
                paddingClass="p-4"
              />
            </div>

            {/* Template picker and layout settings footer */}
            <div className="shrink-0 border-t border-[#cdd5d9] bg-white p-4 space-y-3.5">
              {/* Template row */}
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold text-[#607482] shrink-0 uppercase tracking-wider">
                  Template:
                </p>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {TEMPLATES.map((t) => {
                    const active = t.id === template;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTemplate(t.id as TemplateId)}
                        title={t.description}
                        className={cn(
                          "relative h-8 rounded-lg border px-2.5 text-[10px] font-semibold transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="size-2" />
                          </span>
                        )}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section order and visibility details */}
              <details className="rounded-xl border border-[#d9e2e7] bg-[#f8fafc] px-3 py-2 transition-all">
                <summary className="cursor-pointer text-[11px] font-bold text-[#425968] outline-none select-none hover:text-primary transition-colors">
                  Section order and visibility
                </summary>
                <div className="mt-2.5 space-y-2.5">
                  {Object.entries(layout.regions).map(([region, sections]) => (
                    <div key={region} className="space-y-1.5">
                      {Object.keys(layout.regions).length > 1 && (
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#718590] mb-1">
                          {region}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {sections.map((section, index) => (
                          <div
                            key={section}
                            className="flex items-center rounded-lg border border-[#d9e2e7] bg-white shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSection(section as SectionKey)}
                              className="flex h-8 items-center gap-1.5 px-3 text-[10px] font-semibold text-[#425968] hover:bg-muted/40 rounded-l-lg transition-colors"
                              title={`Toggle ${LABELS[section as SectionKey]}`}
                            >
                              {layout.visible[section as SectionKey] ? (
                                <Eye className="size-3.5 text-primary" />
                              ) : (
                                <EyeOff className="size-3.5 text-[#91a2ac]" />
                              )}
                              {LABELS[section as SectionKey]}
                            </button>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveSection(region, section as SectionKey, -1)}
                              className="grid size-8 place-items-center border-l border-[#e1e8eb] text-[#607482] hover:bg-muted/40 disabled:opacity-30 transition-colors"
                              aria-label={`Move ${LABELS[section as SectionKey]} earlier`}
                            >
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === sections.length - 1}
                              onClick={() => moveSection(region, section as SectionKey, 1)}
                              className="grid size-8 place-items-center border-l border-[#e1e8eb] text-[#607482] hover:bg-muted/40 disabled:opacity-30 transition-colors rounded-r-lg"
                              aria-label={`Move ${LABELS[section as SectionKey]} later`}
                            >
                              <ArrowDown className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* ── Cover Letter mode — full width + controls ─────────────────── */}
      {mode === "cover-letter" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Letter doc */}
          <div
            className={cn(
              "lg:col-span-8",
              showControls ? "lg:col-span-7" : "lg:col-span-10",
            )}
          >
            <div className="rounded-2xl border border-border shadow-xl bg-white min-h-[600px]">
              <div className="border-b border-border bg-muted/30 px-5 py-2.5">
                <p className="text-xs font-bold text-[#28485b]">
                  Cover Letter — AI Draft
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Click any paragraph to edit inline
                </p>
              </div>
              <div className="px-10 py-8 space-y-5 text-sm leading-relaxed">
                <div className="border-b border-border/60 pb-5 text-xs text-muted-foreground space-y-0.5">
                  <p className="font-bold text-foreground text-sm">
                    {baseCv.name}
                  </p>
                  <p>London, UK · graduate@example.com</p>
                  <p className="pt-2">
                    {new Date().toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="pt-4 font-bold text-foreground">Hiring Team</p>
                  <p>Example Company</p>
                </div>
                <p className="font-semibold text-[#142c3d]">
                  Dear Hiring Team,
                </p>
                <div className="space-y-4">
                  {coverLetterSections.map((section) => (
                    <div
                      key={section.id}
                      onClick={() => setActiveCoverSectionId(section.id)}
                      className={cn(
                        "group relative rounded-xl border border-transparent p-3 transition-all cursor-pointer hover:bg-muted/30 hover:border-border/30",
                        activeCoverSectionId === section.id &&
                          "bg-primary/5 border-primary/20 shadow-sm",
                      )}
                    >
                      <span className="absolute -top-2 left-3 hidden group-hover:inline-block bg-primary text-primary-foreground text-[8px] font-bold uppercase px-1.5 py-0.5 rounded">
                        {section.label}
                      </span>
                      {activeCoverSectionId === section.id ? (
                        <div className="space-y-2 pt-1">
                          <Textarea
                            value={section.content}
                            onChange={(e) =>
                              updateCoverLetter(section.id, e.target.value)
                            }
                            className="w-full text-xs font-sans min-h-[90px] border-primary/30"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCoverSectionId(null);
                            }}
                            className="text-[10px] h-7 px-3"
                          >
                            Minimise
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tone controls */}
          {showControls && (
            <div className="lg:col-span-5 space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h3 className="font-display text-sm font-bold text-[#142c3d] flex items-center gap-1.5">
                  <Settings2 className="size-4 text-primary" /> Tone Refinement
                </h3>
                {activeCoverSectionId ? (
                  <div className="space-y-3">
                    <p className="text-[11px] text-muted-foreground">
                      Modifying:{" "}
                      <span className="font-bold text-primary">
                        {
                          coverLetterSections.find(
                            (s) => s.id === activeCoverSectionId,
                          )?.label
                        }
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          "professional",
                          "technical",
                          "business",
                          "shorter",
                          "longer",
                          "evidence",
                          "warmer",
                        ] as const
                      ).map((item) => {
                        const busyKey = `${activeCoverSectionId}:${item}`;
                        const isBusy = coverEnhanceBusy === busyKey;
                        return (
                          <Button
                            key={item}
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void runCoverEnhancement(
                                activeCoverSectionId,
                                item,
                              )
                            }
                            disabled={coverEnhanceBusy !== null}
                            className="text-[10px] h-8 font-medium capitalize"
                          >
                            {isBusy && (
                              <RefreshCw className="size-3 animate-spin mr-1" />
                            )}
                            {item}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-border rounded-xl bg-muted/20">
                    <FileText className="size-5 text-primary/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Click a paragraph in the letter to enable tone controls
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Suggestion Drawer (slides up from bottom when suggestion active) ── */}
      {activeSuggestion && (
        <AiSuggestionDrawer
          suggestion={activeSuggestion}
          editDraft={editDraftText}
          setEditDraft={setEditDraftText}
          onSave={() => saveEditedSuggestion(activeSuggestion.id)}
          onRevert={() => {
            setStatus(activeSuggestion.id, "rejected");
            setSelectedSuggestionId(null);
            toast.info("Reverted to original");
          }}
          onClose={() => setSelectedSuggestionId(null)}
        />
      )}

    </div>
  );
}

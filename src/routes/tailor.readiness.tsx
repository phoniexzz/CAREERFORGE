import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/tailoring/LoadingState";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume-store";
import { useTailoringStore } from "@/lib/tailoring/store";
import type { ResumeData } from "@/lib/resume-types";
import type { TailoringSuggestion } from "@/lib/tailoring/mock-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

function applyTailoringSuggestions(
  baseData: ResumeData,
  suggestions: TailoringSuggestion[],
): ResumeData {
  const data = JSON.parse(JSON.stringify(baseData)) as ResumeData;
  suggestions.forEach((sug) => {
    if (sug.status !== "accepted") return;
    if (sug.id === "summary") {
      data.summary = sug.suggested;
    } else if (sug.experienceId) {
      const exp = data.experiences.find((e) => e.id === sug.experienceId);
      if (exp && exp.bullets) {
        exp.bullets = exp.bullets.map((b) =>
          b === sug.original ? sug.suggested : b,
        );
      }
    }
  });
  return data;
}

export const Route = createFileRoute("/tailor/readiness")({
  head: () => ({ meta: [{ title: "Review & Apply - Tailor Master" }] }),
  component: TailorReadiness,
});

function TailorReadiness() {
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  // Resume store state
  const resumeId = useResumeStore((state) => state.resumeId);
  const revision = useResumeStore((state) => state.revision);
  const template = useResumeStore((state) => state.template);
  const data = useResumeStore((state) => state.data);

  // Tailoring store state
  const suggestions = useTailoringStore((state) => state.suggestions);
  const draftGenerated = useTailoringStore((state) => state.draftGenerated);
  const generateDraft = useTailoringStore((state) => state.generateDraft);
  const saveApprovedProject = useTailoringStore(
    (state) => state.saveApprovedProject,
  );
  const projectId = useTailoringStore((state) => state.projectId);

  const jobTitle = useTailoringStore((state) => state.jobTitle);
  const company = useTailoringStore((state) => state.company);
  const jobDescription = useTailoringStore((state) => state.jobDescription);
  const matchScore = useTailoringStore((state) => state.matchScore);
  const matchCategory = useTailoringStore((state) => state.matchCategory);
  const recommendedAction = useTailoringStore(
    (state) => state.recommendedAction,
  );
  const missingSkills = useTailoringStore((state) => state.missingSkills);
  const evidenceGaps = useTailoringStore((state) => state.evidenceGaps);
  const missingRequirements = useTailoringStore(
    (state) => state.missingRequirements,
  );

  const storeLoading = useTailoringStore((state) => state.loading);

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
  }, [
    draftGenerated,
    resumeId,
    generateDraft,
    jobTitle,
    company,
    jobDescription,
  ]);

  const ensureProjectSaved = async () => {
    if (projectId) return projectId;
    if (!resumeId) {
      throw new Error("No base CV selected.");
    }
    const tailoredCvData = applyTailoringSuggestions(data, suggestions);
    const savedId = await saveApprovedProject(
      resumeId,
      revision,
      template,
      tailoredCvData,
    );
    return savedId;
  };

  const handleDownload = async (
    type: "cv" | "cover-letter" | "strategy",
    format: "pdf" | "docx",
  ) => {
    try {
      toast.loading("Preparing your download...", { id: "download-toast" });
      const activeProjectId = await ensureProjectSaved();

      let exportPath = "";
      if (type === "cv") {
        exportPath = `/tailoring/projects/${activeProjectId}/export/cv?format=${format}`;
      } else if (type === "cover-letter") {
        exportPath = `/tailoring/projects/${activeProjectId}/export/cover-letter?format=${format}`;
      } else {
        exportPath = `/tailoring/projects/${activeProjectId}/export/strategy`;
      }

      const API_URL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";
      const downloadUrl = `${API_URL}${exportPath}`;

      const response = await fetch(downloadUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = "";
      if (type === "cv") {
        filename = `${jobTitle}-${company}-CV.${format}`;
      } else if (type === "cover-letter") {
        filename = `${jobTitle}-${company}-CoverLetter.${format}`;
      } else {
        filename = `${jobTitle}-${company}-StrategyReport.docx`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download complete!", { id: "download-toast" });
    } catch (err: unknown) {
      console.error("Download failed:", err);
      toast.error("Failed to download file.", { id: "download-toast" });
    }
  };

  const handleApply = async () => {
    if (!resumeId) {
      toast.error("No base CV selected.");
      return;
    }
    setApplying(true);
    try {
      const tailoredCvData = applyTailoringSuggestions(data, suggestions);
      await saveApprovedProject(resumeId, revision, template, tailoredCvData);
      toast.success("Application package saved successfully!");
      setApplyDialogOpen(true);
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to save project.",
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading || storeLoading) {
    return <LoadingState label="Reviewing application readiness..." />;
  }

  const reviewItems = [
    ...missingRequirements.map((item) => item.label),
    ...evidenceGaps.map((item) => item.detail || item.title),
    ...missingSkills.map(
      (item) => `${item.label} is not evidenced in the Base CV.`,
    ),
  ].filter((item, index, items) => item && items.indexOf(item) === index);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-12 lg:py-14 animate-fade-in">
      <div className="mb-8 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Review your application package
        </h2>
        <p className="mt-2 text-ink-muted">
          One last calm look before you export. Your package contains a tailored
          CV and a cover letter, ready for submission to{" "}
          {company || "JPMorganChase"}.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-hero">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="bg-surface-soft p-8 lg:border-r lg:border-border lg:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Rule-based job match
            </p>
            <p className="mt-3 font-display text-[2.75rem] font-semibold leading-none text-ink">
              {matchScore}%
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {matchCategory} | {recommendedAction}
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
          </div>
          <div className="p-8 lg:p-10">
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-success/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check h-3.5 w-3.5 text-success"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                The Matchmaker score and eligibility result are unchanged
              </li>
              <li className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-success/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check h-3.5 w-3.5 text-success"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                Cover letter references role and company
              </li>
              <li className="flex items-start gap-3 text-sm text-ink">
                <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-success/15">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check h-3.5 w-3.5 text-success"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </span>
                All accepted edits are sourced from your base CV
              </li>
              {reviewItems.length > 0 && (
                <li className="flex items-start gap-3 text-sm text-ink">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-warning/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-triangle-alert h-3.5 w-3.5 text-warning-foreground"
                      aria-hidden="true"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
                      <path d="M12 9v4"></path>
                      <path d="M12 17h.01"></path>
                    </svg>
                  </span>
                  {reviewItems.length} match gap
                  {reviewItems.length === 1 ? "" : "s"} still need review
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {reviewItems.length > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-triangle-alert mt-0.5 h-4 w-4 shrink-0 text-warning-foreground"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
          <div className="text-sm text-ink">
            <p className="font-medium">Review before applying</p>
            <ul className="mt-1 space-y-1 text-ink-muted">
              {reviewItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-soft">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
          Your package
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-ink">
          Two documents — ready to download
        </h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          <li className="flex items-center gap-4 rounded-xl border border-border bg-surface-soft p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-file-text h-4 w-4"
                aria-hidden="true"
              >
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path>
                <path d="M14 2v5a1 1 0 0 0 1 1h5"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">Tailored CV</p>
              <p className="text-xs text-ink-muted">tailored-cv.pdf</p>
            </div>
            <button
              type="button"
              onClick={() => handleDownload("cv", "pdf")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-primary hover:text-primary cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-download h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M12 15V3"></path>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <path d="m7 10 5 5 5-5"></path>
              </svg>
              Download
            </button>
          </li>
          <li className="flex items-center gap-4 rounded-xl border border-border bg-surface-soft p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-mail h-4 w-4"
                aria-hidden="true"
              >
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path>
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                Tailored cover letter
              </p>
              <p className="text-xs text-ink-muted">cover-letter.pdf</p>
            </div>
            <button
              type="button"
              onClick={() => handleDownload("cover-letter", "pdf")}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-primary hover:text-primary cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-download h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M12 15V3"></path>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <path d="m7 10 5 5 5-5"></path>
              </svg>
              Download
            </button>
          </li>
        </ul>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {applying ? "Finalizing Details..." : "Export application package"}
          </button>
        </div>
      </section>
      <p className="mt-8 text-xs text-ink-muted">
        Career Co-Pilot prepares package documents for your review. You decide
        what to send.
      </p>

      {/* Apply Success Dialog Overlay */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-md p-6 text-center">
          <DialogHeader className="flex flex-col items-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success mb-3 animate-bounce">
              <Check className="size-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Application Ready!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your tailored CV and Cover Letter are finalized. Career Forge AI
              will connect with direct university application channels in the
              next release.
            </p>
            <div className="rounded-lg bg-primary-soft/40 border border-primary/10 p-3 mt-4 text-[11px] text-foreground leading-relaxed text-left">
              <strong>Job Ref:</strong> {jobTitle} at {company}
              <br />
              <strong>Status:</strong> Readiness checks validated.
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button type="button" className="px-8 text-xs font-semibold">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

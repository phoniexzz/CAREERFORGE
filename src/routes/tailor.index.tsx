import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/tailoring/LoadingState";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume-store";
import { useTailoringStore } from "@/lib/tailoring/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/tailor/")({
  head: () => ({
    meta: [{ title: "Overview - Tailor Master" }],
  }),
  component: TailorIndex,
});

function TailorIndex() {
  const [loading, setLoading] = useState(true);
  const [isJdOpen, setIsJdOpen] = useState(false);

  const jobTitle = useTailoringStore((state) => state.jobTitle);
  const company = useTailoringStore((state) => state.company);
  const location = useTailoringStore((state) => state.location);
  const jobDescription = useTailoringStore((state) => state.jobDescription);
  const matchScore = useTailoringStore((state) => state.matchScore);
  const matchCategory = useTailoringStore((state) => state.matchCategory);
  const recommendedAction = useTailoringStore(
    (state) => state.recommendedAction,
  );
  const assessmentCoverage = useTailoringStore(
    (state) => state.assessmentCoverage,
  );
  const strongMatches = useTailoringStore((state) => state.strongMatches);
  const partialMatches = useTailoringStore((state) => state.partialMatches);
  const missingSkills = useTailoringStore((state) => state.missingSkills);
  const evidenceGaps = useTailoringStore((state) => state.evidenceGaps);

  const resumeId = useResumeStore((state) => state.resumeId);
  const generateDraft = useTailoringStore((state) => state.generateDraft);
  const draftGenerated = useTailoringStore((state) => state.draftGenerated);

  useEffect(() => {
    if (!resumeId) {
      setLoading(false);
      return;
    }
    if (draftGenerated) {
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
        toast.error("Failed to generate tailoring draft.");
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    resumeId,
    draftGenerated,
    generateDraft,
    jobTitle,
    company,
    jobDescription,
  ]);

  if (loading) {
    return <LoadingState label="Loading application overview dashboard..." />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-14 animate-fade-in">
      <div className="mb-8 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
          Check your fit for this role
        </h2>
        <p className="mt-2 text-ink-muted">
          Your base CV already matches several core requirements. Review the key
          strengths and gaps before tailoring.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-hero">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3 w-3" /> Target role
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
              {jobTitle}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> {company}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {location}
              </span>
            </div>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-foreground">
              This result reuses the exact Matchmaker calculation. It found{" "}
              {strongMatches.length + partialMatches.length} explicit term
              matches and {missingSkills.length + evidenceGaps.length} gaps or
              checks to review before tailoring.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/tailor/cv"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start tailoring this application
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Button
                type="button"
                onClick={() => setIsJdOpen(true)}
                className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-muted"
              >
                View job details
              </Button>
            </div>
          </div>

          <div className="relative border-t border-border bg-surface-soft p-8 lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Fit verdict
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="font-display text-[2.75rem] font-semibold leading-none text-ink">
                {matchCategory}
              </p>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {matchScore}% match | {recommendedAction}
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-foreground">
              {assessmentCoverage}% of the configured rule weights could be
              assessed from explicit CV, preference, and job data.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* Column 1: Matches */}
        <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-success/15">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
            What already matches
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {strongMatches.map((item) => (
              <li key={item.label} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
                <span>{item.label}</span>
              </li>
            ))}
            {strongMatches.length === 0 && (
              <li className="text-xs text-muted-foreground italic">
                No strong matches found.
              </li>
            )}
          </ul>
        </article>

        {/* Column 2: Needs attention */}
        <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-warning/20">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
            Needs attention
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {missingSkills.map((item) => (
              <li key={item.label} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
                <span>{item.label} evidence is weak</span>
              </li>
            ))}
            {evidenceGaps.map((gap) => (
              <li key={gap.id} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
                <span>{gap.title}</span>
              </li>
            ))}
            {missingSkills.length === 0 && evidenceGaps.length === 0 && (
              <li className="text-xs text-muted-foreground italic">
                No gaps identified.
              </li>
            )}
          </ul>
        </article>

        {/* Column 3: What we will improve */}
        <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
            What we will improve
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
              <span>
                Reframe analytics experience toward reporting, controls and
                stakeholder requirements
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
              <span>
                Surface role-relevant keywords only where supported by evidence
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted/60"></span>
              <span>
                Strengthen quantified outcomes on reporting-focused bullets
              </span>
            </li>
          </ul>
        </article>
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        Career Co-Pilot only surfaces what's in your base CV. We never invent
        experience, dates, or qualifications.
      </p>

      {/* View Job Details Sheet */}
      <Sheet open={isJdOpen} onOpenChange={setIsJdOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{jobTitle}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {location}
            </span>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted mb-3">
              Full job description
            </p>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {jobDescription}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

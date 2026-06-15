import {
  AlertTriangle,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  MapPin,
  TrendingUp,
  X,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import type { JobMatchDetail } from "@/lib/matchmaker-api";
import { useTailoringStore } from "@/lib/tailoring/store";
import { cn } from "@/lib/utils";

interface Props {
  job: JobMatchDetail;
  onClose?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const tabs = ["Overview", "Match Analysis", "Job Details"] as const;
type Tab = (typeof tabs)[number];

function fitTone(value: string) {
  if (value === "matched") return "text-success";
  if (value === "missing") return "text-warning-foreground";
  return "text-ink-muted";
}

export function DetailsPanel({
  job,
  onClose,
  isSaved = false,
  onToggleSave,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const navigate = useNavigate();

  const handleTailorClick = () => {
    useTailoringStore.setState({
      matchId: job.matchId,
      jobTitle: job.jobTitle,
      company: job.company,
      jobDescription: job.description,
      location: job.location,
      matchScore: job.matchScore,
      matchCategory: job.matchCategory,
      recommendedAction: job.recommendedAction,
      assessmentCoverage: job.assessmentCoverage,
      strongMatches: [...job.matchedRequiredSkills, ...job.matchedTools].map(
        (label) => ({
          label,
          note: "Explicitly present in the Base CV.",
        }),
      ),
      partialMatches: job.matchedPreferredSkills.map((label) => ({
        label,
        note: "Matched preferred requirement.",
      })),
      missingSkills: [
        ...job.missingRequiredSkills,
        ...job.missingPreferredSkills,
        ...job.missingTools,
      ].map((label) => ({ label })),
      evidenceGaps: job.hardRequirementFlags
        .filter((flag) => flag.status !== "met")
        .map((flag, index) => ({
          id: `requirement-${index + 1}`,
          title: flag.type.replaceAll("_", " "),
          detail: flag.message,
        })),
      draftGenerated: false,
    });
    navigate({ to: "/tailor" });
  };

  const matchedTerms = [
    ...job.matchedRequiredSkills,
    ...job.matchedPreferredSkills,
    ...job.matchedTools,
  ];
  const missingTerms = [
    ...job.missingRequiredSkills,
    ...job.missingPreferredSkills,
    ...job.missingTools,
  ];

  return (
    <aside className="w-full shrink-0 overflow-y-auto border-l border-border bg-card lg:w-[400px]">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {job.matchCategory}
            </p>
            <h2 className="mt-1 text-xl font-extrabold leading-tight">
              {job.jobTitle}
            </h2>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex gap-5 overflow-x-auto border-b border-border text-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "border-b-2 pb-3 font-semibold whitespace-nowrap",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="mt-6 space-y-5">
            <section className="rounded-2xl border border-border bg-surface-soft p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rule-based match
              </p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-black">{job.matchScore}%</p>
                  <p className="text-xs text-muted-foreground">
                    {job.assessmentCoverage}% of configured dimensions assessed
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {job.recommendedAction}
                </span>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border p-3">
                <MapPin className="h-4 w-4 text-primary" />
                <p className="mt-2 font-bold">{job.location || "Unknown"}</p>
                <p className="capitalize text-muted-foreground">
                  {job.workMode}
                </p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <Briefcase className="h-4 w-4 text-primary" />
                <p className="mt-2 font-bold">
                  {job.contractType || "Contract unknown"}
                </p>
                <p className="text-muted-foreground">
                  {job.salary || "Salary unavailable"}
                </p>
              </div>
            </div>

            {job.hardRequirementFlags.map((flag) => (
              <div
                key={`${flag.type}-${flag.message}`}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 text-xs",
                  flag.status === "met"
                    ? "border-success/30 bg-success/5"
                    : "border-warning/40 bg-warning/5",
                )}
              >
                {flag.status === "met" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                )}
                <p>{flag.message}</p>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <button
                onClick={handleTailorClick}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                <TrendingUp className="h-4 w-4" />
                Tailor for this role
              </button>
              <button
                onClick={onToggleSave}
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl border",
                  isSaved
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border",
                )}
                aria-label={isSaved ? "Remove saved job" : "Save job"}
              >
                <Bookmark
                  className={cn("h-5 w-5", isSaved && "fill-current")}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "Match Analysis" && (
          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-xs font-extrabold">Dimension results</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Education", job.educationFit],
                  ["Experience", job.experienceFit],
                  ["Location", job.locationFit],
                  ["Seniority", job.seniorityFit],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-muted-foreground">{label}</p>
                    <p
                      className={cn(
                        "mt-1 font-bold capitalize",
                        fitTone(value),
                      )}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <TermList title="Matched terms" values={matchedTerms} matched />
            <TermList title="Missing terms" values={missingTerms} />
          </div>
        )}

        {activeTab === "Job Details" && (
          <div className="mt-6 space-y-6 text-sm">
            <section>
              <h3 className="text-xs font-extrabold uppercase tracking-wider">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </section>
            {job.responsibilities.length > 0 && (
              <section>
                <h3 className="text-xs font-extrabold uppercase tracking-wider">
                  Extracted responsibilities
                </h3>
                <ul className="mt-2 space-y-2 text-muted-foreground">
                  {job.responsibilities.map((value) => (
                    <li key={value} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                Open original Reed listing
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function TermList({
  title,
  values,
  matched = false,
}: {
  title: string;
  values: string[];
  matched?: boolean;
}) {
  return (
    <section>
      <h3 className="text-xs font-extrabold">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.length ? (
          values.map((value) => (
            <span
              key={value}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                matched
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning-foreground",
              )}
            >
              {value}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">None extracted.</span>
        )}
      </div>
    </section>
  );
}

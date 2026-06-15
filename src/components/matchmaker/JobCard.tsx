import {
  AlertTriangle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  MapPin,
  WandSparkles,
} from "lucide-react";

import type { JobMatch } from "@/lib/matchmaker-api";
import { cn } from "@/lib/utils";

interface Props {
  job: JobMatch;
  selected?: boolean;
  onSelect?: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onTailor?: () => void;
}

function scoreTone(category: JobMatch["matchCategory"]) {
  if (category === "Strong Match" || category === "Good Match") {
    return "border-success/40 bg-success/10 text-success";
  }
  if (category === "Not Eligible" || category === "Needs Review") {
    return "border-warning/50 bg-warning/10 text-warning-foreground";
  }
  return "border-primary/30 bg-primary/10 text-primary";
}

function postedLabel(value?: string) {
  if (!value) return "Date unavailable";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000),
  );
  return days === 0 ? "Today" : `${days}d ago`;
}

export function JobCard({
  job,
  selected,
  onSelect,
  isSaved = false,
  onToggleSave,
  onTailor,
}: Props) {
  const matched = [
    ...job.matchedRequiredSkills,
    ...job.matchedPreferredSkills,
    ...job.matchedTools,
  ].slice(0, 6);
  const missing = [
    ...job.missingRequiredSkills,
    ...job.missingPreferredSkills,
    ...job.missingTools,
  ].slice(0, 5);

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-xl border bg-surface p-6 transition-all duration-200",
        selected
          ? "border-primary ring-1 ring-primary/30 shadow-md"
          : "border-border hover:border-foreground/20",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {job.company || "Employer unavailable"}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {job.location || "Location unavailable"}
            </span>
            {job.workMode !== "unknown" && (
              <>
                <span>·</span>
                <span className="capitalize">{job.workMode}</span>
              </>
            )}
          </div>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
            {job.jobTitle}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            {job.contractType && (
              <span className="rounded-md bg-secondary px-2 py-0.5">
                {job.contractType}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {job.applicationDeadline
                ? `Deadline ${job.applicationDeadline}`
                : "Deadline unavailable"}
            </span>
            <span>· Posted {postedLabel(job.postedAt)}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={cn(
              "inline-flex items-baseline gap-1 rounded-full border px-3 py-1 text-sm font-semibold",
              scoreTone(job.matchCategory),
            )}
          >
            <span className="tabular-nums">{job.matchScore}</span>
            <span className="text-[0.8em] opacity-80">%</span>
          </div>
          <p className="mt-1 text-xs font-medium text-ink-muted">
            {job.matchCategory}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-surface-soft p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            Explicit matches
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {matched.length ? (
              matched.map((term) => (
                <span
                  key={term}
                  className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                >
                  {term}
                </span>
              ))
            ) : (
              <span className="text-xs text-ink-muted">No matched terms.</span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border/70 bg-surface-soft p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            Missing or unconfirmed
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {missing.length ? (
              missing.map((term) => (
                <span
                  key={term}
                  className="rounded-md border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground"
                >
                  {term}
                </span>
              ))
            ) : (
              <span className="text-xs text-ink-muted">
                No extracted keyword gaps.
              </span>
            )}
          </div>
        </div>
      </div>

      {job.hardRequirementFlags.some((flag) => flag.status !== "met") && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/35 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>A mandatory requirement is missing or needs confirmation.</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave?.();
          }}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
        >
          {isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {isSaved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.();
          }}
          className="inline-flex h-10 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
        >
          Details <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onTailor?.();
          }}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
        >
          <WandSparkles className="h-4 w-4" />
          Tailor for this role
        </button>
      </div>
    </article>
  );
}

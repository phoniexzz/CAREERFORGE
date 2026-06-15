import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LoaderCircle, PlayCircle, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DetailsPanel } from "@/components/matchmaker/DetailsPanel";
import { JobCard } from "@/components/matchmaker/JobCard";
import { MatchPreferencesDialog } from "@/components/matchmaker/MatchPreferencesDialog";
import { Sidebar } from "@/components/matchmaker/Sidebar";
import { TopBar } from "@/components/matchmaker/TopBar";
import {
  getJobMatch,
  getMatchRun,
  listJobMatches,
  recalculateJobMatches,
  type JobMatch,
  type JobMatchDetail,
  type MatchRun,
} from "@/lib/matchmaker-api";
import { useResumeStore } from "@/lib/resume-store";
import { useTailoringStore } from "@/lib/tailoring/store";

export const Route = createFileRoute("/matchmaker")({
  head: () => ({
    meta: [
      { title: "Job Matchmaker - CareerForge AI" },
      {
        name: "description",
        content:
          "Deterministic job matches calculated from your Base CV and explicit preferences.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    selected: (search.selected as string) || undefined,
  }),
  component: MatchmakerPage,
});

function MatchmakerPage() {
  const { selected: selectedFromUrl } = Route.useSearch();
  const navigate = useNavigate();
  const resumeId = useResumeStore((state) => state.resumeId);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedFromUrl ?? null,
  );
  const [selectedDetail, setSelectedDetail] = useState<JobMatchDetail | null>(
    null,
  );
  const [panelOpen, setPanelOpen] = useState(Boolean(selectedFromUrl));
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<MatchRun | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "deadline" | "posted">(
    "score",
  );
  const [activeList, setActiveList] = useState("All Matches");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const requestedProfile = useRef(false);

  const load = useCallback(async () => {
    if (!resumeId) return;
    const result = await listJobMatches(resumeId, {
      pageSize: 100,
      sort: sortBy,
    });
    setJobs(result.items);
    setRun(result.latestRun ?? null);
    if (
      result.stale &&
      !requestedProfile.current &&
      !["queued", "running"].includes(result.latestRun?.status ?? "")
    ) {
      requestedProfile.current = true;
      setRun(await recalculateJobMatches(resumeId));
    }
  }, [resumeId, sortBy]);

  useEffect(() => {
    if (!resumeId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    void load()
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Job matches could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, resumeId]);

  useEffect(() => {
    if (!resumeId || !run || !["queued", "running"].includes(run.status)) {
      return;
    }
    const timer = window.setInterval(() => {
      void getMatchRun(resumeId, run.id)
        .then((next) => {
          setRun(next);
          if (next.status === "completed") {
            window.clearInterval(timer);
            void load();
          }
          if (next.status === "failed") {
            setError(next.errorMessage || "Match calculation failed.");
          }
        })
        .catch(() => undefined);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [load, resumeId, run]);

  const openDetails = useCallback(
    async (jobId: string) => {
      if (!resumeId) return;
      setSelectedId(jobId);
      setPanelOpen(true);
      setSelectedDetail(null);
      setDetailLoading(true);
      try {
        setSelectedDetail(await getJobMatch(resumeId, jobId));
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Job details unavailable.",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [resumeId],
  );

  useEffect(() => {
    if (selectedFromUrl) void openDetails(selectedFromUrl);
  }, [openDetails, selectedFromUrl]);

  const tailor = useCallback(
    async (job: JobMatch) => {
      if (!resumeId) return;
      const detail = await getJobMatch(resumeId, job.jobId);
      useTailoringStore.setState({
        matchId: detail.matchId,
        jobTitle: detail.jobTitle,
        company: detail.company,
        jobDescription: detail.description,
        location: detail.location,
        matchScore: detail.matchScore,
        matchCategory: detail.matchCategory,
        recommendedAction: detail.recommendedAction,
        assessmentCoverage: detail.assessmentCoverage,
        strongMatches: [
          ...detail.matchedRequiredSkills,
          ...detail.matchedTools,
        ].map((label) => ({ label })),
        partialMatches: detail.matchedPreferredSkills.map((label) => ({
          label,
        })),
        missingSkills: [
          ...detail.missingRequiredSkills,
          ...detail.missingPreferredSkills,
          ...detail.missingTools,
        ].map((label) => ({ label })),
        evidenceGaps: detail.hardRequirementFlags
          .filter((flag) => flag.status !== "met")
          .map((flag, index) => ({
            id: `requirement-${index + 1}`,
            title: flag.type.replaceAll("_", " "),
            detail: flag.message,
          })),
        draftGenerated: false,
      });
      setAppliedJobs((current) =>
        current.includes(job.jobId) ? current : [...current, job.jobId],
      );
      navigate({ to: "/tailor" });
    },
    [navigate, resumeId],
  );

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (activeList === "Saved") {
      result = result.filter((job) => savedJobs.includes(job.jobId));
    } else if (activeList === "Applied") {
      result = result.filter((job) => appliedJobs.includes(job.jobId));
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (job) =>
          job.jobTitle.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          [
            ...job.matchedRequiredSkills,
            ...job.matchedPreferredSkills,
            ...job.matchedTools,
          ].some((term) => term.toLowerCase().includes(query)),
      );
    }
    if (selectedModes.length) {
      result = result.filter((job) => selectedModes.includes(job.workMode));
    }
    if (selectedCategories.length) {
      result = result.filter((job) =>
        selectedCategories.includes(job.matchCategory),
      );
    }
    return result;
  }, [
    activeList,
    appliedJobs,
    jobs,
    savedJobs,
    search,
    selectedCategories,
    selectedModes,
  ]);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
  ) =>
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-background text-foreground lg:h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeList={activeList}
          setActiveList={setActiveList}
          allCount={jobs.length}
          savedCount={savedJobs.length}
          appliedCount={appliedJobs.length}
          selectedModes={selectedModes}
          toggleMode={(value) => toggle(setSelectedModes, value)}
          selectedCategories={selectedCategories}
          toggleCategory={(value) => toggle(setSelectedCategories, value)}
          clearAll={() => {
            setSelectedModes([]);
            setSelectedCategories([]);
          }}
        />

        <main className="flex-1 overflow-y-auto px-5 py-6 md:px-8 md:py-7">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#142c3d]">
                  Job Matchmaker
                </h1>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                  Ranked with fixed rules, explicit evidence, and no AI scoring.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeId && (
                  <MatchPreferencesDialog
                    resumeId={resumeId}
                    onRecalculation={(nextRun) => {
                      requestedProfile.current = true;
                      setRun(nextRun);
                    }}
                  />
                )}
                <button className="flex items-center gap-1.5 self-start rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  How it works
                </button>
              </div>
            </div>

            {run && ["queued", "running"].includes(run.status) && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                <span>
                  Calculating matches: {run.processedJobs} of{" "}
                  {run.totalJobs || "..."}
                </span>
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/5 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  placeholder="Search title, company, location or matched skill"
                  className="h-11 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as "score" | "deadline" | "posted",
                  )
                }
                className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
              >
                <option value="score">Match score</option>
                <option value="deadline">Deadline</option>
                <option value="posted">Recently posted</option>
              </select>
            </div>

            <div className="mt-6 space-y-4 pb-10">
              {loading ? (
                <div className="grid min-h-56 place-items-center rounded-xl border border-border bg-card">
                  <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.matchId}
                    job={job}
                    selected={selectedId === job.jobId && panelOpen}
                    onSelect={() => void openDetails(job.jobId)}
                    isSaved={savedJobs.includes(job.jobId)}
                    onToggleSave={() => toggle(setSavedJobs, job.jobId)}
                    onTailor={() => void tailor(job)}
                  />
                ))
              )}

              {!loading && filteredJobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
                  <p className="font-semibold">No calculated matches yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The worker will show jobs here after the shared Reed
                    catalogue is imported and your Base CV match run completes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {panelOpen && selectedDetail && (
          <DetailsPanel
            job={selectedDetail}
            onClose={() => setPanelOpen(false)}
            isSaved={savedJobs.includes(selectedDetail.jobId)}
            onToggleSave={() => toggle(setSavedJobs, selectedDetail.jobId)}
          />
        )}
        {panelOpen && detailLoading && (
          <aside className="hidden w-[400px] shrink-0 place-items-center border-l border-border bg-card lg:grid">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          </aside>
        )}
      </div>
    </div>
  );
}

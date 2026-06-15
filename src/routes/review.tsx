import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { IssueCard } from "@/components/review/IssueCard";
import { ScoreDashboard } from "@/components/review/ScoreDashboard";
import { AdvisorReviewCard } from "@/components/review/AdvisorReviewCard";
import { PdfResumePreview } from "@/components/builder/PdfResumePreview";
import { Button } from "@/components/ui/button";
import { reviewResume } from "@/lib/api/resume-ai.functions";
import { auditResume, type AuditIssue, type AuditResult } from "@/lib/mock-ai";
import { syncCurrentResume } from "@/lib/resume-sync";
import { useResumeStore } from "@/lib/resume-store";
import { type StepId } from "@/lib/resume-types";
import { useResumeRender } from "@/lib/use-resume-render";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Application Readiness - Career Co-Pilot" },
      {
        name: "description",
        content: "Review the readiness and completeness of your base CV.",
      },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const data = useResumeStore((state) => state.data);
  const setStep = useResumeStore((state) => state.setStep);
  const navigate = useNavigate();
  const fallbackAudit = useMemo(() => auditResume(data), [data]);
  const [audit, setAudit] = useState<AuditResult>(fallbackAudit);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const preview = useResumeRender(100);

  const runReview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAudit(await reviewResume({ data: { resume: data } }));
    } catch {
      setAudit(fallbackAudit);
      setError(
        "AI review is unavailable, so this page is using the local readiness checks.",
      );
    } finally {
      setLoading(false);
    }
  }, [data, fallbackAudit]);

  useEffect(() => {
    void runReview();
  }, [runReview]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f7f8]">
      <div className="page-shell max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="page-kicker">Base CV review</p>
            <h1 className="page-title mt-2">Application readiness</h1>
            <p className="page-description mt-2 max-w-2xl">
              A practical estimate based on completeness, clarity, evidence, and
              parser-friendly structure. It is not a guarantee of recruiter or
              ATS outcomes.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to="/builder">
              <Button variant="outline">
                <ArrowLeft className="size-4" /> Back to builder
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => void runReview()}
              disabled={loading}
            >
              <RefreshCw
                className={loading ? "size-4 animate-spin" : "size-4"}
              />
              Refresh review
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex gap-3 rounded-md border border-[#ead6ae] bg-[#fff7e6] p-4 text-sm text-[#74551f]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mt-7">
          <ScoreDashboard
            overall={audit.overall}
            categories={audit.categories}
          />
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_300px]">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#17364b]">
                  Recommended improvements
                </h2>
                <p className="mt-1 text-sm text-[#718590]">
                  Address higher-impact items before tailoring this CV to a
                  role.
                </p>
              </div>
              <span className="section-chip">{audit.issues.length} items</span>
            </div>
            <div className="space-y-3">
              {audit.issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  resolved={resolved.has(issue.id)}
                  onAccept={() => {
                    setResolved((items) => new Set(items).add(issue.id));
                    toast.success("Marked as addressed");
                  }}
                  onReject={() =>
                    setResolved((items) => new Set(items).add(issue.id))
                  }
                  onEdit={() => {
                    setStep(stepForIssue(issue));
                    void navigate({ to: "/builder" });
                  }}
                />
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="surface-panel overflow-hidden">
              <div className="border-b border-[#d9e2e7] px-4 py-3">
                <h2 className="text-sm font-bold text-[#17364b]">
                  Document preview
                </h2>
                <p className="mt-0.5 text-xs text-[#718590]">
                  Exact compiled PDF
                </p>
              </div>
              <PdfResumePreview
                pdf={preview.pdf}
                pdfUrl={preview.pdfUrl}
                loading={preview.loading}
                error={preview.error}
                className="h-[430px] min-h-0"
                paddingClass="p-3"
              />
            </div>

            <AdvisorReviewCard
              onEditSection={(section) => {
                setStep(section);
                void navigate({ to: "/builder" });
              }}
            />

            <div className="surface-panel p-5">
              <h2 className="text-sm font-bold text-[#17364b]">Review basis</h2>
              <dl className="mt-4 space-y-3 text-xs">
                <ReviewBasis label="Completeness" value="Profile sections" />
                <ReviewBasis label="Impact" value="Evidence and outcomes" />
                <ReviewBasis label="Readability" value="Clarity and length" />
                <ReviewBasis label="Structure" value="Parser-friendly layout" />
              </dl>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex justify-end border-t border-[#d9e2e7] pt-5">
          <Button
            size="lg"
            disabled={continuing}
            onClick={() => {
              void (async () => {
                setContinuing(true);
                try {
                  await syncCurrentResume();
                  await navigate({ to: "/finalize" });
                } catch (caught) {
                  toast.error("Your latest changes could not be saved", {
                    description:
                      caught instanceof Error
                        ? caught.message
                        : "Reconnect and try again.",
                  });
                } finally {
                  setContinuing(false);
                }
              })();
            }}
          >
            {continuing ? "Saving..." : "Continue to download"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}

function stepForIssue(issue: AuditIssue): StepId {
  const steps: Partial<Record<AuditIssue["category"], StepId>> = {
    Contact: "contact",
    Experience: "experience",
    Education: "education",
    Skills: "skills",
    Summary: "summary",
    Achievements: "achievements",
  };
  return steps[issue.category] ?? "contact";
}

function ReviewBasis({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#e1e8eb] pt-3 first:border-0 first:pt-0">
      <dt className="font-semibold text-[#425968]">{label}</dt>
      <dd className="text-right text-[#718590]">{value}</dd>
    </div>
  );
}

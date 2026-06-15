import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  Eye,
  FilePlus2,
  LayoutTemplate,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PdfResumePreview } from "@/components/builder/PdfResumePreview";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createResumeVersion, updateResume } from "@/lib/resume-api";
import { syncCurrentResume } from "@/lib/resume-sync";
import { useResumeStore } from "@/lib/resume-store";
import {
  defaultLayoutPreferences,
  emptyResume,
  type TemplateId,
} from "@/lib/resume-types";
import { getResumeCompletion } from "@/lib/resume-workflow";
import { TEMPLATES } from "@/lib/templates";
import { useResumeRender } from "@/lib/use-resume-render";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cv")({
  head: () => ({
    meta: [
      { title: "Your Base CV - Career Co-Pilot" },
      {
        name: "description",
        content:
          "Track your Base CV progress, continue editing, preview, or download.",
      },
    ],
  }),
  component: BaseCVDashboard,
});

function useCompletion() {
  const data = useResumeStore((state) => state.data);
  return getResumeCompletion(data);
}

function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (percentage / 100);

  return (
    <div className="relative flex size-[174px] shrink-0 items-center justify-center">
      <svg
        width="174"
        height="174"
        viewBox="0 0 174 174"
        aria-label={`${percentage}% complete`}
        role="img"
      >
        <circle
          cx="87"
          cy="87"
          r={radius}
          fill="none"
          stroke="#e4eaed"
          strokeWidth="8"
        />
        <circle
          cx="87"
          cy="87"
          r={radius}
          fill="none"
          stroke="#367f7b"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference / 4}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[38px] font-bold leading-none tracking-tight text-[#122b3c]">
          {percentage}
          <span className="text-2xl">%</span>
        </p>
        <p className="mt-2 text-sm font-medium text-[#607482]">complete</p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  const { pdf, pdfUrl, error, loading } = useResumeRender(100);

  return (
    <div className="surface-panel h-[380px] overflow-hidden p-4">
      <div className="pointer-events-none h-full overflow-hidden rounded-sm border border-[#e2e8eb] bg-[#edf1f3]">
        <PdfResumePreview
          pdf={pdf}
          pdfUrl={pdfUrl}
          loading={loading}
          error={error}
          className="h-full min-h-0"
          bgClass="bg-[#edf1f3]"
          paddingClass="p-3"
        />
      </div>
    </div>
  );
}

type WorkflowState = "done" | "active" | "upcoming";

function WorkflowStepper({ percentage }: { percentage: number }) {
  const steps: Array<{
    label: string;
    description: string;
    state: WorkflowState;
  }> = [
    { label: "Setup", description: "Completed", state: "done" },
    { label: "Import", description: "Completed or skipped", state: "done" },
    {
      label: "Build",
      description:
        percentage === 100 ? "Completed" : `In progress (${percentage}%)`,
      state: percentage === 100 ? "done" : "active",
    },
    {
      label: "Review",
      description: percentage === 100 ? "Ready" : "Upcoming",
      state: percentage === 100 ? "active" : "upcoming",
    },
    { label: "Download", description: "Upcoming", state: "upcoming" },
  ];

  return (
    <div className="grid min-w-[760px] grid-cols-5">
      {steps.map((step, index) => (
        <div key={step.label} className="flex min-w-0 flex-col items-center">
          <div className="flex w-full items-center">
            <div
              className={cn(
                "h-[3px] flex-1",
                index === 0
                  ? "invisible"
                  : steps[index - 1]?.state === "done"
                    ? "bg-[#367f7b]"
                    : "border-t-2 border-dashed border-[#dfe5e8]",
              )}
            />
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full border-[3px] text-base font-semibold",
                step.state === "done" &&
                  "border-[#367f7b] bg-[#367f7b] text-white",
                step.state === "active" &&
                  "border-[#367f7b] bg-white text-[#17364b]",
                step.state === "upcoming" &&
                  "border-[#edf1f3] bg-[#edf1f3] text-[#536978]",
              )}
            >
              {step.state === "done" ? (
                <Check className="size-6" strokeWidth={2.4} />
              ) : (
                index + 1
              )}
            </div>
            <div
              className={cn(
                "h-[3px] flex-1",
                index === steps.length - 1
                  ? "invisible"
                  : step.state === "done"
                    ? "bg-[#367f7b]"
                    : "border-t-2 border-dashed border-[#dfe5e8]",
              )}
            />
          </div>
          <p className="mt-4 text-base font-semibold text-[#172b3a]">
            {step.label}
          </p>
          <p
            className={cn(
              "mt-1 text-sm",
              step.state === "done"
                ? "text-[#367f7b]"
                : step.state === "active"
                  ? "text-[#607482]"
                  : "text-[#8798a3]",
            )}
          >
            {step.description}
          </p>
        </div>
      ))}
    </div>
  );
}

function BaseCVDashboard() {
  const navigate = useNavigate();
  const resumeId = useResumeStore((state) => state.resumeId);
  const hydrated = useResumeStore((state) => state.hydrated);
  const lastSavedAt = useResumeStore((state) => state.lastSavedAt);
  const template = useResumeStore((state) => state.template);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const hydrateRemote = useResumeStore((state) => state.hydrateRemote);
  const percentage = useCompletion();
  const [newCvPending, setNewCvPending] = useState(false);

  useEffect(() => {
    if (hydrated && !resumeId) {
      void navigate({ to: "/builder" });
    }
  }, [hydrated, navigate, resumeId]);

  if (!hydrated || !resumeId) return null;

  const templateLabel =
    TEMPLATES.find((item) => item.id === template)?.name ?? template;
  const lastUpdatedLabel = lastSavedAt
    ? new Date(lastSavedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Today";

  const startNewCv = async () => {
    if (
      !window.confirm(
        "Start a new Base CV? Your current version will be saved for recovery, then the builder will be cleared.",
      )
    ) {
      return;
    }
    setNewCvPending(true);
    try {
      await syncCurrentResume();
      const current = useResumeStore.getState();
      if (!current.resumeId)
        throw new Error("The current Base CV was not found.");

      await createResumeVersion(current.resumeId, "before-new-cv");
      const record = await updateResume(current.resumeId, {
        name: "Base CV",
        careerStage: "graduate",
        template: "graduate-compact",
        layoutPreferences: defaultLayoutPreferences(),
        revision: current.revision,
        data: emptyResume(),
      });

      hydrateRemote({
        id: record.id,
        name: record.name,
        revision: record.revision,
        stage: record.careerStage,
        template: record.template,
        layoutPreferences: record.layoutPreferences,
        data: record.data,
      });
      toast.success("Your new Base CV is ready to set up");
      await navigate({ to: "/builder" });
    } catch (error) {
      toast.error("A new CV could not be started", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setNewCvPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7f8]">
      <div className="mx-auto max-w-[1460px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        <header className="mb-7">
          <div>
            <p className="page-kicker">Base CV Builder</p>
            <h1 className="page-title mt-2">Your Base CV</h1>
            <p className="page-description mt-1.5">
              Keep one trusted CV ready for matching and tailored applications.
            </p>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,2.15fr)_minmax(320px,1fr)]">
          <div className="surface-panel min-h-[380px] p-6 sm:p-8">
            <div className="grid h-full items-center gap-7 md:grid-cols-[190px_1fr] xl:grid-cols-[190px_minmax(190px,1fr)_280px]">
              <div className="flex justify-center">
                <ProgressRing percentage={percentage} />
              </div>

              <div className="space-y-7 border-t border-[#e1e8eb] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <MetaRow
                  icon={<CalendarDays className="size-6" />}
                  label="Last updated"
                  value={lastUpdatedLabel}
                />
                <MetaRow
                  icon={<LayoutTemplate className="size-6" />}
                  label="Template"
                  value={
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={template}
                        onValueChange={(value) =>
                          setTemplate(value as TemplateId)
                        }
                      >
                        <SelectTrigger
                          className="h-10 min-w-[190px] border-[#cbd8de] bg-white"
                          aria-label="Choose CV template"
                        >
                          <SelectValue>{templateLabel}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="rounded-full border border-[#cde1df] bg-[#edf8f7] px-2.5 py-1 text-[11px] font-semibold text-[#28716d]">
                        Selected
                      </span>
                    </div>
                  }
                />
              </div>

              <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => void startNewCv()}
                  disabled={newCvPending}
                  className="h-14 justify-start bg-white px-6 text-base"
                >
                  {newCvPending ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <FilePlus2 className="size-5" />
                  )}
                  New CV
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="h-14 justify-between px-6 text-base"
                >
                  <Link to="/builder">
                    <span className="flex items-center gap-3">
                      <Pencil className="size-5" />
                      Continue editing
                    </span>
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 justify-start px-6 text-base"
                >
                  <Link to="/review">
                    <Eye className="size-5" />
                    Preview CV
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 justify-start px-6 text-base"
                >
                  <Link to="/finalize">
                    <Download className="size-5" />
                    Download
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <DashboardPreview />
        </section>

        <section className="surface-panel mt-7 overflow-x-auto px-5 py-8 sm:px-10">
          <WorkflowStepper percentage={percentage} />
        </section>
      </div>
    </main>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 text-[#425968]">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#607482]">{label}</p>
        <div className="mt-1 text-base font-medium text-[#263f50]">{value}</div>
      </div>
    </div>
  );
}

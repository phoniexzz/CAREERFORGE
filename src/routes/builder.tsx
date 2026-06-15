import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Award,
  Briefcase,
  BriefcaseBusiness,
  Check,
  FileSearch,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LivePreview } from "@/components/builder/LivePreview";
import { StepProgress } from "@/components/builder/StepProgress";
import { ContactStep } from "@/components/builder/steps/ContactStep";
import { AchievementsStep } from "@/components/builder/steps/AchievementsStep";
import { CertificationsStep } from "@/components/builder/steps/CertificationsStep";
import { EducationStep } from "@/components/builder/steps/EducationStep";
import { ExperienceStep } from "@/components/builder/steps/ExperienceStep";
import { ProjectsStep } from "@/components/builder/steps/ProjectsStep";
import { SkillsStep } from "@/components/builder/steps/SkillsStep";
import { SummaryStep } from "@/components/builder/steps/SummaryStep";
import { Button } from "@/components/ui/button";
import { syncCurrentResume } from "@/lib/resume-sync";
import { useResumeStore } from "@/lib/resume-store";
import { STEPS, type StepId, type CareerStage, type TemplateId } from "@/lib/resume-types";
import { validateResumeStep, hasMeaningfulResumeContent } from "@/lib/resume-workflow";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Base CV Builder - Career Co-Pilot" },
      {
        name: "description",
        content: "Build a structured base CV with a live document preview.",
      },
    ],
  }),
  component: BuilderRouteComponent,
});

// ─────────────────────────────────────────────────────────────────────────────
// Setup Onboarding Constants (Migrated from original index route)
// ─────────────────────────────────────────────────────────────────────────────

const CAREER_STAGES: Array<{
  value: CareerStage;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "internship",
    label: "Internship",
    sub: "Placement / year in industry",
    icon: GraduationCap,
  },
  {
    value: "graduate",
    label: "Graduate",
    sub: "First professional role",
    icon: Award,
  },
  {
    value: "early",
    label: "Early career",
    sub: "1-3 years of experience",
    icon: TrendingUp,
  },
  {
    value: "mid",
    label: "Mid-career",
    sub: "3-8 years of experience",
    icon: Briefcase,
  },
  {
    value: "experienced",
    label: "Experienced",
    sub: "8+ years / senior level",
    icon: Star,
  },
];

const STAGE_HINTS: Record<CareerStage, { title: string; hint: string }> = {
  internship: {
    title: "Internship / placement focus",
    hint: "Highlights coursework, projects, and any placements. Short one-page format optimised for early experience.",
  },
  graduate: {
    title: "Graduate profile",
    hint: "Emphasises education, dissertation or final-year projects, and any part-time or voluntary experience.",
  },
  early: {
    title: "Early career",
    hint: "Balances education and up to three years of professional experience. We prompt you to quantify achievements.",
  },
  mid: {
    title: "Mid-career professional",
    hint: "Focuses on impact and progression. Education moves below experience; results and leadership are highlighted.",
  },
  experienced: {
    title: "Experienced / senior",
    hint: "Concise executive profile. Strategic achievements, scope of responsibility, and leadership at the front.",
  },
};

const OUTCOMES = [
  {
    icon: FileSearch,
    title: "Structured profile",
    text: "One reliable source for every application.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Job-ready foundation",
    text: "Prepared for matching and role-specific tailoring.",
  },
  {
    icon: ShieldCheck,
    title: "Verified content",
    text: "AI guidance without invented achievements.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Setup Onboarding Page Component
// ─────────────────────────────────────────────────────────────────────────────

function SetupPage() {
  const stage = useResumeStore((s) => s.stage);
  const setStage = useResumeStore((s) => s.setStage);
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const navigate = useNavigate();

  const hint = STAGE_HINTS[stage];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f7f8]">
      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[#17364b] px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10">
        <div className="quiet-grid absolute inset-0 opacity-[0.08]" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9fd4d0]">
              <Sparkles className="size-4" />
              Resume Studio
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
              Build your verified base CV
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#d7e3e9]">
              Create the profile that powers job matching, tailored
              applications, readiness reviews, and advisor feedback.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
            {OUTCOMES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-[#9fd4d0]">
                  <Icon className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs text-[#b9cbd4]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup form */}
      <section className="px-5 py-10 sm:px-10 lg:px-14 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                  1
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8aa5b4]">
                  Step 1 of 5
                </span>
              </div>
              <h2 className="page-title mt-3">Set up your base CV</h2>
              <p className="page-description mt-1.5 max-w-lg">
                Choose your career stage and preferred layout. You can change
                both at any time.
              </p>
            </div>
            <div className="hidden rounded-md border border-[#cfe2e0] bg-[#e7f4f2] px-3 py-2 text-xs font-semibold text-[#0f625e] sm:block">
              About 2 minutes
            </div>
          </div>

          <div className="surface-panel mt-8 p-6 sm:p-8">
            <div className="grid gap-10 lg:grid-cols-[300px_1px_minmax(0,1fr)]">
              {/* Career stage selection */}
              <div className="space-y-5">
                <div>
                  <p className="field-label mb-3">Career stage</p>
                  <div className="flex flex-col gap-2">
                    {CAREER_STAGES.map(({ value, label, sub, icon: Icon }) => {
                      const active = stage === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setStage(value)}
                          className={cn(
                            "group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3 text-left transition-all duration-150",
                            active
                              ? "border-brand bg-brand-soft/50 ring-2 ring-brand/15"
                              : "border-[#d9e2e7] bg-white hover:border-[#9cb8b5] hover:bg-[#f7fbfb]",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                              active
                                ? "bg-brand text-white"
                                : "bg-[#edf1f3] text-[#5a7b8c] group-hover:bg-[#dff0ee] group-hover:text-brand",
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm font-semibold leading-tight",
                                active ? "text-brand" : "text-[#17364b]",
                              )}
                            >
                              {label}
                            </p>
                            <p className="mt-0.5 text-xs text-[#7a99a6]">
                              {sub}
                            </p>
                          </div>
                          {active && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                              <Check className="size-3" strokeWidth={2.5} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-[#c8e4e2] bg-gradient-to-br from-[#eefaf9] to-[#f5fffe] p-4">
                  <p className="text-xs font-semibold text-[#147d78]">
                    {hint.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#3d6e72]">
                    {hint.hint}
                  </p>
                </div>
              </div>

              <div className="hidden w-px self-stretch bg-[#e8eef1] lg:block" />

              {/* Template selection */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="field-label">Resume layout</p>
                    <p className="mt-1 text-xs text-[#718590]">
                      You can switch layouts at any time.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#d9e2e7] bg-white px-2.5 py-1 text-xs font-medium text-[#718590]">
                    {TEMPLATES.length} options
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {TEMPLATES.map((item) => {
                    const active = item.id === template;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTemplate(item.id as TemplateId)}
                        className={cn(
                          "group relative grid min-h-[136px] grid-cols-[72px_1fr] gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                          active
                            ? "border-brand bg-brand-soft/40 shadow-md ring-2 ring-brand/15"
                            : "border-[#d9e2e7] bg-white hover:border-[#9cb8b5] hover:shadow-sm",
                        )}
                      >
                        <div
                          className={cn(
                            "aspect-[3/4] rounded-md border bg-[#f9fbfb] p-2 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]",
                            active ? "border-brand/30" : "border-[#d9e2e7]",
                            item.id === "technical-analyst" &&
                              "border-l-[10px] border-l-[#dce7ec]",
                          )}
                        >
                          <div
                            className={cn(
                              "h-1.5 rounded-sm",
                              item.id === "modern-professional"
                                ? "w-full bg-brand"
                                : "w-2/3 bg-[#29485b]",
                            )}
                          />
                          <div className="mt-1 h-1 w-1/2 bg-[#b9c7cf]" />
                          <div className="my-2 h-px bg-[#d9e2e7]" />
                          <div className="h-1 w-1/3 bg-brand/60" />
                          <div className="mt-1 space-y-1">
                            <div className="h-0.5 w-full bg-[#d9e2e7]" />
                            <div className="h-0.5 w-5/6 bg-[#d9e2e7]" />
                            <div className="h-0.5 w-3/4 bg-[#d9e2e7]" />
                          </div>
                          <div className="mt-3 h-1 w-1/3 bg-brand/60" />
                          <div className="mt-1 space-y-1">
                            <div className="h-0.5 w-full bg-[#d9e2e7]" />
                            <div className="h-0.5 w-2/3 bg-[#d9e2e7]" />
                          </div>
                        </div>

                        <div className="min-w-0 py-0.5">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-semibold leading-tight text-[#17364b]">
                              {item.name}
                            </p>
                            {active && (
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                                <Check className="size-3" strokeWidth={2.5} />
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-xs leading-[1.6] text-[#607482]">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 text-xs text-[#607482]">
              <ShieldCheck className="size-4 shrink-0 text-brand" />
              Your selected stage and layout are saved to your account.
            </p>
            <Button
              size="lg"
              onClick={() => navigate({ to: "/import" })}
              className="gap-2 sm:min-w-48"
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder Conditional Route Portal
// ─────────────────────────────────────────────────────────────────────────────

function BuilderRouteComponent() {
  const resumeId = useResumeStore((state) => state.resumeId);
  const hydrated = useResumeStore((state) => state.hydrated);
  const data = useResumeStore((state) => state.data);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f8]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-[#607482] font-semibold">Loading builder...</p>
        </div>
      </div>
    );
  }

  const hasExistingCv = hasMeaningfulResumeContent(data);
  if (!resumeId || !hasExistingCv) {
    return <SetupPage />;
  }

  return <BuilderPage />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Step Builder Component
// ─────────────────────────────────────────────────────────────────────────────

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  contact: ContactStep,
  experience: ExperienceStep,
  education: EducationStep,
  skills: SkillsStep,
  projects: ProjectsStep,
  summary: SummaryStep,
  achievements: AchievementsStep,
  certifications: CertificationsStep,
};

function BuilderPage() {
  const step = useResumeStore((state) => state.step);
  const setStep = useResumeStore((state) => state.setStep);
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const rawIndex = STEPS.findIndex((item) => item.id === step);
  const index = rawIndex >= 0 ? rawIndex : 0;
  const StepComponent = STEP_COMPONENTS[step];

  const saveCurrentStep = async () => {
    const errors = validateResumeStep(step, data, template);
    if (errors.length > 0) {
      toast.error("Complete this section before continuing", {
        description: errors.join(" "),
      });
      return false;
    }

    setSaving(true);
    try {
      await syncCurrentResume();
      return true;
    } catch (error) {
      toast.error("Your changes could not be saved", {
        description:
          error instanceof Error ? error.message : "Reconnect and try again.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!(await saveCurrentStep())) return;
    if (index < STEPS.length - 1) {
      setStep(STEPS[index + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      await navigate({ to: "/review" });
    }
  };

  const previous = () => {
    if (index === 0) {
      void navigate({ to: "/cv" });
      return;
    }
    setStep(STEPS[index - 1].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeStep = async (target: StepId) => {
    const targetIndex = STEPS.findIndex((item) => item.id === target);
    if (targetIndex > index && !(await saveCurrentStep())) return;
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#edf1f3]">
      <StepProgress
        current={step}
        onChange={(target) => void changeStep(target)}
        disabled={saving}
      />
      <main className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(0,1fr)_560px]">
        <section className="min-w-0 border-r border-[#d9e2e7] bg-[#f7f9fa]">
          <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 lg:py-9">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <span className="text-xs font-semibold text-[#607482]">
                Step {index + 1} of {STEPS.length}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Eye className="size-4" />
                Preview available on desktop
              </span>
            </div>

            <StepComponent />

            <div className="mt-7 flex items-center justify-between border-t border-[#d9e2e7] pt-5">
              <Button variant="outline" onClick={previous} disabled={saving}>
                <ArrowLeft className="size-4" />
                {index === 0 ? "Back to Base CV" : "Previous"}
              </Button>
              <Button onClick={() => void next()} disabled={saving}>
                {saving
                  ? "Saving..."
                  : index === STEPS.length - 1
                    ? "Save and review"
                    : "Save and continue"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <aside className="hidden min-h-screen bg-[#e6ecef] lg:block">
          <LivePreview />
        </aside>
      </main>
    </div>
  );
}


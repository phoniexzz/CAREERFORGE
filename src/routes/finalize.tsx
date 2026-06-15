import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  FileText,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PdfResumePreview } from "@/components/builder/PdfResumePreview";
import { useResumeStore } from "@/lib/resume-store";
import { createResumeVersion, exportResumeDocx } from "@/lib/resume-api";
import { syncCurrentResume } from "@/lib/resume-sync";
import { useResumeRender } from "@/lib/use-resume-render";

export const Route = createFileRoute("/finalize")({
  head: () => ({
    meta: [
      { title: "Resume Options - Career Co-Pilot" },
      {
        name: "description",
        content: "Download your base CV or use it in the next career workflow.",
      },
    ],
  }),
  component: FinalizePage,
});

function FinalizePage() {
  const navigate = useNavigate();
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);
  const stage = useResumeStore((state) => state.stage);
  const layoutPreferences = useResumeStore((state) => state.layoutPreferences);
  const markSaved = useResumeStore((state) => state.markSaved);
  const resumeId = useResumeStore((state) => state.resumeId);
  const setStep = useResumeStore((state) => state.setStep);
  const [docxLoading, setDocxLoading] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const { render, pdf, pdfUrl, error, loading } = useResumeRender(50);
  const fileStem =
    data.contact.fullName.trim().replace(/[^A-Za-z0-9 -]+/g, "") || "Resume";
  const downloadPdf = () => {
    if (!pdf || !render) {
      toast.error("The PDF is still being prepared");
      return;
    }
    if (
      render.pageCount > 2 &&
      !window.confirm(
        "This CV exceeds two pages. Download it anyway? Most UK non-academic CVs should be no longer than two pages.",
      )
    ) {
      return;
    }
    downloadBlob(pdf, `${fileStem}-CV.pdf`);
  };
  const downloadDocx = async () => {
    if (!render) {
      toast.error("Wait for the document preview to finish");
      return;
    }
    setDocxLoading(true);
    try {
      const blob = await exportResumeDocx({
        careerStage: stage,
        template,
        layoutPreferences,
        data,
        fileName: `${fileStem}-CV.docx`,
        fittingProfile: render.fittingProfile,
      });
      downloadBlob(blob, `${fileStem}-CV.docx`);
      toast.success("Editable Word document downloaded", {
        description:
          "Word may paginate slightly differently from the compiled PDF.",
      });
    } catch (caught) {
      toast.error("DOCX export failed", {
        description: caught instanceof Error ? caught.message : "Try again.",
      });
    } finally {
      setDocxLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7f8]">
      <div className="page-shell max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="page-kicker">Base CV complete</p>
            <h1 className="page-title mt-2">Choose your next action</h1>
            <p className="page-description mt-2 max-w-2xl">
              Keep this as your verified foundation, export a copy, or use it to
              prepare a role-specific application.
            </p>
          </div>
          <Link to="/review">
            <Button variant="outline">
              <ArrowLeft className="size-4" /> Back to readiness
            </Button>
          </Link>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="space-y-4">
            <div className="surface-panel overflow-hidden">
              <div className="border-b border-[#d9e2e7] bg-[#f7fbfa] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md bg-brand text-white">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#17364b]">
                      Base CV ready
                    </h2>
                    <p className="text-xs text-[#718590]">
                      Saved securely to your account
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-[#e1e8eb]">
                <Action
                  icon={Download}
                  title="Download PDF"
                  description="Download the exact compiled preview"
                  onClick={downloadPdf}
                  primary
                  disabled={!pdf || loading}
                />
                <Action
                  icon={docxLoading ? LoaderCircle : FileText}
                  title="Download DOCX"
                  description="Editable Word file; pagination may differ"
                  onClick={() => void downloadDocx()}
                  disabled={docxLoading || !render}
                />
                <Action
                  icon={Save}
                  title="Save current version"
                  description="Create a recovery point in your account"
                  disabled={versionLoading}
                  onClick={() => {
                    void (async () => {
                      setVersionLoading(true);
                      try {
                        await syncCurrentResume();
                        if (resumeId) {
                          await createResumeVersion(resumeId, "manual");
                        }
                        markSaved();
                        toast.success("Resume saved to your account");
                      } catch (error) {
                        toast.error("Resume could not be saved", {
                          description:
                            error instanceof Error
                              ? error.message
                              : "Try again.",
                        });
                      } finally {
                        setVersionLoading(false);
                      }
                    })();
                  }}
                />
              </div>
            </div>

            <div className="surface-panel p-5">
              <p className="text-xs font-bold uppercase text-[#607482]">
                Continue in Career Co-Pilot
              </p>
              <div className="mt-3 space-y-2">
                <NextAction
                  icon={BriefcaseBusiness}
                  title="Find matching opportunities"
                  onClick={() =>
                    navigate({
                      to: "/matchmaker",
                      search: { selected: undefined },
                    })
                  }
                />
                <NextAction
                  icon={FileText}
                  title="Tailor an application"
                  onClick={() => navigate({ to: "/tailor" })}
                />
              </div>
            </div>
          </section>

          <section className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#d9e2e7] px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-[#17364b]">
                  Final document
                </h2>
                <p className="mt-0.5 text-xs text-[#718590]">
                  Review before downloading or sharing.
                </p>
              </div>
              <span className="section-chip">A4</span>
            </div>
            {render && (
              <div className="border-b border-[#d9e2e7] bg-white px-5 py-3">
                <p className="text-xs font-semibold text-[#425968]">
                  {render.pageCount} {render.pageCount === 1 ? "page" : "pages"}
                  {" | "}
                  {render.fittingProfile.replace("-", " ")} spacing
                </p>
                {render.warnings.map((warning) => (
                  <div
                    key={warning.code}
                    className="mt-2 flex gap-2 text-xs leading-5 text-amber-900"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>{warning.message}</span>
                  </div>
                ))}
                {render.suggestions.length > 0 && (
                  <div className="mt-3 rounded-md bg-[#f4f7f8] p-3">
                    <p className="text-xs font-bold text-[#17364b]">
                      Suggested reductions
                    </p>
                    {render.suggestions.map((suggestion) => (
                      <div
                        key={`${suggestion.section}-${suggestion.itemId || suggestion.title}`}
                        className="mt-2 flex items-start gap-3"
                      >
                        <p className="min-w-0 flex-1 text-xs text-[#607482]">
                          <strong>{suggestion.title}:</strong>{" "}
                          {suggestion.message}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[10px]"
                          onClick={() => {
                            setStep(suggestion.section);
                            navigate({ to: "/builder" });
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <PdfResumePreview
              pdf={pdf}
              pdfUrl={pdfUrl}
              loading={loading}
              error={error}
              className="min-h-[760px]"
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function Action({
  icon: Icon,
  title,
  description,
  onClick,
  primary,
  disabled,
}: {
  icon: typeof Download;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 bg-white px-5 py-4 text-left transition-colors hover:bg-[#f7fafb] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
          primary ? "bg-brand text-white" : "bg-[#edf1f3] text-[#425968]"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#17364b]">{title}</span>
        <span className="mt-0.5 block text-xs text-[#718590]">
          {description}
        </span>
      </span>
      <ArrowRight className="size-4 text-[#91a2ac]" />
    </button>
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function NextAction({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Download;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-md border border-[#d9e2e7] bg-white px-3 py-3 text-left text-sm font-semibold text-[#28485b] hover:border-[#a9bfbd] hover:bg-[#f7fbfa]"
    >
      <Icon className="size-4 text-brand" />
      <span className="flex-1">{title}</span>
      <ArrowRight className="size-3.5 text-[#91a2ac]" />
    </button>
  );
}

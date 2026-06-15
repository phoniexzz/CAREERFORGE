import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  FileText,
  FileUser,
  LockKeyhole,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseResumeUpload } from "@/lib/api/resume-ai.functions";
import { exampleResume } from "@/lib/mock-cv";
import { normalizeResumeData } from "@/lib/resume-data";
import { ensureUniqueIds } from "@/lib/resume-import";
import { updateResume } from "@/lib/resume-api";
import { useResumeStore } from "@/lib/resume-store";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Import CV - Career Co-Pilot" },
      {
        name: "description",
        content: "Import a PDF or DOCX into your Base CV.",
      },
    ],
  }),
  component: ImportPage,
});

type Stage = "idle" | "parsing" | "saving";

function ImportPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");

  const resumeId = useResumeStore((state) => state.resumeId);
  const resumeName = useResumeStore((state) => state.resumeName);
  const revision = useResumeStore((state) => state.revision);
  const careerStage = useResumeStore((state) => state.stage);
  const template = useResumeStore((state) => state.template);
  const layoutPreferences = useResumeStore((state) => state.layoutPreferences);
  const hydrateRemote = useResumeStore((state) => state.hydrateRemote);
  const reset = useResumeStore((state) => state.reset);
  const setStep = useResumeStore((state) => state.setStep);
  const setTemplate = useResumeStore((state) => state.setTemplate);
  const loadData = useResumeStore((state) => state.loadData);

  const handleFile = async (file: File) => {
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      toast.error("Choose a PDF or DOCX file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Choose a file under 10 MB.");
      return;
    }

    setFileName(file.name);
    setStage("parsing");

    try {
      const parsed = await parseResumeUpload({ file });
      const data = ensureUniqueIds(normalizeResumeData(parsed.sections));

      setStage("saving");
      if (!resumeId) {
        throw new Error("Your Base CV workspace is not ready.");
      }

      const record = await updateResume(resumeId, {
        name: resumeName,
        careerStage,
        template,
        layoutPreferences,
        revision,
        data,
      });
      hydrateRemote({
        id: record.id,
        name: record.name,
        revision: record.revision,
        stage: record.careerStage,
        template: record.template,
        layoutPreferences: record.layoutPreferences,
        data: record.data,
        evidence: parsed.evidence,
      });

      setStep("contact");
      toast.success("CV imported successfully", {
        description: `${parsed.diagnostics.spanCount} evidence lines found across ${parsed.diagnostics.pageCount} page${parsed.diagnostics.pageCount === 1 ? "" : "s"}.`,
      });
      await navigate({ to: "/builder" });
    } catch (error) {
      setStage("idle");
      toast.error("Import failed", {
        description:
          error instanceof Error
            ? error.message
            : "The document could not be read.",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const startBlank = async () => {
    reset();
    await navigate({ to: "/builder" });
  };

  const loadExample = async () => {
    if (
      !window.confirm(
        "Load the example CV? This will replace the current structured resume.",
      )
    ) {
      return;
    }
    loadData(exampleResume());
    setTemplate("classic-ats");
    setStep("contact");
    toast.success("Example CV loaded");
    await navigate({ to: "/builder" });
  };

  const isBusy = stage === "parsing" || stage === "saving";

  return (
    <main className="min-h-screen bg-[#f4f7f8]">
      <div className="page-shell max-w-6xl">
        <button
          type="button"
          onClick={() => void navigate({ to: "/builder" })}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#607482] hover:text-[#17364b]"
        >
          <ArrowLeft className="size-4" />
          Back to setup
        </button>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <p className="page-kicker">Step 2 of 5</p>
            <h1 className="page-title mt-2">Bring in your existing CV</h1>
            <p className="page-description mt-2 max-w-2xl">
              Upload a PDF or DOCX, or start with a blank CV and enter each
              section yourself.
            </p>

            <div className="surface-panel mt-7 p-5 sm:p-6">
              <div
                onDrop={(event) => {
                  event.preventDefault();
                  if (isBusy) return;
                  const file = event.dataTransfer.files[0];
                  if (file) void handleFile(file);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-[#aebfc8] bg-[#f8fafb] px-5 py-10 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-md border border-[#c8dfdc] bg-[#e7f4f2] text-brand">
                  {isBusy ? (
                    <FileText className="size-6 animate-pulse" />
                  ) : (
                    <Upload className="size-6" />
                  )}
                </div>

                <h2 className="mt-5 text-base font-bold text-[#17364b]">
                  {stage === "parsing"
                    ? `Reading ${fileName}...`
                    : stage === "saving"
                      ? "Saving your imported CV..."
                      : "Drop your CV here"}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#607482]">
                  {isBusy
                    ? "Structuring the document into editable CV sections."
                    : "PDF or DOCX, up to 10 MB and 20 pages."}
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />

                {!isBusy && (
                  <Button
                    className="mt-5"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Select document
                  </Button>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 border-t border-[#e0e7eb] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[#718590]">
                  Uploading is optional. You can also start section by section.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={() => void loadExample()}
                    disabled={isBusy}
                  >
                    <FileUser className="size-4" />
                    Use example CV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void startBlank()}
                    disabled={isBusy}
                  >
                    Start blank
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:pt-[88px]">
            <div className="surface-panel p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#17364b]">
                <LockKeyhole className="size-4 text-brand" />
                Storage-free import
              </div>
              <div className="mt-4 space-y-4">
                <PrivacyRow
                  title="Processed in memory"
                  text="The uploaded file and extracted source text are not retained after parsing."
                />
                <PrivacyRow
                  title="Evidence-based parsing"
                  text="Imported fields must be supported by matching text from the document."
                />
                <PrivacyRow
                  title="Editable result"
                  text="The structured CV is saved to your account and opens in the normal builder."
                />
              </div>
            </div>

            <div className="rounded-md border border-[#cfe2e0] bg-[#e7f4f2] p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
                <p className="text-xs leading-5 text-[#365c61]">
                  Always check imported dates, headings, and bullet placement
                  before downloading.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PrivacyRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-[#e1e8eb] pt-4 first:border-0 first:pt-0">
      <p className="text-xs font-bold text-[#28485b]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#718590]">{text}</p>
    </div>
  );
}

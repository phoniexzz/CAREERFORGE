import { AlertTriangle } from "lucide-react";

import { useResumeRender } from "@/lib/use-resume-render";
import { PdfResumePreview } from "./PdfResumePreview";
import { TemplatePicker } from "./TemplatePicker";

export function LivePreview() {
  const { render, pdf, pdfUrl, error, loading } = useResumeRender();
  const importantWarning = render?.warnings.find(
    (warning) => warning.severity !== "info",
  );

  return (
    <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-[#d3dde2] bg-white/80 px-5">
        <div>
          <p className="text-xs font-bold text-[#28485b]">Compiled document</p>
          <p className="text-[11px] text-[#718590]">
            Exact PDF preview, refreshed after edits
          </p>
        </div>
        {render && (
          <div className="flex items-center gap-2">
            <span className="section-chip">
              {render.pageCount} {render.pageCount === 1 ? "page" : "pages"}
            </span>
            <span className="section-chip">
              {render.fittingProfile.replace("-", " ")}
            </span>
          </div>
        )}
      </div>

      {importantWarning && (
        <div className="flex shrink-0 gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{importantWarning.message}</span>
        </div>
      )}

      <PdfResumePreview
        pdf={pdf}
        pdfUrl={pdfUrl}
        loading={loading}
        error={error}
        className="min-h-0 flex-1"
      />

      <div className="shrink-0 border-t border-[#d3dde2] bg-white px-5 py-4">
        <TemplatePicker />
      </div>
    </div>
  );
}

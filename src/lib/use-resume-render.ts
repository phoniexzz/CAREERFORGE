import { useEffect, useRef, useState } from "react";

import { getRenderedPdf, renderResume, type ResumeRender } from "./resume-api";
import { useResumeStore } from "./resume-store";

export function useResumeRender(debounceMs = 700) {
  const stage = useResumeStore((state) => state.stage);
  const template = useResumeStore((state) => state.template);
  const layoutPreferences = useResumeStore((state) => state.layoutPreferences);
  const data = useResumeStore((state) => state.data);
  const [render, setRender] = useState<ResumeRender | null>(null);
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sequence = useRef(0);

  useEffect(() => {
    const current = ++sequence.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void (async () => {
        try {
          const nextRender = await renderResume(
            { careerStage: stage, template, layoutPreferences, data },
            controller.signal,
          );
          const nextPdf = await getRenderedPdf(nextRender);
          if (current !== sequence.current) return;
          setRender(nextRender);
          setPdf(nextPdf);
          setPdfUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return URL.createObjectURL(nextPdf);
          });
        } catch (caught) {
          if (controller.signal.aborted || current !== sequence.current) return;
          setError(
            caught instanceof Error
              ? caught.message
              : "The resume preview could not be generated.",
          );
        } finally {
          if (current === sequence.current) setLoading(false);
        }
      })();
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [data, debounceMs, layoutPreferences, stage, template]);

  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    },
    [pdfUrl],
  );

  return { render, pdf, pdfUrl, error, loading };
}

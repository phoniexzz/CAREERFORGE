import { LoaderCircle } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { createResume, getResume, listResumes } from "@/lib/resume-api";
import {
  clearLegacyResume,
  purgeLegacySourceDocuments,
  syncCurrentResume,
} from "@/lib/resume-sync";
import { useResumeStore } from "@/lib/resume-store";
import { emptyResume } from "@/lib/resume-types";
import { useAuth } from "@/lib/auth";

export function ResumeBootstrap({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const hydrated = useResumeStore((state) => state.hydrated);
  const dirty = useResumeStore((state) => state.dirty);
  const hydrateRemote = useResumeStore((state) => state.hydrateRemote);
  const clearWorkspace = useResumeStore((state) => state.clearWorkspace);
  const [loading, setLoading] = useState(user?.role !== "advisor" && !hydrated);
  const mounted = useRef(true);
  const started = useRef(false);

  // If user is advisor, they do not have a student resume to bootstrap
  if (user?.role === "advisor") {
    return <>{children}</>;
  }

  const hydrate = useCallback(
    async (record: Awaited<ReturnType<typeof getResume>>) => {
      hydrateRemote({
        id: record.id,
        name: record.name,
        revision: record.revision,
        stage: record.careerStage,
        template: record.template,
        layoutPreferences: record.layoutPreferences,
        data: record.data,
      });
    },
    [hydrateRemote],
  );

  const createBlank = useCallback(async () => {
    const record = await createResume({
      name: "Base CV",
      careerStage: "graduate",
      template: "graduate-compact",
      data: emptyResume(),
      versionReason: "created",
    });
    await hydrate(record);
  }, [hydrate]);

  useEffect(() => {
    clearLegacyResume();
    void purgeLegacySourceDocuments().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (started.current || hydrated) {
      setLoading(false);
      return;
    }
    started.current = true;
    mounted.current = true;
    void (async () => {
      try {
        const resumes = await listResumes();
        if (resumes.length) {
          await hydrate(await getResume(resumes[0].id));
        } else {
          await createBlank();
        }
      } catch (error) {
        toast.error("Workspace could not be loaded", {
          description:
            error instanceof Error ? error.message : "Try signing in again.",
        });
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();
  }, [createBlank, hydrate, hydrated]);

  useEffect(
    () => () => {
      mounted.current = false;
      clearWorkspace();
    },
    [clearWorkspace],
  );

  useEffect(() => {
    if (!hydrated || !dirty) return;
    const timeout = window.setTimeout(() => {
      void syncCurrentResume().catch((error) => {
        toast.error("Changes are not saved", {
          description:
            error instanceof Error ? error.message : "Reconnect and try again.",
        });
      });
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [dirty, hydrated]);

  if (loading || !hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7f8]">
        <LoaderCircle className="size-5 animate-spin text-brand" />
      </div>
    );
  }

  return children;
}

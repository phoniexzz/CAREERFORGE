import { del, keys } from "idb-keyval";

import { type ResumeRecord, updateResume } from "./resume-api";
import { postCorrectionEvent } from "./api/resume-ai.functions";
import { normalizeResumeData } from "./resume-data";
import { type ResumeEvidence, useResumeStore } from "./resume-store";
import {
  type CareerStage,
  type LayoutPreferences,
  type ResumeData,
  type StepId,
  type TemplateId,
  normalizeTemplateId,
} from "./resume-types";

const LEGACY_KEY = "careerforge:resume";
const LEGACY_SOURCE_PREFIXES = [
  "careerforge:document:",
  "careerforge:resume-source:",
] as const;

interface LegacyState {
  state?: {
    stage?: CareerStage;
    template?: string;
    layoutPreferences?: LayoutPreferences;
    step?: StepId;
    data?: ResumeData;
  };
}

export function readLegacyResume() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LegacyState;
    const data = normalizeResumeData(parsed.state?.data);
    if (!hasMeaningfulResume(data)) return null;
    return {
      stage: parsed.state?.stage || ("graduate" as const),
      template: normalizeTemplateId(parsed.state?.template),
      layoutPreferences: parsed.state?.layoutPreferences,
      step: parsed.state?.step || ("contact" as const),
      data,
    };
  } catch {
    return null;
  }
}

export function clearLegacyResume() {
  window.localStorage.removeItem(LEGACY_KEY);
}

export function hasMeaningfulResume(data: ResumeData) {
  return Boolean(
    Object.values(data.contact).some(Boolean) ||
    data.summary ||
    data.experiences.length ||
    data.education.length ||
    data.skillGroups.length ||
    data.projects.length ||
    data.achievements.length ||
    data.certifications.length,
  );
}

let activeSync: Promise<ResumeRecord | null> | null = null;

export async function purgeLegacySourceDocuments() {
  const storedKeys = await keys();
  await Promise.all(
    storedKeys
      .filter(
        (key): key is string =>
          typeof key === "string" &&
          LEGACY_SOURCE_PREFIXES.some((prefix) => key.startsWith(prefix)),
      )
      .map((key) => del(key)),
  );
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as LegacyState;
    if (
      parsed.state?.data &&
      typeof parsed.state.data === "object" &&
      "sourceDocument" in parsed.state.data
    ) {
      delete (parsed.state.data as ResumeData & { sourceDocument?: unknown })
        .sourceDocument;
      window.localStorage.setItem(LEGACY_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Invalid legacy state is handled by readLegacyResume.
  }
}

async function performSync() {
  const state = useResumeStore.getState();
  if (!state.resumeId || !state.hydrated) return null;
  const fingerprint = JSON.stringify({
    name: state.resumeName,
    stage: state.stage,
    template: state.template,
    layoutPreferences: state.layoutPreferences,
    data: state.data,
  });
  state.markSyncing();
  try {
    const record = await updateResume(state.resumeId, {
      name: state.resumeName,
      careerStage: state.stage,
      template: state.template,
      layoutPreferences: state.layoutPreferences,
      revision: state.revision,
      data: state.data,
    });

    // Check for corrections
    const initialEvidence = state.evidence || [];
    const remainingEvidence: ResumeEvidence[] = [];
    for (const item of initialEvidence) {
      const frontendVal = getFrontendValueByPath(state.data, item.path);
      if (frontendVal && normalize(frontendVal) !== normalize(item.value)) {
        void postCorrectionEvent({
          resumeId: state.resumeId,
          data: {
            fieldPath: item.path,
            originalValue: item.value,
            correctedValue: frontendVal,
            sourceText: item.sourceSnippets?.[0]?.text || null,
          },
        }).catch((err) => {
          console.error("Failed to report correction event:", err);
        });
      } else {
        remainingEvidence.push(item);
      }
    }
    useResumeStore.setState({ evidence: remainingEvidence });

    const current = useResumeStore.getState();
    const currentFingerprint = JSON.stringify({
      name: current.resumeName,
      stage: current.stage,
      template: current.template,
      layoutPreferences: current.layoutPreferences,
      data: current.data,
    });
    current.markSynced(record.revision, currentFingerprint !== fingerprint);
    return record;
  } catch (error) {
    state.markSyncError();
    throw error;
  }
}

export async function syncCurrentResume(): Promise<ResumeRecord | null> {
  if (activeSync) {
    await activeSync;
    if (!useResumeStore.getState().dirty) return null;
  }
  activeSync = performSync();
  try {
    return await activeSync;
  } finally {
    activeSync = null;
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getFrontendValueByPath(data: ResumeData, path: string): string {
  const parts = path.split(".");
  let current: unknown = data;
  for (const part of parts) {
    if (current === undefined || current === null) return "";
    let key = part;
    if (part === "full_name") key = "fullName";
    else if (part === "job_title") key = "jobTitle";
    else if (part === "start_date") key = "startDate";
    else if (part === "end_date") key = "endDate";
    else if (part === "skill_groups") key = "skillGroups";
    else if (part === "credential_url") key = "credentialUrl";

    const index = Number.parseInt(key, 10);
    if (Array.isArray(current) && !Number.isNaN(index)) {
      current = current[index];
      continue;
    }
    if (typeof current !== "object" || Array.isArray(current)) return "";
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === "string") return current;
  if (typeof current === "boolean") return current ? "true" : "false";
  if (Array.isArray(current)) return current.join(", ");
  return "";
}

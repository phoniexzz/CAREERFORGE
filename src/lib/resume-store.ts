import { create } from "zustand";
import {
  type CareerStage,
  type LayoutPreferences,
  type ResumeData,
  type StepId,
  type TemplateId,
  emptyResume,
  defaultLayoutPreferences,
  normalizeLayoutPreferences,
  normalizeTemplateId,
} from "./resume-types";
import { normalizeResumeData } from "./resume-data";

export interface ResumeEvidence {
  path: string;
  value: string;
  sourceSnippets?: Array<{ text: string }>;
}

interface ResumeState {
  resumeId: string | null;
  resumeName: string;
  revision: number;
  hydrated: boolean;
  dirty: boolean;
  syncState: "idle" | "saving" | "saved" | "error";
  stage: CareerStage;
  template: TemplateId;
  layoutPreferences: LayoutPreferences;
  step: StepId;
  data: ResumeData;
  evidence: ResumeEvidence[];
  lastSavedAt: number | null;
  setStage: (s: CareerStage) => void;
  setTemplate: (t: TemplateId) => void;
  setLayoutPreferences: (value: LayoutPreferences) => void;
  setStep: (s: StepId) => void;
  setData: (updater: (d: ResumeData) => ResumeData) => void;
  loadData: (d: ResumeData) => void;
  hydrateRemote: (input: {
    id: string;
    name: string;
    revision: number;
    stage: CareerStage;
    template: TemplateId;
    layoutPreferences: LayoutPreferences;
    data: ResumeData;
    evidence?: ResumeEvidence[];
  }) => void;
  markSyncing: () => void;
  markSynced: (revision: number, keepDirty?: boolean) => void;
  markSyncError: () => void;
  clearWorkspace: () => void;
  reset: () => void;
  markSaved: () => void;
}

const initialState = {
  resumeId: null,
  resumeName: "Base CV",
  revision: 0,
  hydrated: false,
  dirty: false,
  syncState: "idle" as const,
  stage: "graduate" as CareerStage,
  template: "graduate-compact" as TemplateId,
  layoutPreferences: defaultLayoutPreferences(),
  step: "contact" as StepId,
  data: emptyResume(),
  evidence: [],
  lastSavedAt: null,
};

export const useResumeStore = create<ResumeState>()((set) => ({
  ...initialState,
  setStage: (stage) => set({ stage, dirty: true }),
  setTemplate: (template) => set({ template, dirty: true }),
  setLayoutPreferences: (layoutPreferences) =>
    set({
      layoutPreferences: normalizeLayoutPreferences(layoutPreferences),
      dirty: true,
    }),
  setStep: (step) => set({ step }),
  setData: (updater) =>
    set((state) => ({ data: updater(state.data), dirty: true })),
  loadData: (data) => set({ data: normalizeResumeData(data), dirty: true }),
  hydrateRemote: ({
    id,
    name,
    revision,
    stage,
    template,
    layoutPreferences,
    data,
    evidence,
  }) =>
    set({
      resumeId: id,
      resumeName: name,
      revision,
      stage,
      template: normalizeTemplateId(template),
      layoutPreferences: normalizeLayoutPreferences(layoutPreferences),
      data: normalizeResumeData(data),
      evidence: evidence || [],
      step: "contact",
      hydrated: true,
      dirty: false,
      syncState: "saved",
      lastSavedAt: Date.now(),
    }),
  markSyncing: () => set({ syncState: "saving" }),
  markSynced: (revision, keepDirty = false) =>
    set({
      revision,
      dirty: keepDirty,
      syncState: keepDirty ? "idle" : "saved",
      lastSavedAt: Date.now(),
    }),
  markSyncError: () => set({ syncState: "error" }),
  clearWorkspace: () => set({ ...initialState }),
  reset: () => set({ data: emptyResume(), step: "contact", dirty: true }),
  markSaved: () => set({ lastSavedAt: Date.now() }),
}));

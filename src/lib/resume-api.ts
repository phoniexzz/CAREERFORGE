import { apiBlobRequest, apiRequest } from "./api-client";
import {
  type ResumeData,
  type CareerStage,
  type LayoutPreferences,
  type SectionKey,
  type TemplateId,
  defaultLayoutPreferences,
} from "./resume-types";

export interface ResumeRecord {
  id: string;
  name: string;
  careerStage: CareerStage;
  template: TemplateId;
  layoutPreferences: LayoutPreferences;
  revision: number;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeListItem {
  id: string;
  name: string;
  careerStage: CareerStage;
  template: TemplateId;
  layoutPreferences?: LayoutPreferences;
  revision: number;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  revision: number;
  reason: string;
  createdAt: string;
}

export type FittingProfile = "relaxed" | "standard" | "compact" | "compact-max";

export interface RenderWarning {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface ReductionSuggestion {
  section: SectionKey;
  itemId?: string;
  title: string;
  message: string;
}

export interface ResumeRender {
  renderId: string;
  pdfUrl: string;
  pageCount: number;
  fittingProfile: FittingProfile;
  pageOccupancy: number[];
  warnings: RenderWarning[];
  suggestions: ReductionSuggestion[];
}

export function listResumes() {
  return apiRequest<ResumeListItem[]>("/resumes");
}

export function getResume(id: string) {
  return apiRequest<ResumeRecord>(`/resumes/${id}`);
}

export function createResume(input: {
  name?: string;
  careerStage: CareerStage;
  template: TemplateId;
  layoutPreferences?: LayoutPreferences;
  data: ResumeData;
  versionReason?: string;
}) {
  return apiRequest<ResumeRecord>("/resumes", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      layoutPreferences: input.layoutPreferences ?? defaultLayoutPreferences(),
    }),
  });
}

export function migrateResume(input: {
  name?: string;
  careerStage: CareerStage;
  template: TemplateId;
  layoutPreferences?: LayoutPreferences;
  data: ResumeData;
}) {
  return apiRequest<ResumeRecord>("/resumes/migrate", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      layoutPreferences: input.layoutPreferences ?? defaultLayoutPreferences(),
    }),
  });
}

export function updateResume(
  id: string,
  input: {
    name: string;
    careerStage: CareerStage;
    template: TemplateId;
    layoutPreferences: LayoutPreferences;
    revision: number;
    data: ResumeData;
  },
) {
  return apiRequest<ResumeRecord>(`/resumes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function updateResumeSection(
  id: string,
  section: SectionKey | "contact",
  revision: number,
  value: unknown,
) {
  return apiRequest<ResumeRecord>(`/resumes/${id}/sections/${section}`, {
    method: "PATCH",
    body: JSON.stringify({ revision, value }),
  });
}

export function renderResume(
  input: {
    careerStage: CareerStage;
    template: TemplateId;
    layoutPreferences: LayoutPreferences;
    data: ResumeData;
  },
  signal?: AbortSignal,
) {
  return apiRequest<ResumeRender>("/resumes/render", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}

export function getRenderedPdf(render: ResumeRender) {
  return apiBlobRequest(render.pdfUrl);
}

export function exportResumeDocx(input: {
  careerStage: CareerStage;
  template: TemplateId;
  layoutPreferences: LayoutPreferences;
  data: ResumeData;
  fileName: string;
  fittingProfile: FittingProfile;
}) {
  return apiBlobRequest("/resumes/export/docx", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createResumeVersion(id: string, reason = "manual") {
  return apiRequest<ResumeVersion>(`/resumes/${id}/versions`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function listResumeVersions(id: string) {
  return apiRequest<ResumeVersion[]>(`/resumes/${id}/versions`);
}

export function restoreResumeVersion(
  resumeId: string,
  versionId: string,
  revision: number,
) {
  return apiRequest<ResumeRecord>(
    `/resumes/${resumeId}/versions/${versionId}/restore`,
    {
      method: "POST",
      body: JSON.stringify({ revision }),
    },
  );
}

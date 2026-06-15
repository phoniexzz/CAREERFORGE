import { apiRequest } from "../api-client";
import { type AISuggestion, type AuditResult } from "../mock-ai";
import { type ResumeData } from "../resume-types";

export type ParserSection =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements";

export interface FieldEvidence {
  path: string;
  value: string;
  spanIds: string[];
  confidence: number;
  extractionMethod: "pdf-native" | "docx-structure" | "ocr";
  provider: "deterministic" | "groq" | "ollama";
  sourceSnippets: { spanId: string; page: number; text: string }[];
}

export interface ParserIssue {
  code: string;
  severity: "info" | "warning" | "critical";
  section: ParserSection | "document";
  message: string;
  path?: string;
}

export interface UnresolvedBlock {
  spanIds: string[];
  page: number;
  text: string;
  reason: string;
}

export interface ParseResumeResult {
  sections: ResumeData;
  evidence: FieldEvidence[];
  sectionConfidence: Record<ParserSection, number>;
  issues: ParserIssue[];
  unresolvedBlocks: UnresolvedBlock[];
  counts: {
    experiences: number;
    education: number;
    skills: number;
    projects: number;
    achievements: number;
    certifications: number;
  };
  providers: {
    section: ParserSection;
    provider: "groq" | "ollama" | "deterministic";
    model: string;
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    status: "success" | "degraded" | "failed";
    errorCategory?: string;
  }[];
  diagnostics: {
    format: "pdf" | "docx";
    pageCount: number;
    pageCountEstimated: boolean;
    nativeTextPages: number;
    ocrPages: number[];
    extractedTextLength: number;
    spanCount: number;
    unclassifiedBlockCount: number;
  };
}

export function parseResumeUpload({
  file,
}: {
  file: File;
}): Promise<ParseResumeResult> {
  return apiRequest<ParseResumeResult>("/parser/cv", {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-File-Name": encodeURIComponent(file.name),
    },
    body: file,
  });
}

export function rewriteExperience({
  data,
}: {
  data: { text: string; context?: string };
}): Promise<AISuggestion> {
  return apiRequest<AISuggestion>("/ai/rewrite-experience", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function generateResumeSummary({
  data,
}: {
  data: { resume: ResumeData };
}): Promise<AISuggestion> {
  return apiRequest<AISuggestion>("/ai/generate-summary", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function reviewResume({
  data,
}: {
  data: { resume: ResumeData };
}): Promise<AuditResult> {
  return apiRequest<AuditResult>("/ai/review-resume", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function postCorrectionEvent({
  resumeId,
  data,
}: {
  resumeId: string;
  data: {
    fieldPath: string;
    originalValue?: string | null;
    correctedValue: string;
    sourceText?: string | null;
  };
}): Promise<void> {
  return apiRequest<void>(`/resumes/${resumeId}/corrections`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

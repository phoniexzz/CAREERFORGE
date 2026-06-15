import { create } from "zustand";

import type { ResumeData } from "@/lib/resume-types";
import { buildCoverLetter, buildSuggestions } from "./base-cv";
import type {
  CoverLetterSection,
  CoverLetterSectionId,
  SuggestionStatus,
  TailoringSuggestion,
  SelectedJob,
  MatchItem,
} from "./mock-data";
import {
  selectedJob as fallbackJob,
  matchAnalysis as fallbackMatch,
  readinessReview as fallbackReadiness,
} from "./mock-data";
import { apiRequest } from "../api-client";

type EvidenceGap = {
  id: string;
  title: string;
  detail: string;
};

type ScoreItem = {
  id: string;
  label: string;
  score: number;
  comment: string;
};

type WarningItem = {
  id: string;
  label: string;
};

type ApplicationStrategy = {
  submissionAdvice: string[];
  followUpTemplates: { trigger: string; subject: string; body: string }[];
  interviewTalkingPoints: string[];
};

type RawSuggestion = {
  id: string;
  section: string;
  experienceId?: string;
  experience_id?: string;
  original: string;
  suggested: string;
  rationale: string;
  evidenceRef?: string;
  evidence_ref?: string;
  unsupported?: boolean;
  status?: SuggestionStatus;
};

type RawCoverLetterSection = {
  id: CoverLetterSectionId;
  label: string;
  content: string;
};

type RawScore = {
  id: string;
  label: string;
  score: number;
  comment?: string;
};

type RawWarning = {
  id: string;
  label: string;
};

type RawMatchItem = {
  label: string;
  evidence?: string;
  note?: string;
};

type RawEvidenceGap = {
  id: string;
  title: string;
  detail: string;
};

type RawFollowUpTemplate = {
  trigger: string;
  subject: string;
  body: string;
};

type RawStrategy = {
  submissionAdvice?: string[];
  submission_advice?: string[];
  followUpTemplates?: RawFollowUpTemplate[];
  follow_up_templates?: RawFollowUpTemplate[];
  interviewTalkingPoints?: string[];
  interview_talking_points?: string[];
};

type RawMatchSnapshot = {
  matchScore?: number;
  match_score?: number;
  scores?: RawScore[];
  strongMatches?: RawMatchItem[];
  strong_matches?: RawMatchItem[];
  partialMatches?: RawMatchItem[];
  partial_matches?: RawMatchItem[];
  missingSkills?: RawMatchItem[];
  missing_skills?: RawMatchItem[];
  evidenceGaps?: RawEvidenceGap[];
  evidence_gaps?: RawEvidenceGap[];
};

type TailoringDraftResponse = {
  suggestions?: RawSuggestion[];
  coverLetter?: RawCoverLetterSection[];
  cover_letter?: RawCoverLetterSection[];
  scores?: RawScore[];
  unsupportedClaims?: RawWarning[];
  unsupported_claims?: RawWarning[];
  missingRequirements?: RawWarning[];
  missing_requirements?: RawWarning[];
  nextActions?: string[];
  next_actions?: string[];
  strategy?: RawStrategy | null;
  matchScore?: number;
  match_score?: number;
  matchCategory?: string;
  match_category?: string;
  recommendedAction?: string;
  recommended_action?: string;
  assessmentCoverage?: number;
  assessment_coverage?: number;
  strongMatches?: RawMatchItem[];
  strong_matches?: RawMatchItem[];
  partialMatches?: RawMatchItem[];
  partial_matches?: RawMatchItem[];
  missingSkills?: RawMatchItem[];
  missing_skills?: RawMatchItem[];
  evidenceGaps?: RawEvidenceGap[];
  evidence_gaps?: RawEvidenceGap[];
};

type TailoringProjectResponse = {
  id: string;
  jobTitle: string;
  company: string;
  coverLetter?: RawCoverLetterSection[];
  strategy?: RawStrategy | null;
  jobMatchSnapshot?: RawMatchSnapshot;
  job_match_snapshot?: RawMatchSnapshot;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

type TailoringState = {
  sessionKey: string | null;
  suggestions: TailoringSuggestion[];
  coverLetter: CoverLetterSection[];
  jobDescription: string;
  jobTitle: string;
  company: string;
  location: string;
  matchId: string | null;

  // Backend Integration State
  loading: boolean;
  error: string | null;
  projectId: string | null;
  matchScore: number;
  matchCategory: string;
  recommendedAction: string;
  assessmentCoverage: number;
  scores: ScoreItem[];
  unsupportedClaims: WarningItem[];
  missingRequirements: WarningItem[];
  nextActions: string[];
  strategy: ApplicationStrategy | null;
  strongMatches: MatchItem[];
  partialMatches: MatchItem[];
  missingSkills: MatchItem[];
  evidenceGaps: EvidenceGap[];
  draftGenerated: boolean;

  initialize: (sessionKey: string, data: ResumeData) => void;
  setJobDescription: (value: string) => void;
  setSuggestionStatus: (
    id: string,
    status: SuggestionStatus,
    edited?: string,
  ) => void;
  resetSuggestion: (id: string) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  updateCoverLetterSection: (id: CoverLetterSectionId, content: string) => void;

  // New actions
  generateDraft: (
    resumeId: string,
    jobTitle: string,
    company: string,
    jobDesc: string,
  ) => Promise<void>;
  saveApprovedProject: (
    resumeId: string,
    resumeRevision: number,
    selectedTemplate: string,
    cvData: ResumeData,
  ) => Promise<string>;
  loadProject: (projectId: string) => Promise<void>;
};

export const useTailoringStore = create<TailoringState>((set, get) => ({
  sessionKey: null,
  suggestions: [],
  coverLetter: [],
  jobDescription: fallbackJob.description,
  jobTitle: fallbackJob.title,
  company: fallbackJob.company,
  location: fallbackJob.location,
  matchId: null,
  draftGenerated: false,

  // Backend state default
  loading: false,
  error: null,
  projectId: null,
  matchScore: fallbackJob.matchScore,
  matchCategory: "Needs Review",
  recommendedAction: "Needs review",
  assessmentCoverage: 0,
  scores: fallbackReadiness.scores,
  unsupportedClaims: fallbackReadiness.unsupportedClaims,
  missingRequirements: fallbackReadiness.missingRequirements,
  nextActions: fallbackReadiness.nextActions,
  strategy: {
    submissionAdvice: [
      "Apply through JPMorganChase direct university or careers portal.",
      "Ensure DOCX file format is selected for ATS compatibility.",
    ],
    followUpTemplates: [
      {
        trigger: "After 1 week",
        subject: `Application Follow-up - ${fallbackJob.title}`,
        body: `Dear Hiring Manager,\n\nI am following up on my application for the ${fallbackJob.title} position...`,
      },
    ],
    interviewTalkingPoints: [
      "Be ready to walk through your relevant university projects.",
      "Highlight your technical capabilities in SQL and Microsoft Excel.",
    ],
  },
  strongMatches: fallbackMatch.strongMatches,
  partialMatches: fallbackMatch.partialMatches,
  missingSkills: fallbackMatch.missingSkills,
  evidenceGaps: fallbackMatch.evidenceGaps,

  initialize: (sessionKey, data) => {
    if (get().sessionKey === sessionKey) return;
    set({
      sessionKey,
      suggestions: buildSuggestions(data),
      coverLetter: buildCoverLetter(data),
      draftGenerated: false,
    });
  },

  setJobDescription: (jobDescription) => set({ jobDescription }),

  setSuggestionStatus: (id, status, edited) =>
    set((state) => ({
      suggestions: state.suggestions.map((suggestion) =>
        suggestion.id === id
          ? {
              ...suggestion,
              status,
              suggested: edited ?? suggestion.suggested,
            }
          : suggestion,
      ),
    })),

  resetSuggestion: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((suggestion) =>
        suggestion.id === id
          ? { ...suggestion, status: "pending" as const }
          : suggestion,
      ),
    })),

  acceptAll: () =>
    set((state) => ({
      suggestions: state.suggestions.map((suggestion) =>
        suggestion.unsupported
          ? suggestion
          : { ...suggestion, status: "accepted" as const },
      ),
    })),

  rejectAll: () =>
    set((state) => ({
      suggestions: state.suggestions.map((suggestion) => ({
        ...suggestion,
        status: "rejected" as const,
      })),
    })),

  updateCoverLetterSection: (id, content) =>
    set((state) => ({
      coverLetter: state.coverLetter.map((section) =>
        section.id === id ? { ...section, content } : section,
      ),
    })),

  generateDraft: async (resumeId, jobTitle, company, jobDescription) => {
    set({ loading: true, error: null });
    try {
      const result = await apiRequest<TailoringDraftResponse>(
        "/tailoring/generate",
        {
          method: "POST",
          body: JSON.stringify({
            resume_id: resumeId,
            job_match_id: get().matchId,
            job_title: jobTitle,
            company: company,
            job_description: jobDescription,
          }),
        },
      );

      // Match properties from API snake_case response fields (which might be converted to camelCase by client/server config)
      const suggestions = result.suggestions || [];
      const coverLetter = result.coverLetter || result.cover_letter || [];
      const scores = result.scores || [];
      const unsupportedClaims =
        result.unsupportedClaims || result.unsupported_claims || [];
      const missingRequirements =
        result.missingRequirements || result.missing_requirements || [];
      const nextActions = result.nextActions || result.next_actions || [];
      const strategy = result.strategy || null;
      const matchScore = result.matchScore ?? result.match_score ?? 75;
      const matchCategory =
        result.matchCategory ?? result.match_category ?? "Needs Review";
      const recommendedAction =
        result.recommendedAction ?? result.recommended_action ?? "Needs review";
      const assessmentCoverage =
        result.assessmentCoverage ?? result.assessment_coverage ?? 0;
      const strongMatches = result.strongMatches || result.strong_matches || [];
      const partialMatches =
        result.partialMatches || result.partial_matches || [];
      const missingSkills = result.missingSkills || result.missing_skills || [];
      const evidenceGaps = result.evidenceGaps || result.evidence_gaps || [];

      set({
        jobTitle,
        company,
        jobDescription,
        matchScore,
        matchCategory,
        recommendedAction,
        assessmentCoverage,
        suggestions: suggestions.map((s) => ({
          id: s.id,
          section: s.section,
          experienceId: s.experienceId ?? s.experience_id,
          original: s.original,
          suggested: s.suggested,
          rationale: s.rationale,
          evidenceRef: s.evidenceRef ?? s.evidence_ref ?? "",
          unsupported: s.unsupported ?? false,
          status: s.status || "pending",
        })),
        coverLetter: coverLetter.map((cl) => ({
          id: cl.id,
          label: cl.label,
          content: cl.content,
        })),
        scores: scores.map((s) => ({
          id: s.id,
          label: s.label,
          score: s.score,
          comment: s.comment || "",
        })),
        unsupportedClaims: unsupportedClaims.map((u) => ({
          id: u.id,
          label: u.label,
        })),
        missingRequirements: missingRequirements.map((m) => ({
          id: m.id,
          label: m.label,
        })),
        nextActions,
        strategy: strategy
          ? {
              submissionAdvice:
                strategy.submissionAdvice ?? strategy.submission_advice ?? [],
              followUpTemplates: (
                strategy.followUpTemplates ??
                strategy.follow_up_templates ??
                []
              ).map((t) => ({
                trigger: t.trigger,
                subject: t.subject,
                body: t.body,
              })),
              interviewTalkingPoints:
                strategy.interviewTalkingPoints ??
                strategy.interview_talking_points ??
                [],
            }
          : null,
        strongMatches: strongMatches.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        partialMatches: partialMatches.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        missingSkills: missingSkills.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        evidenceGaps: evidenceGaps.map((g) => ({
          id: g.id,
          title: g.title,
          detail: g.detail,
        })),
        draftGenerated: true,
        projectId: null,
      });
    } catch (err: unknown) {
      console.error("Failed to generate tailoring draft:", err);
      set({
        error: errorMessage(err, "Failed to generate tailored application."),
      });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  saveApprovedProject: async (
    resumeId,
    resumeRevision,
    selectedTemplate,
    cvData,
  ) => {
    set({ loading: true, error: null });
    const state = get();
    try {
      const payload = {
        resume_id: resumeId,
        job_match_id: state.matchId,
        resume_revision: resumeRevision,
        selected_template: selectedTemplate,
        job_title: state.jobTitle,
        company: state.company,
        job_match_snapshot: {
          job_title: state.jobTitle,
          company: state.company,
          description: state.jobDescription,
          match_score: state.matchScore,
          strong_matches: state.strongMatches.map((m) => ({
            label: m.label,
            evidence: m.note,
            status: "matched",
          })),
          partial_matches: state.partialMatches.map((m) => ({
            label: m.label,
            evidence: m.note,
            status: "partial",
          })),
          missing_skills: state.missingSkills.map((m) => ({
            label: m.label,
            evidence: m.note,
            status: "gap",
          })),
          evidence_gaps: state.evidenceGaps,
        },
        cv_data: cvData,
        cover_letter: state.coverLetter,
        strategy: state.strategy,
      };

      const result = await apiRequest<{ id: string }>("/tailoring/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      set({ projectId: result.id });
      return result.id;
    } catch (err: unknown) {
      set({ error: errorMessage(err, "Failed to save project.") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  loadProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const result = await apiRequest<TailoringProjectResponse>(
        `/tailoring/projects/${projectId}`,
      );
      const strategy = result.strategy || null;
      const snapshot =
        result.jobMatchSnapshot ?? result.job_match_snapshot ?? {};
      const strongMatches =
        snapshot.strongMatches ?? snapshot.strong_matches ?? [];
      const partialMatches =
        snapshot.partialMatches ?? snapshot.partial_matches ?? [];
      const missingSkills =
        snapshot.missingSkills ?? snapshot.missing_skills ?? [];
      const evidenceGaps =
        snapshot.evidenceGaps ?? snapshot.evidence_gaps ?? [];

      set({
        projectId: result.id,
        jobTitle: result.jobTitle,
        company: result.company,
        matchScore:
          result.jobMatchSnapshot?.matchScore ??
          result.jobMatchSnapshot?.match_score ??
          80,
        suggestions: [],
        coverLetter: result.coverLetter || [],
        scores: (snapshot.scores ?? []).map((score) => ({
          ...score,
          comment: score.comment ?? "",
        })),
        strategy: strategy
          ? {
              submissionAdvice:
                strategy.submissionAdvice ?? strategy.submission_advice ?? [],
              followUpTemplates: (
                strategy.followUpTemplates ??
                strategy.follow_up_templates ??
                []
              ).map((t) => ({
                trigger: t.trigger,
                subject: t.subject,
                body: t.body,
              })),
              interviewTalkingPoints:
                strategy.interviewTalkingPoints ??
                strategy.interview_talking_points ??
                [],
            }
          : null,
        strongMatches: strongMatches.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        partialMatches: partialMatches.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        missingSkills: missingSkills.map((m) => ({
          label: m.label,
          note: m.evidence ?? m.note,
        })),
        evidenceGaps: evidenceGaps.map((g) => ({
          id: g.id,
          title: g.title,
          detail: g.detail,
        })),
        draftGenerated: true,
      });
    } catch (err: unknown) {
      set({ error: errorMessage(err, "Failed to load project.") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));

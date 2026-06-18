import { apiRequest } from "./api-client";
import type { StepId } from "./resume-types";
import type { ResumeData } from "./resume-types";

export type AdvisorReviewStatus =
  | "pending"
  | "in_review"
  | "completed"
  | "withdrawn";

export type AdvisorReviewPriority = "low" | "medium" | "high";

export interface AdvisorReviewComment {
  id: string;
  section: StepId;
  priority: AdvisorReviewPriority;
  comment: string;
}

export interface AdvisorReview {
  id: string;
  resumeId: string;
  resumeVersionId: string;
  status: AdvisorReviewStatus;
  studentMessage: string;
  studentName?: string;
  resumeName?: string;
  advisorName?: string | null;
  overallSummary: string;
  comments: AdvisorReviewComment[];
  draftRevision?: number;
  draftSavedAt?: string | null;
  submittedAt: string;
  claimedAt?: string | null;
  completedAt?: string | null;
  withdrawnAt?: string | null;
}

export interface AdvisorReviewQueueItem {
  id: string;
  resumeId: string;
  resumeName: string;
  studentName: string;
  status: AdvisorReviewStatus;
  assignedAdvisorName?: string | null;
  hasStudentMessage: boolean;
  submittedAt: string;
  claimedAt?: string | null;
}

export interface AdvisorReviewQueuePage {
  items: AdvisorReviewQueueItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AdvisorReviewSummary {
  available: number;
  mine: number;
  completed: number;
}

export interface AdvisorReviewDetail extends AdvisorReview {
  snapshot: {
    id: string;
    name: string;
    template: string;
    data: ResumeData;
  };
  draftRevision: number;
  draftSavedAt?: string | null;
}

export interface AdvisorDraftInput {
  draftRevision: number;
  overallSummary: string;
  comments: Array<{
    section: StepId;
    priority: AdvisorReviewPriority;
    comment: string;
  }>;
}

export function getLatestAdvisorReview(resumeId: string) {
  return apiRequest<AdvisorReview | null>(
    `/advisor-reviews/resumes/${resumeId}/latest`,
  );
}

export function createAdvisorReview(resumeId: string, message: string) {
  return apiRequest<AdvisorReview>(`/advisor-reviews/resumes/${resumeId}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function withdrawAdvisorReview(reviewId: string) {
  return apiRequest<AdvisorReview>(`/advisor-reviews/${reviewId}/withdraw`, {
    method: "POST",
  });
}

export function getAdvisorQueueSummary() {
  return apiRequest<AdvisorReviewSummary>("/advisor-reviews/summary");
}

export function getAdvisorQueue(
  view: "available" | "mine" | "completed",
  page = 1,
) {
  const params = new URLSearchParams({
    view,
    page: String(page),
    pageSize: "20",
  });
  return apiRequest<AdvisorReviewQueuePage>(
    `/advisor-reviews/queue?${params.toString()}`,
  );
}

export function claimAdvisorReview(reviewId: string) {
  return apiRequest<AdvisorReviewDetail>(`/advisor-reviews/${reviewId}/claim`, {
    method: "POST",
  });
}

export function getAdvisorReviewDetail(reviewId: string) {
  return apiRequest<AdvisorReviewDetail>(`/advisor-reviews/${reviewId}`);
}

export function saveAdvisorReviewDraft(
  reviewId: string,
  draft: AdvisorDraftInput,
) {
  return apiRequest<AdvisorReviewDetail>(`/advisor-reviews/${reviewId}/draft`, {
    method: "PUT",
    body: JSON.stringify(draft),
  });
}

export function releaseAdvisorReview(reviewId: string) {
  return apiRequest<AdvisorReview>(`/advisor-reviews/${reviewId}/release`, {
    method: "POST",
  });
}

export function submitAdvisorReview(reviewId: string, draftRevision: number) {
  return apiRequest<AdvisorReviewDetail>(
    `/advisor-reviews/${reviewId}/feedback`,
    {
      method: "POST",
      body: JSON.stringify({ draftRevision }),
    },
  );
}

import { apiRequest } from "./api-client";
import type { StepId } from "./resume-types";

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
  advisorName?: string | null;
  overallSummary: string;
  comments: AdvisorReviewComment[];
  submittedAt: string;
  claimedAt?: string | null;
  completedAt?: string | null;
  withdrawnAt?: string | null;
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

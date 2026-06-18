import { apiBlobRequest, apiRequest } from "./api-client";

export interface AnalyticsGap {
  skill: string;
  students: number;
}

export interface AdvisorAnalyticsOverview {
  generatedAt: string;
  weeks: number;
  minimumGroupSize: number;
  summary: {
    activeStudents: number;
    baseCvs: number;
    tailoredCvs: number;
    trackedApplications: number;
    completedReviews: number;
    reviewQueue: number;
    averageMatchScore: number | null;
    mostCommonGap: AnalyticsGap | null;
  };
  funnel: Array<{
    key: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  matchScoreDistribution: Array<{
    range: string;
    count: number | null;
    suppressed: boolean;
  }>;
  careerStages: Array<{
    stage: string;
    students: number;
    matched: number;
    tailored: number;
    applied: number;
  }>;
  skillGaps: AnalyticsGap[];
  targetRoles: Array<{
    role: string;
    students: number;
  }>;
  engagement: Array<{
    weekStart: string;
    label: string;
    activeStudents: number | null;
    suppressed: boolean;
  }>;
}

export function getAdvisorAnalytics(weeks = 12, signal?: AbortSignal) {
  return apiRequest<AdvisorAnalyticsOverview>(
    `/advisor-analytics/overview?weeks=${weeks}`,
    { signal },
  );
}

export function exportAdvisorAnalytics(weeks = 12) {
  return apiBlobRequest(`/advisor-analytics/export.csv?weeks=${weeks}`);
}

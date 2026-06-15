import { apiRequest } from "./api-client";

export type MatchCategory =
  | "Strong Match"
  | "Good Match"
  | "Stretch Match"
  | "Weak Match"
  | "Low Match"
  | "Needs Review"
  | "Not Eligible";

export interface RequirementFlag {
  type: string;
  status: "met" | "missing" | "unknown";
  message: string;
  requirementText: string;
}

export interface MatchRun {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  totalJobs: number;
  processedJobs: number;
  reusedMatches: number;
  failedJobs: number;
  errorMessage: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface JobMatch {
  matchId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  workMode: string;
  contractType: string;
  salary: string;
  postedAt?: string;
  applicationDeadline?: string;
  source: string;
  sourceUrl: string;
  matchScore: number;
  matchCategory: MatchCategory;
  recommendedAction: string;
  assessmentCoverage: number;
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  matchedTools: string[];
  missingTools: string[];
  educationFit: string;
  experienceFit: string;
  locationFit: string;
  seniorityFit: string;
  hardRequirementFlags: RequirementFlag[];
}

export interface JobMatchDetail extends JobMatch {
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  softSkills: string[];
  responsibilities: string[];
  educationRequirements: string[];
  experienceRequirements: Array<{
    minimumYears?: number;
    mandatory?: boolean;
    text?: string;
  }>;
  industryKeywords: string[];
  seniorityLevel: string;
  dimensionScores: Record<string, number | null>;
}

export interface MatchList {
  items: JobMatch[];
  total: number;
  page: number;
  pageSize: number;
  stale: boolean;
  latestRun?: MatchRun;
}

export interface MatchPreferences {
  revision: number;
  preferredLocations: string[];
  workModes: Array<"remote" | "hybrid" | "on-site">;
  targetRoles: string[];
  industries: string[];
  drivingLicence: "yes" | "no" | "unknown";
  workEligibility: "yes" | "no" | "unknown";
  updatedAt?: string;
}

export function listJobMatches(
  resumeId: string,
  input: {
    page?: number;
    pageSize?: number;
    category?: string;
    location?: string;
    title?: string;
    hardRequirement?: string;
    sort?: "score" | "posted" | "deadline";
  } = {},
) {
  const params = new URLSearchParams();
  params.set("page", String(input.page ?? 1));
  params.set("page_size", String(input.pageSize ?? 100));
  if (input.category) params.set("category", input.category);
  if (input.location) params.set("location", input.location);
  if (input.title) params.set("title", input.title);
  if (input.hardRequirement) {
    params.set("hard_requirement", input.hardRequirement);
  }
  params.set("sort", input.sort ?? "score");
  return apiRequest<MatchList>(
    `/resumes/${resumeId}/matches?${params.toString()}`,
  );
}

export function getJobMatch(resumeId: string, jobId: string) {
  return apiRequest<JobMatchDetail>(`/resumes/${resumeId}/matches/${jobId}`);
}

export function recalculateJobMatches(resumeId: string) {
  return apiRequest<MatchRun>(`/resumes/${resumeId}/matches/recalculate`, {
    method: "POST",
  });
}

export function getMatchRun(resumeId: string, runId: string) {
  return apiRequest<MatchRun>(`/resumes/${resumeId}/match-runs/${runId}`);
}

export function getMatchPreferences(resumeId: string) {
  return apiRequest<MatchPreferences>(`/resumes/${resumeId}/match-preferences`);
}

export function updateMatchPreferences(
  resumeId: string,
  preferences: MatchPreferences,
) {
  return apiRequest<MatchPreferences>(
    `/resumes/${resumeId}/match-preferences`,
    {
      method: "PATCH",
      body: JSON.stringify(preferences),
    },
  );
}

import { exampleResume } from "./mock-cv";
import { type ResumeRecord } from "./resume-api";
import { type JobMatch, type JobMatchDetail, type MatchList, type MatchPreferences } from "./matchmaker-api";
import { type AdvisorReview } from "./advisor-review-api";
import { defaultLayoutPreferences } from "./resume-types";

// Toggle for Demo Mode
export const DEMO_MODE = true;

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

// Latency simulator
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to check and retrieve local state
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// Global Demo States
const getDemoUser = () => getStorageItem<any>("careerforge_demo_user", null);
const setDemoUser = (user: any) => setStorageItem("careerforge_demo_user", user);

const getDemoResume = () => {
  const defaultResume: ResumeRecord = {
    id: "res_001",
    name: "Base CV",
    careerStage: "graduate",
    template: "graduate-compact",
    layoutPreferences: defaultLayoutPreferences(),
    revision: 1,
    data: exampleResume(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return getStorageItem<ResumeRecord>("careerforge_demo_resume", defaultResume);
};

const saveDemoResume = (resume: ResumeRecord) => {
  resume.updatedAt = new Date().toISOString();
  resume.revision += 1;
  setStorageItem("careerforge_demo_resume", resume);
};

// Static Mock Jobs definition
const MOCK_JOBS_SOURCE: Omit<JobMatchDetail, "matchScore" | "matchCategory" | "matchedRequiredSkills" | "missingRequiredSkills" | "matchedPreferredSkills" | "missingPreferredSkills">[] = [
  {
    matchId: "m_001",
    jobId: "job_001",
    jobTitle: "Graduate Business Analyst",
    company: "BrightPath Consulting",
    location: "London, UK",
    workMode: "Hybrid",
    contractType: "Permanent",
    salary: "£32,000 - £38,000",
    postedAt: "2 days ago",
    applicationDeadline: "July 15, 2026",
    source: "University Careers",
    sourceUrl: "https://careers.southampton.ac.uk",
    recommendedAction: "Strongly Recommended",
    assessmentCoverage: 85,
    educationFit: "Excellent",
    experienceFit: "Good",
    locationFit: "Yes",
    seniorityFit: "Yes",
    hardRequirementFlags: [
      { type: "Right to work", status: "met", message: "Eligible for UK graduate visa", requirementText: "Right to work in UK" }
    ],
    description: "BrightPath is looking for an analytical graduate to support our operational consulting teams. You will work on client dashboards, process mapping, and stakeholders business reviews.",
    requiredSkills: ["SQL", "Excel", "Power BI", "Stakeholder Communication"],
    preferredSkills: ["Python", "Agile", "Jira"],
    tools: ["Power BI", "Excel", "SQL"],
    softSkills: ["Problem Solving", "Communication"],
    responsibilities: [
      "Gather business requirements from clients",
      "Model datasets to track operational KPIs",
      "Create client-facing dashboards in Power BI"
    ],
    educationRequirements: ["Bachelor's in STEM, Finance, or Business related field"],
    experienceRequirements: [{ text: "Internship experience in analytical role is preferred", mandatory: false }],
    industryKeywords: ["Consulting", "Analytics", "Operations"],
    seniorityLevel: "Graduate / Entry Level",
    dimensionScores: { "Skills Match": 90, "Education": 95, "Experience": 75 },
    matchedTools: [],
    missingTools: []
  },
  {
    matchId: "m_002",
    jobId: "job_002",
    jobTitle: "Market Risk Reporting Analyst",
    company: "JPMorganChase",
    location: "Bournemouth, UK",
    workMode: "Hybrid",
    contractType: "Permanent",
    salary: "£42,000 - £48,000",
    postedAt: "1 day ago",
    applicationDeadline: "July 20, 2026",
    source: "J.P. Morgan Careers",
    sourceUrl: "https://careers.jpmorgan.com",
    recommendedAction: "Review and Tailor",
    assessmentCoverage: 90,
    educationFit: "Excellent",
    experienceFit: "Excellent",
    locationFit: "Yes",
    seniorityFit: "Yes",
    hardRequirementFlags: [
      { type: "Degree", status: "met", message: "Meets quantitative degree requirement", requirementText: "Quantitative degree" }
    ],
    description: "Produce periodic Market Risk reports and firmwide/legal entity risk summaries. Automate reporting processes using Tableau, Python, and Alteryx.",
    requiredSkills: ["Microsoft Excel", "Financial analytics", "Reporting", "Data quality", "Information Systems"],
    preferredSkills: ["Tableau", "Alteryx", "Python", "Risk management"],
    tools: ["Excel", "Tableau", "Python", "Alteryx"],
    softSkills: ["Attention to Detail", "Collaboration"],
    responsibilities: [
      "Produce daily and weekly market risk reports",
      "Validate reporting data quality and control gaps",
      "Participate in automating reporting pipelines"
    ],
    educationRequirements: ["Quantitative degree (Finance, Maths, Economics, Business Analytics)"],
    experienceRequirements: [{ text: "Familiarity with financial reporting / analytics", mandatory: true }],
    industryKeywords: ["Risk stripes", "Banking", "Reporting"],
    seniorityLevel: "Analyst",
    dimensionScores: { "Skills Match": 80, "Education": 100, "Experience": 85 },
    matchedTools: [],
    missingTools: []
  },
  {
    matchId: "m_003",
    jobId: "job_003",
    jobTitle: "Graduate Data Scientist",
    company: "GreenTech Insights",
    location: "Bristol, UK",
    workMode: "Remote",
    contractType: "Permanent",
    salary: "£35,000 - £40,000",
    postedAt: "5 days ago",
    applicationDeadline: "June 30, 2026",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com",
    recommendedAction: "Apply Directly",
    assessmentCoverage: 80,
    educationFit: "Excellent",
    experienceFit: "Moderate",
    locationFit: "Yes",
    seniorityFit: "Yes",
    hardRequirementFlags: [],
    description: "Join our green energy analytics startup. You will build ML models in Python (Pandas, Scikit-learn) and run database queries in PostgreSQL to analyze solar grids.",
    requiredSkills: ["Python", "SQL", "Pandas", "Machine Learning", "Data Analysis"],
    preferredSkills: ["Git", "Docker", "PyTorch"],
    tools: ["Python", "SQL", "Pandas", "Git"],
    softSkills: ["Creativity", "Technical Rigor"],
    responsibilities: [
      "Build predictive models for renewable grid output",
      "Query large time-series databases",
      "Document experimental results"
    ],
    educationRequirements: ["BSc/MSc in Computer Science, Data Science, or related field"],
    experienceRequirements: [{ text: "Python and data manipulation skills", mandatory: true }],
    industryKeywords: ["Green Energy", "Machine Learning", "Data Science"],
    seniorityLevel: "Graduate",
    dimensionScores: { "Skills Match": 85, "Education": 90, "Experience": 60 },
    matchedTools: [],
    missingTools: []
  },
  {
    matchId: "m_004",
    jobId: "job_004",
    jobTitle: "Technology Consultant",
    company: "PwC",
    location: "London, UK",
    workMode: "On-Site",
    contractType: "Permanent",
    salary: "Competitive",
    postedAt: "3 days ago",
    applicationDeadline: "July 10, 2026",
    source: "PwC Student Portal",
    sourceUrl: "https://pwc.com",
    recommendedAction: "Prepare Application",
    assessmentCoverage: 70,
    educationFit: "Good",
    experienceFit: "Good",
    locationFit: "Yes",
    seniorityFit: "Yes",
    hardRequirementFlags: [],
    description: "Advise enterprise clients on systems integration, digital transformation, and business intelligence reporting. High focus on problem solving and presentation skills.",
    requiredSkills: ["Excel", "PowerPoint", "Problem Solving", "Communication", "Data Analysis"],
    preferredSkills: ["SQL", "Tableau"],
    tools: ["Excel", "PowerPoint"],
    softSkills: ["Client Management", "Public Speaking"],
    responsibilities: [
      "Conduct current-state systems analysis",
      "Prepare consulting decks in PowerPoint",
      "Translate business needs into system blueprints"
    ],
    educationRequirements: ["Any undergraduate degree"],
    experienceRequirements: [],
    industryKeywords: ["Consulting", "Enterprise IT", "Strategy"],
    seniorityLevel: "Graduate Associate",
    dimensionScores: { "Skills Match": 75, "Education": 85, "Experience": 70 },
    matchedTools: [],
    missingTools: []
  }
];

// Matching algorithm based on CV skill overlaps
function calculateMatches(resume: ResumeRecord): JobMatchDetail[] {
  const resumeSkills = resume.data.skillGroups
    .flatMap((sg) => sg.skills.map((s) => s.toLowerCase().trim()));

  return MOCK_JOBS_SOURCE.map((job) => {
    // Check overlaps
    const matchedRequired = job.requiredSkills.filter((skill) =>
      resumeSkills.some((rs) => rs.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(rs))
    );
    const missingRequired = job.requiredSkills.filter((skill) =>
      !resumeSkills.some((rs) => rs.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(rs))
    );

    const matchedPreferred = job.preferredSkills.filter((skill) =>
      resumeSkills.some((rs) => rs.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(rs))
    );
    const missingPreferred = job.preferredSkills.filter((skill) =>
      !resumeSkills.some((rs) => rs.includes(skill.toLowerCase().trim()) || skill.toLowerCase().trim().includes(rs))
    );

    // Compute deterministic score
    const totalReq = job.requiredSkills.length || 1;
    const scoreFraction = matchedRequired.length / totalReq;
    let matchScore = Math.round(scoreFraction * 100);
    
    // Add bonus for preferred skills
    if (job.preferredSkills.length > 0) {
      const prefFraction = matchedPreferred.length / job.preferredSkills.length;
      matchScore += Math.round(prefFraction * 15);
    }
    matchScore = Math.min(Math.max(matchScore, 45), 98); // Bound score realistically

    let matchCategory: JobMatch["matchCategory"] = "Low Match";
    if (matchScore >= 80) matchCategory = "Strong Match";
    else if (matchScore >= 65) matchCategory = "Good Match";
    else if (matchScore >= 50) matchCategory = "Stretch Match";

    return {
      ...job,
      matchScore,
      matchCategory,
      matchedRequiredSkills: matchedRequired,
      missingRequiredSkills: missingRequired,
      matchedPreferredSkills: matchedPreferred,
      missingPreferredSkills: missingPreferred,
      matchedTools: matchedRequired.filter((s) => ["sql", "excel", "power bi", "tableau", "python", "alteryx"].includes(s.toLowerCase())),
      missingTools: missingRequired.filter((s) => ["sql", "excel", "power bi", "tableau", "python", "alteryx"].includes(s.toLowerCase())),
    } as JobMatchDetail;
  });
}

// Initial Advisor Queue Data
const DEFAULT_REVIEWS: any[] = [
  {
    id: "rev_001",
    resumeId: "res_001",
    resumeVersionId: "v_001",
    status: "pending",
    studentName: "Alex Morgan",
    resumeName: "Base CV",
    studentMessage: "Hi advisor, looking for feedback on my J.P. Morgan Risk Analyst application. Thanks!",
    advisorName: null,
    overallSummary: "",
    comments: [
      { id: "c_1", section: "summary", priority: "medium", comment: "Try adding a bit more metrics in your summary statement." }
    ],
    submittedAt: "2026-06-14T09:00:00Z"
  },
  {
    id: "rev_002",
    resumeId: "res_001", // Match res_001 in demo
    resumeVersionId: "v_002",
    status: "pending",
    studentName: "Praveen Binoy",
    resumeName: "Base CV",
    studentMessage: "I need feedback for PwC technology consulting CV. I'm worried my skills section is a bit weak.",
    advisorName: null,
    overallSummary: "",
    comments: [],
    submittedAt: "2026-06-15T10:30:00Z"
  }
];

const getDemoReviews = () => getStorageItem<AdvisorReview[]>("careerforge_demo_reviews", DEFAULT_REVIEWS);
const saveDemoReviews = (reviews: AdvisorReview[]) => setStorageItem("careerforge_demo_reviews", reviews);

const DEFAULT_ADVISORS = [
  {
    id: "u-advisor",
    email: "sarah.jenkins@southampton.ac.uk",
    fullName: "Dr. Sarah Jenkins",
    isActive: true,
    isVerified: true,
    canManageAdvisors: true,
    invitationPending: false,
    createdAt: "2026-06-01T08:00:00Z"
  },
  {
    id: "adv_002",
    email: "john.davis@southampton.ac.uk",
    fullName: "John Davis",
    isActive: true,
    isVerified: true,
    canManageAdvisors: false,
    invitationPending: false,
    createdAt: "2026-06-05T09:30:00Z"
  },
  {
    id: "adv_003",
    email: "emma.wilson@southampton.ac.uk",
    fullName: "Emma Wilson",
    isActive: false,
    isVerified: false,
    canManageAdvisors: false,
    invitationPending: true,
    createdAt: "2026-06-10T14:15:00Z"
  }
];

const getDemoAdvisors = () => getStorageItem<any[]>("careerforge_demo_advisors", DEFAULT_ADVISORS);
const saveDemoAdvisors = (advisors: any[]) => setStorageItem("careerforge_demo_advisors", advisors);

const getDemoPreferences = () => {
  const defaultPrefs: MatchPreferences = {
    revision: 1,
    preferredLocations: ["London", "Southampton", "Bournemouth"],
    workModes: ["hybrid", "remote"],
    targetRoles: ["Data Analyst", "Risk Analyst", "Business Analyst", "Data Scientist"],
    industries: ["Finance", "Technology", "Consulting"],
    drivingLicence: "unknown",
    workEligibility: "yes",
    updatedAt: new Date().toISOString(),
  };
  return getStorageItem<MatchPreferences>("careerforge_demo_preferences", defaultPrefs);
};

const saveDemoPreferences = (prefs: MatchPreferences) => {
  prefs.revision += 1;
  prefs.updatedAt = new Date().toISOString();
  setStorageItem("careerforge_demo_preferences", prefs);
};

const DEFAULT_VERSIONS = [
  {
    id: "v_001",
    revision: 1,
    reason: "created",
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  }
];

const getDemoVersions = () => getStorageItem<any[]>("careerforge_demo_versions", DEFAULT_VERSIONS);
const saveDemoVersions = (versions: any[]) => setStorageItem("careerforge_demo_versions", versions);

// --- CLIENT-SIDE INTERCEPT ROUTER ---
async function handleMockRequest(path: string, init: RequestInit): Promise<any> {
  const method = (init.method || "GET").toUpperCase();
  const body = init.body ? JSON.parse(init.body as string) : null;

  // Simulate network delay
  await sleep(400);

  // 1. Auth Handlers
  if (path.startsWith("/auth/me")) {
    const user = getDemoUser();
    if (!user) throw new ApiError("Not authenticated", 401);
    return user;
  }

  if (path.startsWith("/auth/login")) {
    const email = body?.email || "";
    // Rules: Type 'advisor' or log in as student
    const isAdvisor = email.toLowerCase().includes("advisor") || 
                      email.toLowerCase().includes("teacher") || 
                      email.toLowerCase().includes("jenkins") || 
                      email.toLowerCase().includes("staff");

    const isPraveen = email.toLowerCase().includes("praveen") || email.toLowerCase().includes("binoy");

    const user = isAdvisor ? {
      id: "u-advisor",
      email: "sarah.jenkins@southampton.ac.uk",
      fullName: "Dr. Sarah Jenkins",
      role: "advisor",
      isVerified: true,
      isActive: true,
      canManageAdvisors: true,
      createdAt: new Date().toISOString(),
    } : {
      id: "u-student",
      email: isPraveen ? "praveenbinoy70@gmail.com" : "alex.morgan@southampton.ac.uk",
      fullName: isPraveen ? "Praveen Binoy" : "Alex Morgan",
      role: "student",
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setDemoUser(user);
    // Write cookie dummy hint
    if (typeof document !== "undefined") {
      document.cookie = "careerforge_csrf=demo_active; path=/; max-age=86400";
    }
    return user;
  }

  if (path.startsWith("/auth/logout")) {
    setDemoUser(null);
    if (typeof document !== "undefined") {
      document.cookie = "careerforge_csrf=; path=/; max-age=0";
    }
    return null;
  }

  if (path.startsWith("/auth/accept-advisor-invite") && method === "POST") {
    const advisors = getDemoAdvisors();
    const pendingAdv = advisors.find(a => a.invitationPending);
    if (pendingAdv) {
      pendingAdv.isActive = true;
      pendingAdv.isVerified = true;
      pendingAdv.invitationPending = false;
      saveDemoAdvisors(advisors);
    }
    return {
      id: pendingAdv?.id || "adv_demo",
      email: pendingAdv?.email || "new.advisor@southampton.ac.uk",
      fullName: pendingAdv?.fullName || "New Advisor",
      role: "advisor",
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString()
    };
  }

  // 2. Resume Handlers
  if (path === "/resumes") {
    const resume = getDemoResume();
    return [
      {
        id: resume.id,
        name: resume.name,
        careerStage: resume.careerStage,
        template: resume.template,
        revision: resume.revision,
        updatedAt: resume.updatedAt,
      }
    ];
  }

  if (path.match(/^\/resumes\/[a-zA-Z0-9_-]+$/)) {
    const resume = getDemoResume();
    return resume;
  }

  if (path === "/resumes" && method === "POST") {
    const resume = getDemoResume();
    return resume;
  }

  if (path.match(/^\/resumes\/[a-zA-Z0-9_-]+$/) && method === "PUT") {
    const resume = getDemoResume();
    resume.name = body.name || resume.name;
    resume.careerStage = body.careerStage || resume.careerStage;
    resume.template = body.template || resume.template;
    resume.layoutPreferences = body.layoutPreferences || resume.layoutPreferences;
    resume.data = body.data || resume.data;
    saveDemoResume(resume);
    return resume;
  }

  if (path.match(/^\/resumes\/[a-zA-Z0-9_-]+\/sections\/[a-zA-Z0-9_-]+$/) && method === "PATCH") {
    const resume = getDemoResume();
    const sectionMatch = path.match(/\/sections\/([a-zA-Z0-9_-]+)$/);
    if (sectionMatch) {
      const section = sectionMatch[1];
      if (section === "contact") {
        resume.data.contact = body.value;
      } else {
        (resume.data as any)[section] = body.value;
      }
      saveDemoResume(resume);
    }
    return resume;
  }

  if (path === "/resumes/render") {
    const resume = getDemoResume();
    // Recompute warnings or occupancy based on section sizes
    return {
      renderId: "render_" + resume.revision,
      pdfUrl: `/resumes/render-pdf-file?rev=${resume.revision}`,
      pageCount: resume.data.experiences.length > 2 ? 2 : 1,
      fittingProfile: "standard",
      pageOccupancy: [85],
      warnings: [],
      suggestions: []
    };
  }

  if (path.match(/^\/resumes\/[a-zA-Z0-9_-]+\/versions$/)) {
    if (method === "POST") {
      const resume = getDemoResume();
      const versions = getDemoVersions();
      const newVer = {
        id: "v_" + Date.now(),
        revision: resume.revision,
        reason: body?.reason || "manual",
        createdAt: new Date().toISOString()
      };
      versions.unshift(newVer);
      saveDemoVersions(versions);
      return newVer;
    }
    return getDemoVersions();
  }

  if (path.match(/^\/resumes\/[a-zA-Z0-9_-]+\/versions\/[a-zA-Z0-9_-]+\/restore$/)) {
    return getDemoResume();
  }

  if (path === "/resumes/migrate") {
    return getDemoResume();
  }

  // 3. Matchmaker Handlers
  if (path.includes("/matches") && !path.includes("/matches/")) {
    const resume = getDemoResume();
    const list = calculateMatches(resume);
    return {
      items: list,
      total: list.length,
      page: 1,
      pageSize: 10,
      stale: false
    };
  }

  if (path.includes("/matches/recalculate")) {
    return {
      id: "run_recal_" + Date.now(),
      status: "completed",
      totalJobs: MOCK_JOBS_SOURCE.length,
      processedJobs: MOCK_JOBS_SOURCE.length,
      reusedMatches: 0,
      failedJobs: 0,
      errorMessage: "",
      createdAt: new Date().toISOString()
    };
  }

  const matchDetails = path.match(/\/matches\/([a-zA-Z0-9_-]+)$/);
  if (matchDetails) {
    const jobId = matchDetails[1];
    const resume = getDemoResume();
    const list = calculateMatches(resume);
    const job = list.find((j) => j.jobId === jobId) || list[0];
    return job;
  }

  if (path.includes("/match-preferences")) {
    if (method === "PATCH") {
      const prefs = getDemoPreferences();
      Object.assign(prefs, body);
      saveDemoPreferences(prefs);
      return prefs;
    }
    return getDemoPreferences();
  }

  // 4. Advisor Review Handlers
  const latestReviewMatch = path.match(/^\/advisor-reviews\/resumes\/([a-zA-Z0-9_-]+)\/latest$/);
  if (latestReviewMatch) {
    const resId = latestReviewMatch[1];
    const reviews = getDemoReviews();
    const resumeReviews = reviews.filter((r) => r.resumeId === resId);
    if (resumeReviews.length === 0) return null;
    return resumeReviews[resumeReviews.length - 1];
  }

  const createReviewMatch = path.match(/^\/advisor-reviews\/resumes\/([a-zA-Z0-9_-]+)$/);
  if (createReviewMatch && method === "POST") {
    const resId = createReviewMatch[1];
    const reviews = getDemoReviews();
    const resume = getDemoResume();
    const user = getDemoUser();
    const newRev: any = {
      id: "rev_" + Date.now(),
      resumeId: resId,
      resumeVersionId: "v_" + resume.revision,
      status: "pending",
      studentName: user?.fullName || "Alex Morgan",
      studentMessage: body?.message || "Please review my CV.",
      advisorName: null,
      overallSummary: "",
      comments: [],
      submittedAt: new Date().toISOString()
    };
    reviews.push(newRev);
    saveDemoReviews(reviews);
    return newRev;
  }

  const withdrawMatch = path.match(/\/advisor-reviews\/([a-zA-Z0-9_-]+)\/withdraw$/);
  if (withdrawMatch) {
    const id = withdrawMatch[1];
    const reviews = getDemoReviews();
    const item = reviews.find((r) => r.id === id);
    if (item) {
      item.status = "withdrawn";
      item.withdrawnAt = new Date().toISOString();
      saveDemoReviews(reviews);
      return item;
    }
  }

  // Detailed Advisor Review Workspace & Queue Handlers
  if (path === "/advisor-reviews/summary") {
    const reviews = getDemoReviews();
    const user = getDemoUser();
    const advisorName = user?.fullName || "Dr. Sarah Jenkins";
    
    const available = reviews.filter((r) => r.status === "pending").length;
    const mine = reviews.filter((r) => r.status === "in_review" && r.advisorName === advisorName).length;
    const completed = reviews.filter((r) => r.status === "completed").length;
    
    return { available, mine, completed };
  }

  if (path.startsWith("/advisor-reviews/queue")) {
    const url = new URL(path, "http://localhost");
    const view = url.searchParams.get("view") || "available";
    const reviews = getDemoReviews();
    const user = getDemoUser();
    const advisorName = user?.fullName || "Dr. Sarah Jenkins";

    let filtered: any[] = [];
    if (view === "available") {
      filtered = reviews.filter((r) => r.status === "pending");
    } else if (view === "mine") {
      filtered = reviews.filter((r) => r.status === "in_review" && r.advisorName === advisorName);
    } else if (view === "completed") {
      filtered = reviews.filter((r) => r.status === "completed");
    }

    const items = filtered.map((r) => ({
      id: r.id,
      resumeId: r.resumeId,
      resumeName: r.resumeName || "Base CV",
      studentName: r.studentName || "Alex Morgan",
      status: r.status,
      assignedAdvisorName: r.advisorName,
      hasStudentMessage: !!r.studentMessage,
      submittedAt: r.submittedAt,
      claimedAt: r.claimedAt || null
    }));

    return {
      items,
      total: items.length,
      page: 1,
      pageSize: 20,
      hasMore: false
    };
  }

  const claimMatch = path.match(/^\/advisor-reviews\/([a-zA-Z0-9_-]+)\/claim$/);
  if (claimMatch && method === "POST") {
    const revId = claimMatch[1];
    const reviews = getDemoReviews();
    const index = reviews.findIndex((r) => r.id === revId);
    if (index === -1) throw new ApiError("Review not found", 404);
    
    const user = getDemoUser();
    const advisorName = user?.fullName || "Dr. Sarah Jenkins";
    
    reviews[index].status = "in_review";
    reviews[index].advisorName = advisorName;
    reviews[index].claimedAt = new Date().toISOString();
    reviews[index].draftRevision = (reviews[index].draftRevision || 0) + 1;
    saveDemoReviews(reviews);
    
    const resume = getDemoResume();
    return {
      ...reviews[index],
      snapshot: {
        id: reviews[index].resumeId,
        name: reviews[index].resumeName || "Base CV",
        template: resume.template,
        data: resume.data
      },
      draftRevision: reviews[index].draftRevision
    };
  }

  const draftMatch = path.match(/^\/advisor-reviews\/([a-zA-Z0-9_-]+)\/draft$/);
  if (draftMatch && method === "PUT") {
    const revId = draftMatch[1];
    const reviews = getDemoReviews();
    const index = reviews.findIndex((r) => r.id === revId);
    if (index === -1) throw new ApiError("Review not found", 404);
    
    reviews[index].overallSummary = body.overallSummary || "";
    reviews[index].comments = (body.comments || []).map((c: any, i: number) => ({
      id: c.id || "c_" + Date.now() + "_" + i,
      section: c.section,
      priority: c.priority,
      comment: c.comment
    }));
    reviews[index].draftRevision = (body.draftRevision || 0) + 1;
    reviews[index].draftSavedAt = new Date().toISOString();
    saveDemoReviews(reviews);
    
    const resume = getDemoResume();
    return {
      ...reviews[index],
      snapshot: {
        id: reviews[index].resumeId,
        name: reviews[index].resumeName || "Base CV",
        template: resume.template,
        data: resume.data
      },
      draftRevision: reviews[index].draftRevision,
      draftSavedAt: reviews[index].draftSavedAt
    };
  }

  const releaseMatch = path.match(/^\/advisor-reviews\/([a-zA-Z0-9_-]+)\/release$/);
  if (releaseMatch && method === "POST") {
    const revId = releaseMatch[1];
    const reviews = getDemoReviews();
    const index = reviews.findIndex((r) => r.id === revId);
    if (index === -1) throw new ApiError("Review not found", 404);
    
    reviews[index].status = "pending";
    reviews[index].advisorName = null;
    reviews[index].claimedAt = null;
    reviews[index].draftRevision = (reviews[index].draftRevision || 0) + 1;
    saveDemoReviews(reviews);
    return reviews[index];
  }

  const feedbackMatch = path.match(/^\/advisor-reviews\/([a-zA-Z0-9_-]+)\/feedback$/);
  if (feedbackMatch && method === "POST") {
    const revId = feedbackMatch[1];
    const reviews = getDemoReviews();
    const index = reviews.findIndex((r) => r.id === revId);
    if (index === -1) throw new ApiError("Review not found", 404);
    
    reviews[index].status = "completed";
    reviews[index].completedAt = new Date().toISOString();
    reviews[index].draftRevision = (body?.draftRevision || reviews[index].draftRevision || 0) + 1;
    saveDemoReviews(reviews);
    
    const resume = getDemoResume();
    return {
      ...reviews[index],
      snapshot: {
        id: reviews[index].resumeId,
        name: reviews[index].resumeName || "Base CV",
        template: resume.template,
        data: resume.data
      },
      draftRevision: reviews[index].draftRevision
    };
  }

  const detailMatch = path.match(/^\/advisor-reviews\/([a-zA-Z0-9_-]+)$/);
  if (detailMatch && method === "GET") {
    const revId = detailMatch[1];
    const reviews = getDemoReviews();
    const item = reviews.find((r) => r.id === revId);
    if (!item) throw new ApiError("Review not found", 404);
    
    const resume = getDemoResume();
    return {
      ...item,
      snapshot: {
        id: item.resumeId,
        name: item.resumeName || "Base CV",
        template: resume.template,
        data: resume.data
      },
      draftRevision: item.draftRevision || 1
    };
  }
  // Detailed Advisor Analytics Handlers
  if (path.startsWith("/advisor-analytics/overview")) {
    return {
      generatedAt: new Date().toISOString(),
      weeks: 12,
      minimumGroupSize: 5,
      summary: {
        activeStudents: 142,
        baseCvs: 128,
        tailoredCvs: 84,
        trackedApplications: 53,
        completedReviews: 45,
        reviewQueue: 2,
        averageMatchScore: 78,
        mostCommonGap: { skill: "SQL", students: 34 }
      },
      funnel: [
        { key: "registered", label: "Registered Students", count: 180, percentage: 100 },
        { key: "base_cv", label: "Created Base CV", count: 128, percentage: 71 },
        { key: "matches", label: "Viewed Job Matches", count: 95, percentage: 53 },
        { key: "tailored", label: "Tailored Applications", count: 84, percentage: 47 },
        { key: "applied", label: "Submitted Applications", count: 53, percentage: 29 }
      ],
      matchScoreDistribution: [
        { range: "90-100", count: 12, suppressed: false },
        { range: "80-89", count: 28, suppressed: false },
        { range: "70-79", count: 42, suppressed: false },
        { range: "60-69", count: 22, suppressed: false },
        { range: "50-59", count: 15, suppressed: false },
        { range: "0-49", count: 9, suppressed: false }
      ],
      careerStages: [
        { stage: "Graduate / Early Career", students: 85, matched: 72, tailored: 58, applied: 36 },
        { stage: "Undergraduate / Placement Year", students: 43, matched: 35, tailored: 22, applied: 14 },
        { stage: "Postgraduate / PhD", students: 14, matched: 12, tailored: 4, applied: 3 }
      ],
      skillGaps: [
        { skill: "SQL", students: 34 },
        { skill: "Python", students: 28 },
        { skill: "Tableau", students: 19 },
        { skill: "Power BI", students: 15 },
        { skill: "Agile / Scrum", students: 12 }
      ],
      targetRoles: [
        { role: "Business Analyst", students: 45 },
        { role: "Data Analyst", students: 38 },
        { role: "Software Engineer", students: 22 },
        { role: "Risk Analyst", students: 15 },
        { role: "Consultant", students: 12 }
      ],
      engagement: [
        { weekStart: "2026-04-06", label: "06 Apr", activeStudents: 92, suppressed: false },
        { weekStart: "2026-04-13", label: "13 Apr", activeStudents: 88, suppressed: false },
        { weekStart: "2026-04-20", label: "20 Apr", activeStudents: 95, suppressed: false },
        { weekStart: "2026-04-27", label: "27 Apr", activeStudents: 104, suppressed: false },
        { weekStart: "2026-05-04", label: "04 May", activeStudents: 110, suppressed: false },
        { weekStart: "2026-05-11", label: "11 May", activeStudents: 115, suppressed: false },
        { weekStart: "2026-05-18", label: "18 May", activeStudents: 120, suppressed: false },
        { weekStart: "2026-05-25", label: "25 May", activeStudents: 108, suppressed: false },
        { weekStart: "2026-06-01", label: "01 Jun", activeStudents: 132, suppressed: false },
        { weekStart: "2026-06-08", label: "08 Jun", activeStudents: 140, suppressed: false },
        { weekStart: "2026-06-15", label: "15 Jun", activeStudents: 142, suppressed: false }
      ]
    };
  }
  // Detailed Advisor Team Management Handlers
  if (path === "/advisor-admin/advisors" && method === "GET") {
    return getDemoAdvisors();
  }

  if (path === "/advisor-admin/invitations" && method === "POST") {
    const advisors = getDemoAdvisors();
    const newAdv = {
      id: "adv_" + Date.now(),
      email: body.email,
      fullName: body.fullName,
      isActive: false,
      isVerified: false,
      canManageAdvisors: body.canManageAdvisors || false,
      invitationPending: true,
      createdAt: new Date().toISOString()
    };
    advisors.push(newAdv);
    saveDemoAdvisors(advisors);
    return newAdv;
  }

  const resendInviteMatch = path.match(/^\/advisor-admin\/advisors\/([a-zA-Z0-9_-]+)\/resend-invite$/);
  if (resendInviteMatch && method === "POST") {
    const advId = resendInviteMatch[1];
    const advisors = getDemoAdvisors();
    const index = advisors.findIndex((a) => a.id === advId);
    if (index === -1) throw new ApiError("Advisor not found", 404);
    return advisors[index];
  }

  const updateAdvisorMatch = path.match(/^\/advisor-admin\/advisors\/([a-zA-Z0-9_-]+)$/);
  if (updateAdvisorMatch && method === "PATCH") {
    const advId = updateAdvisorMatch[1];
    const advisors = getDemoAdvisors();
    const index = advisors.findIndex((a) => a.id === advId);
    if (index === -1) throw new ApiError("Advisor not found", 404);
    
    if (body.isActive !== undefined) advisors[index].isActive = body.isActive;
    if (body.canManageAdvisors !== undefined) advisors[index].canManageAdvisors = body.canManageAdvisors;
    saveDemoAdvisors(advisors);
    return advisors[index];
  }

  // 5. AI Functions Mocks
  if (path === "/ai/review-resume") {
    const resume = getDemoResume();
    // Generate static audit result
    return {
      overall: 80,
      categories: [
        { name: "Completeness", score: 85 },
        { name: "Parser check", score: 90 },
        { name: "Impact analysis", score: 75 }
      ],
      issues: [
        {
          id: "iss_1",
          category: "Summary",
          severity: "warning",
          message: "The professional summary could be more concise.",
          detail: "Consider narrowing down to 2-3 lines of text focusing on skills and role matches.",
        },
        {
          id: "iss_2",
          category: "Experience",
          severity: "info",
          message: "Action Hampshire bullet points are strong, but could use more numerical impact metrics.",
          detail: "Add percentages or volume indicators where possible.",
        }
      ]
    };
  }

  if (path === "/ai/rewrite-experience") {
    return {
      suggested: "Engineered robust dashboard analytics using Power BI, enhancing data visibility by 25% and facilitating executive reporting for weekly project sign-offs.",
      rationale: "Introduced active verbs ('Engineered', 'facilitating') and added numerical impact (25%)."
    };
  }

  if (path === "/ai/generate-summary") {
    return {
      suggested: "First-class Business Analytics and Management Science graduate with practical experience developing Power BI dashboards, cleaning large scale data in Python, and presenting reporting insights to corporate stakeholders. Seeking Graduate Analyst opportunities.",
      rationale: "Directly matches early-career business and tech analyst expectations."
    };
  }

  throw new ApiError(`Unsupported demo endpoint: ${path}`, 404);
}

// Intercept standard API Request
export function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (DEMO_MODE) {
    return handleMockRequest(path, init);
  }

  // Real fetch fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";
  
  function cookie(name: string) {
    if (typeof document === "undefined") return "";
    const match = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
  }

  async function request<T>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    const method = (init.method || "GET").toUpperCase();
    if (
      !(init.body instanceof FormData) &&
      init.body &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const csrf = cookie("careerforge_csrf");
      if (csrf) headers.set("X-CSRF-Token", csrf);
    }
  
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as any)
      : null;
    if (!response.ok || !payload?.success) {
      throw new ApiError(
        payload?.message || `Request failed with status ${response.status}.`,
        response.status,
        payload?.error,
      );
    }
    return payload.data;
  }

  return request<T>(path, init);
}

// Intercept Blob Request
export function apiBlobRequest(
  path: string,
  init: RequestInit = {},
): Promise<Blob> {
  if (DEMO_MODE) {
    return sleep(400).then(() => {
      if (path.includes("docx")) {
        return new Blob(["Mock DOCX Download - Reconnect backend to compile Word documents"], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        });
      }
      if (path.includes("export.csv") || path.includes(".csv")) {
        return new Blob(["Mock CSV Export - Reconnect backend to export actual CSV reports"], {
          type: "text/csv"
        });
      }
      // Return a basic PDF text document as blob
      return new Blob(["Mock PDF Preview - Styled HTML display is active in main view."], {
        type: "application/pdf"
      });
    });
  }

  // Real fetch fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

  async function blobRequest(
    path: string,
    init: RequestInit,
  ): Promise<Blob> {
    const headers = new Headers(init.headers);
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
    if (!response.ok) {
      throw new ApiError(`Request failed with status ${response.status}.`, response.status);
    }
    return response.blob();
  }

  return blobRequest(path, init);
}

export type SelectedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  description: string;
};

export type MatchItem = { label: string; note?: string };

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export type TailoringSuggestion = {
  id: string;
  section: string;
  experienceId?: string;
  original: string;
  suggested: string;
  rationale: string;
  evidenceRef: string;
  unsupported?: boolean;
  status: SuggestionStatus;
};

export type CoverLetterSectionId =
  | "opening"
  | "whyCompany"
  | "whySuitable"
  | "evidence"
  | "closing";

export type CoverLetterSection = {
  id: CoverLetterSectionId;
  label: string;
  content: string;
};

export const selectedJob: SelectedJob = {
  id: "job-jpmorgan-001",
  title: "Market Risk Reporting Analyst",
  company: "JPMorganChase",
  location: "Bournemouth, UK",
  matchScore: 82,
  requiredSkills: [
    "Microsoft Excel",
    "Financial analytics",
    "Reporting",
    "Data quality",
    "Information Systems",
  ],
  preferredSkills: [
    "Tableau",
    "Alteryx",
    "Python",
    "Risk management",
  ],
  responsibilities: [
    "Produce periodic Market Risk reports and metrics",
    "Deliver firmwide and legal entity reporting to meet stakeholder and regulatory requirements",
    "Identify control gaps, strengthen controls, and resolve reporting issues",
    "Participate in strategic projects and tactical initiatives to automate and streamline processes",
    "Collaborate with teams across lines of business to align on requirements, definitions, and deliverables",
  ],
  description: `About the job
Job Description

Join Market Risk Reporting, a global team within Risk Reporting Middle Office that supports JPMorgan Chase's risk management strategy through changing market conditions by delivering critical Firmwide and Wholesale reporting for internal and regulatory needs. You will have opportunities to lead, own processes, and drive improvements, as the team supports a wide range of risk types across all businesses the bank offers.

As an Analyst within the Market Risk Reporting team, you will produce key reports at the Firmwide and Legal Entity levels to meet stakeholder and regulatory requirements and to support assessment and monitoring of the firm's capital requirements. The wider team covers a range of risk stripes, including Value-at-Risk (VaR), Stress, Volcker, SNPR (Single Name Position Risk), and PI (Permitted Instruments).

Job Responsibilities

Produce periodic Market Risk reports and metrics
Deliver firmwide and legal entity reporting to meet stakeholder and regulatory requirements
Identify control gaps, strengthen controls, and resolve reporting issues
Support periodic reviews of reports and processes and maintain relevant documentation
Participate in strategic projects and tactical initiatives to automate and streamline processes
Apply intelligent solutions (such as Tableau, Alteryx, and large language models) to improve reporting outcomes
Support key business decisions and change initiatives through timely, accurate reporting
Collaborate with teams across lines of business to align on requirements, definitions, and deliverables
Communicate clearly with senior stakeholders on reporting deliverables, risks, and process improvements

Required Qualifications, Capabilities And Skills

Bachelor's degree in Business, Accounting, Finance, Information Systems, or a related quantitative discipline
Previous experience in reporting, financial analytics, or a related role
Advanced proficiency in Microsoft Excel and broader Microsoft Office tools
Strong communication and collaboration skills to work effectively across departments
Critical thinking and ability to work independently to drive issues to resolution
Ability to prioritize work and deliver continuous process improvements
High attention to detail with a strong commitment to data quality and controls
Adaptability and learning mindset, including eagerness to learn new technologies

Preferred Qualifications, Capabilities And Skills

Experience with Tableau, Alteryx, and Python
Background in risk management or risk-related functions

About Us

J.P. Morgan is a global leader in financial services, providing strategic advice and products to the world's most prominent corporations, governments, wealthy individuals and institutional investors. Our first-class business in a first-class way approach to serving clients drives everything we do. We strive to build trusted, long-term partnerships to help our clients achieve their business objectives.

We recognize that our people are our strength and the diverse talents they bring to our global workforce are directly linked to our success. We are an equal opportunity employer and place a high value on diversity and inclusion at our company. We do not discriminate on the basis of any protected attribute, including race, religion, color, national origin, gender, sexual orientation, gender identity, gender expression, age, marital or veteran status, pregnancy or disability, or any other basis protected under applicable law. We also make reasonable accommodations for applicants' and employees' religious practices and beliefs, as well as mental health or physical disability needs. Visit our FAQs for more information about requesting an accommodation.

About The Team

Our professionals in our Corporate Functions cover a diverse range of areas from finance and risk to human resources and marketing. Our corporate teams are an essential part of our company, ensuring that we're setting our businesses, clients, customers and employees up for success.

Risk Management helps the firm understand, manage and anticipate risks in a constantly changing environment. The work covers areas such as evaluating country-specific risk, understanding regulatory changes and determining credit worthiness. Risk Management provides independent oversight and maintains an effective control environment.`,
};

export const parsedJob = {
  whatTheyWant: [
    "Produce periodic Market Risk reports and metrics",
    "Deliver firmwide and legal entity reporting",
    "Identify control gaps and strengthen controls",
    "Eagerness to learn new technologies and apply intelligent solutions",
  ],
  niceToHave: [
    "Experience with Tableau, Alteryx, and Python",
    "Background in risk management or risk-related functions",
  ],
  redFlags: [
    "No structured reporting or database experience",
    "Lack of attention to detail or control orientation",
  ],
};

export const matchAnalysis = {
  matchScore: 82,
  keywordsCovered: 7,
  keywordsTotal: 9,
  strongMatches: [
    { label: "Microsoft Excel", note: "Verified in CV skills and coursework." },
    { label: "Financial analytics", note: "Demonstrated in university finance projects." },
    { label: "Reporting", note: "Experience presenting database project reports." },
    { label: "Information Systems", note: "Supported by MSc Business Analytics degree." },
  ] as MatchItem[],
  partialMatches: [
    { label: "Python", note: "Used in academic projects, but not in a business context." },
    { label: "Tableau", note: "Basic exposure, could be highlighted more clearly." },
  ] as MatchItem[],
  missingSkills: [
    { label: "Alteryx", note: "No direct mentions in the base CV." },
    { label: "Risk management", note: "No explicit risk stripe experience found." },
  ] as MatchItem[],
  evidenceGaps: [
    {
      id: "gap-1",
      title: "Risk stripes or risk management exposure",
      detail:
        "Briefly explain any exposure to risk monitoring or risk indicators if supported by your course or projects.",
    },
    {
      id: "gap-2",
      title: "Data quality and reconciliation controls",
      detail:
        "Ensure your CV highlights experience auditing, checking, or verifying data integrity.",
    },
  ],
};

export const readinessReview = {
  status: "almost-ready" as const,
  headline: "Application Alignment High",
  summary:
    "Your profile matches the core requirements of this JPMorganChase risk reporting role. Review the 2 evidence gaps below before exporting.",
  scores: [
    {
      id: "keyword",
      label: "Keyword coverage",
      score: 82,
      comment: "Strong alignment with required technical and finance terms.",
    },
    {
      id: "evidence",
      label: "Evidence strength",
      score: 75,
      comment: "Strong reporting base; risk stripes context could be strengthened.",
    },
    {
      id: "cv",
      label: "CV relevance",
      score: 80,
      comment: "Targeted well towards analytical middle office roles.",
    },
    {
      id: "letter",
      label: "Cover letter",
      score: 85,
      comment: "Well-structured narrative connecting your analytics degree to J.P. Morgan.",
    },
    {
      id: "format",
      label: "Formatting",
      score: 95,
      comment: "Clean, consistent, and easy to scan.",
    },
  ],
  missingRequirements: [
    { id: "m-1", label: "Add database or Alteryx exposure if supported." },
    { id: "m-2", label: "Highlight data verification and quality control experience." },
  ],
  unsupportedClaims: [
    {
      id: "u-1",
      label:
        "No supporting evidence found for Alteryx in your Base CV. Ensure you do not claim direct professional experience with it unless verified.",
    },
  ],
  nextActions: [
    "Review the suggested Experience rewrites.",
    "Personalize the 'Why JPMorganChase' paragraph in your Cover Letter.",
    "Download the strategy guide for Bournemouth interview prep.",
  ],
};

export const exportData = {
  fileBase: "jpmorgan-market-risk-analyst",
  artifacts: [
    { id: "cv-pdf", label: "Tailored CV", format: "PDF", available: true },
    { id: "cv-docx", label: "Tailored CV", format: "DOCX", available: true },
    { id: "cl-pdf", label: "Cover Letter", format: "PDF", available: true },
    { id: "cl-docx", label: "Cover Letter", format: "DOCX", available: true },
    { id: "rr-docx", label: "Strategy Report", format: "DOCX", available: true },
  ],
};

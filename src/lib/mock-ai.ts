import { type ResumeData } from "./resume-types";
import { experienceText, flattenSkills } from "./resume-data";

export interface AISuggestion {
  original: string;
  suggested: string;
  reasons: string[];
  needsMetricDisclaimer: boolean;
}

const ACTION_VERBS = [
  "Led",
  "Built",
  "Designed",
  "Delivered",
  "Collaborated on",
  "Drove",
  "Implemented",
  "Owned",
];

const STARTERS_TO_REPLACE = [
  /^(worked on|worked with|helped|responsible for|in charge of|did|made|created)\b/i,
];

const containsMetric = (text: string) => /\b\d+(\.\d+)?%?\b/.test(text);

export function generateAISuggestion(original: string): AISuggestion {
  const text = original.trim();
  if (!text) {
    return {
      original: "",
      suggested:
        "Add a concise, action-oriented sentence describing one specific contribution and its outcome.",
      reasons: [
        "Empty descriptions make experience harder to assess",
        "Start with a strong action verb",
      ],
      needsMetricDisclaimer: true,
    };
  }

  // Split into sentences and rewrite each first line.
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const rewritten = sentences.map((s, i) => {
    let out = s.trim();
    // Replace weak starters
    for (const re of STARTERS_TO_REPLACE) {
      if (re.test(out)) {
        out = out.replace(re, ACTION_VERBS[i % ACTION_VERBS.length]);
        break;
      }
    }
    // Capitalise
    out = out.charAt(0).toUpperCase() + out.slice(1);
    // Remove first-person
    out = out
      .replace(/\b(I|my|me)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return out;
  });

  const suggested = rewritten.join(" ");
  const hasMetric = containsMetric(text);

  const reasons: string[] = [];
  reasons.push("Starts with an action verb");
  if (
    !/\b(led|built|designed|delivered|drove|implemented|owned|collaborated)\b/i.test(
      text,
    )
  ) {
    reasons.push("Uses clearer, role-relevant wording");
  }
  reasons.push("Removes first-person language");
  reasons.push("Tightens phrasing for readability");

  return {
    original: text,
    suggested,
    reasons,
    needsMetricDisclaimer: !hasMetric,
  };
}

export function generateSummarySuggestion(data: ResumeData): AISuggestion {
  const title = data.contact.title.trim();
  const degree = data.education[0]?.degree.trim();
  const role = data.experiences[0]?.jobTitle.trim();
  const employer = data.experiences[0]?.employer.trim();
  const skills = flattenSkills(data).slice(0, 4);
  const project = data.projects[0]?.name.trim();
  const sentences: string[] = [];

  if (title) {
    sentences.push(
      role && role.toLowerCase() !== title.toLowerCase()
        ? `${title} with experience as ${role}${employer ? ` at ${employer}` : ""}.`
        : `${title}${employer ? ` with experience at ${employer}` : ""}.`,
    );
  } else if (role) {
    sentences.push(
      `${role}${employer ? ` with experience at ${employer}` : ""}.`,
    );
  } else if (degree) {
    sentences.push(`Candidate with an academic background in ${degree}.`);
  }

  if (skills.length) {
    sentences.push(`Brings strengths in ${formatList(skills)}.`);
  }

  if (project && sentences.length < 3) {
    sentences.push(`Relevant project work includes ${project}.`);
  }

  const suggested =
    sentences.join(" ") ||
    "Add your education, experience, skills or professional title to generate a factual personal summary.";

  return {
    original: data.summary.trim(),
    suggested,
    reasons: [
      "Uses only details already present in your profile",
      "Connects your background with role-relevant strengths",
      "Keeps the summary concise and easy to scan",
    ],
    needsMetricDisclaimer: false,
  };
}

function formatList(items: string[]) {
  if (items.length < 2) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export interface AuditIssue {
  id: string;
  severity: "warning" | "info" | "success";
  category:
    | "Contact"
    | "Experience"
    | "Education"
    | "Skills"
    | "Summary"
    | "Achievements"
    | "ATS";
  title: string;
  detail: string;
  fix?: string;
}

export interface AuditResult {
  overall: number;
  categories: { name: string; score: number }[];
  issues: AuditIssue[];
}

export function auditResume(data: ResumeData): AuditResult {
  const issues: AuditIssue[] = [];
  const skills = flattenSkills(data);

  // Contact
  if (!data.contact.email) {
    issues.push({
      id: "c-email",
      severity: "warning",
      category: "Contact",
      title: "Missing email address",
      detail: "Recruiters need a direct way to contact you.",
      fix: "Add a professional email address to your contact details.",
    });
  }
  if (!data.contact.linkedin) {
    issues.push({
      id: "c-linkedin",
      severity: "info",
      category: "Contact",
      title: "Add a LinkedIn URL",
      detail:
        "Including a LinkedIn profile improves recruiter trust and discoverability.",
      fix: "Add your LinkedIn profile URL to the contact section.",
    });
  }
  if (
    data.contact.phone &&
    !/[0-9]{7,}/.test(data.contact.phone.replace(/\D/g, ""))
  ) {
    issues.push({
      id: "c-phone",
      severity: "warning",
      category: "Contact",
      title: "Phone number looks incomplete",
      detail: "Phone numbers should include the full international format.",
    });
  }

  // Experience
  data.experiences.forEach((e, i) => {
    const text = experienceText(e);
    if (!text || text.length < 40) {
      issues.push({
        id: `e-${i}-short`,
        severity: "warning",
        category: "Experience",
        title: `Bullet too short — ${e.jobTitle || "Untitled role"}`,
        detail:
          "Brief descriptions don't show recruiters the impact of your work.",
        fix: "Expand the description with 1–3 concrete contributions.",
      });
    }
    if (text && !/\b\d+(\.\d+)?%?\b/.test(text)) {
      issues.push({
        id: `e-${i}-metric`,
        severity: "info",
        category: "Experience",
        title: `Add measurable outcome — ${e.jobTitle || "Untitled role"}`,
        detail: "Consider adding a measurable outcome if available.",
      });
    }
    if (
      text &&
      /^(worked on|worked with|helped|responsible for|in charge of)/i.test(
        text.trim(),
      )
    ) {
      issues.push({
        id: `e-${i}-verb`,
        severity: "warning",
        category: "Experience",
        title: `Weak opening verb — ${e.jobTitle || "Untitled role"}`,
        detail:
          "Start with a strong action verb like Led, Built, Designed, or Delivered.",
        fix: "Replace the opening with an action verb.",
      });
    }
  });
  if (data.experiences.length === 0) {
    issues.push({
      id: "e-empty",
      severity: "warning",
      category: "Experience",
      title: "No experience added",
      detail: "Add at least one role, internship, or project-based experience.",
    });
  }

  // Education
  if (data.education.length === 0) {
    issues.push({
      id: "ed-empty",
      severity: "warning",
      category: "Education",
      title: "No education entries",
      detail: "Add your most recent qualification.",
    });
  }
  data.education.forEach((ed, i) => {
    if (!ed.endDate) {
      issues.push({
        id: `ed-${i}-date`,
        severity: "info",
        category: "Education",
        title: `Missing graduation date — ${ed.degree || "Untitled"}`,
        detail: "Add an expected or actual graduation date.",
      });
    }
  });

  // Skills
  if (skills.length > 20) {
    issues.push({
      id: "s-many",
      severity: "info",
      category: "Skills",
      title: "Too many skills listed",
      detail: "Recruiters prefer a focused list of 8–15 relevant skills.",
    });
  }
  if (skills.length < 5 && skills.length > 0) {
    issues.push({
      id: "s-few",
      severity: "info",
      category: "Skills",
      title: "Skill list looks thin",
      detail:
        "Add a few more role-relevant skills to make your capability profile clearer.",
    });
  }
  const dupes = skills.filter(
    (s, i) =>
      skills.findIndex((x) => x.toLowerCase() === s.toLowerCase()) !== i,
  );
  if (dupes.length) {
    issues.push({
      id: "s-dupe",
      severity: "info",
      category: "Skills",
      title: "Duplicate skills",
      detail: `Found duplicate skills: ${[...new Set(dupes)].join(", ")}`,
    });
  }

  // Summary
  if (!data.summary || data.summary.length < 60) {
    issues.push({
      id: "sum-short",
      severity: "info",
      category: "Summary",
      title: "Summary is short or missing",
      detail: "A 2–3 sentence summary helps recruiters understand your goals.",
    });
  } else if (data.summary.length > 500) {
    issues.push({
      id: "sum-long",
      severity: "info",
      category: "Summary",
      title: "Summary is too long",
      detail: "Keep your summary under 4 sentences.",
    });
  }

  // Structure
  const totalText = [
    data.summary,
    ...data.experiences.map(experienceText),
    ...data.projects.map((p) => p.description),
    ...data.achievements.map((achievement) =>
      [achievement.title, achievement.description].filter(Boolean).join(" "),
    ),
  ].join(" ");
  if (totalText.length < 200) {
    issues.push({
      id: "ats-thin",
      severity: "warning",
      category: "ATS",
      title: "Resume content is thin",
      detail:
        "Very limited detail makes the resume harder for both recruiters and parsing tools to assess.",
    });
  }

  // Scores
  const baseDeduction = issues.reduce(
    (acc, i) => acc + (i.severity === "warning" ? 8 : 3),
    0,
  );
  const overall = Math.max(40, 100 - baseDeduction);

  const score = (cat: AuditIssue["category"]) => {
    const catIssues = issues.filter((i) => i.category === cat);
    const dec = catIssues.reduce(
      (acc, i) => acc + (i.severity === "warning" ? 12 : 5),
      0,
    );
    return Math.max(40, 100 - dec);
  };

  const categories = [
    { name: "Structure", score: score("ATS") },
    { name: "Content Quality", score: score("Experience") },
    {
      name: "Impact",
      score: Math.max(
        40,
        100 -
          data.experiences.filter(
            (e) => !/\b\d+(\.\d+)?%?\b/.test(experienceText(e)),
          ).length *
            10,
      ),
    },
    { name: "Readability", score: score("Summary") },
    {
      name: "Completeness",
      score: Math.min(
        100,
        20 +
          (data.contact.fullName ? 15 : 0) +
          (data.contact.email ? 10 : 0) +
          (data.experiences.length ? 20 : 0) +
          (data.education.length ? 15 : 0) +
          (skills.length ? 10 : 0) +
          (data.summary ? 10 : 0),
      ),
    },
  ];

  // Add success notes if few issues
  if (issues.filter((i) => i.severity === "warning").length === 0) {
    issues.unshift({
      id: "ok-1",
      severity: "success",
      category: "ATS",
      title: "Clean formatting detected",
      detail: "Your resume's structure is parser-friendly.",
    });
  }

  return { overall, categories, issues };
}

export const EXPERIENCE_TIPS = [
  "Start bullets with strong action verbs (Led, Built, Designed, Delivered).",
  "Focus on achievements and outcomes — not responsibilities.",
  "Include measurable outcomes where you have evidence for them.",
  "Use the STAR method: Situation, Task, Action, Result.",
  "Keep bullets concise — one or two lines each.",
  "Avoid first-person language (no 'I', 'me', 'my').",
  "Use professional wording — avoid slang and filler.",
  "Never invent metrics or achievements you can't support.",
];

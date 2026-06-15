import type { ResumeData } from "@/lib/resume-types";
import type { CoverLetterSection, TailoringSuggestion } from "./mock-data";
import { selectedJob } from "./mock-data";

export type TailoringBaseCv = {
  name: string;
  headline: string;
  summary: string;
  skills: string[];
  experience: {
    id: string;
    title: string;
    organisation: string;
    period: string;
    bullets: string[];
  }[];
};

function period(start: string, end: string, current: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" - ");
}

export function toTailoringBaseCv(data: ResumeData): TailoringBaseCv {
  return {
    name: data.contact.fullName || "Your Base CV",
    headline: data.contact.title || "Career profile",
    summary: data.summary || "No summary has been added to the Base CV yet.",
    skills: data.skillGroups.flatMap((group) => group.skills),
    experience: data.experiences.map((experience) => ({
      id: experience.id,
      title: experience.jobTitle,
      organisation: experience.employer,
      period: period(
        experience.startDate,
        experience.endDate,
        experience.current,
      ),
      bullets: experience.bullets,
    })),
  };
}

export function buildSuggestions(data: ResumeData): TailoringSuggestion[] {
  const firstExperience = data.experiences[0];
  const firstBullet = firstExperience?.bullets[0];
  const skills = data.skillGroups.flatMap((group) => group.skills);
  const matchedSkills = selectedJob.requiredSkills.filter((required) =>
    skills.some((skill) =>
      skill.toLowerCase().includes(required.toLowerCase()),
    ),
  );
  const suggestions: TailoringSuggestion[] = [];

  if (data.summary.trim()) {
    const focus = matchedSkills.slice(0, 3).join(", ");
    suggestions.push({
      id: "summary",
      section: "Summary",
      original: data.summary,
      suggested: focus
        ? `${data.summary} Relevant strengths for this role include ${focus}.`
        : data.summary,
      rationale:
        "Highlights role-relevant skills already present in your saved Base CV.",
      evidenceRef: "Base CV summary and skills",
      status: "pending",
    });
  }

  if (firstExperience && firstBullet) {
    suggestions.push({
      id: "experience-1",
      section: `Experience - ${firstExperience.jobTitle}`,
      experienceId: firstExperience.id,
      original: firstBullet,
      suggested: firstBullet,
      rationale:
        "This evidence is relevant. Edit the wording only where the original evidence supports it.",
      evidenceRef: `${firstExperience.employer} - ${firstExperience.jobTitle}`,
      status: "pending",
    });
  }

  const missing = selectedJob.requiredSkills.find(
    (required) =>
      !skills.some((skill) =>
        skill.toLowerCase().includes(required.toLowerCase()),
      ),
  );
  if (missing) {
    suggestions.push({
      id: "unsupported-1",
      section: "Skills",
      original: skills.join(", ") || "No skills listed",
      suggested: missing,
      rationale:
        "The job asks for this skill, but the saved Base CV does not contain supporting evidence.",
      evidenceRef: "No matching evidence in the Base CV",
      unsupported: true,
      status: "pending",
    });
  }

  return suggestions;
}

export function buildCoverLetter(data: ResumeData): CoverLetterSection[] {
  const name = data.contact.fullName || "Applicant";
  const firstExperience = data.experiences[0];
  const evidence =
    firstExperience?.bullets.slice(0, 2).join(" ") || data.summary;

  return [
    {
      id: "opening",
      label: "Opening",
      content: `Dear Hiring Team,\n\nI am applying for the ${selectedJob.title} role at ${selectedJob.company}.`,
    },
    {
      id: "whyCompany",
      label: `Why ${selectedJob.company}`,
      content:
        "Add a specific and truthful reason this organisation and role interest you.",
    },
    {
      id: "whySuitable",
      label: "Why I'm suitable",
      content:
        data.summary ||
        "Use evidence from your Base CV to explain why you match the role.",
    },
    {
      id: "evidence",
      label: "Evidence",
      content:
        evidence ||
        "Choose one or two relevant examples from your experience or projects.",
    },
    {
      id: "closing",
      label: "Closing",
      content: `Thank you for considering my application.\n\nKind regards,\n${name}`,
    },
  ];
}

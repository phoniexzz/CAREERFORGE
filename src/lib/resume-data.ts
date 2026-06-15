import {
  type Achievement,
  type Certification,
  type Education,
  type Experience,
  type Project,
  type ResumeData,
  type SkillGroup,
} from "./resume-types";

type UnknownRecord = Record<string, unknown>;

export function flattenSkills(
  value: Pick<ResumeData, "skillGroups"> | SkillGroup[],
) {
  const groups = Array.isArray(value) ? value : value.skillGroups;
  return groups.flatMap((group) => group.skills).filter(Boolean);
}

export function experienceText(experience: Pick<Experience, "bullets">) {
  return experience.bullets.filter(Boolean).join(" ");
}

export function normalizeResumeData(value: unknown): ResumeData {
  const source = isRecord(value) ? value : {};
  const contact = isRecord(source.contact) ? source.contact : {};

  return {
    contact: {
      fullName: stringValue(contact.fullName ?? contact.full_name),
      title: stringValue(contact.title),
      email: stringValue(contact.email),
      phone: stringValue(contact.phone),
      location: stringValue(contact.location),
      linkedin: stringValue(contact.linkedin),
      website: stringValue(contact.website),
      github: stringValue(contact.github),
      portfolio: stringValue(contact.portfolio),
      picture: stringValue(
        contact.picture ?? contact.profile_photo ?? contact.profilePhoto,
      ),
    },
    summary: stringValue(source.summary),
    experiences: arrayValue(source.experiences).map(normalizeExperience),
    education: arrayValue(source.education).map(normalizeEducation),
    skillGroups: normalizeSkillGroups(source),
    projects: arrayValue(source.projects).map(normalizeProject),
    achievements: arrayValue(source.achievements).map(normalizeAchievement),
    certifications: arrayValue(source.certifications).map(
      normalizeCertification,
    ),
  };
}

function normalizeExperience(value: unknown, index: number): Experience {
  const item = isRecord(value) ? value : {};
  const bullets = arrayValue(item.bullets)
    .map(stringValue)
    .map((bullet) => bullet.trim())
    .filter(Boolean);
  const legacyDescription = stringValue(item.description).trim();

  return {
    id: stringValue(item.id) || `exp-${index + 1}`,
    jobTitle: stringValue(item.jobTitle ?? item.job_title),
    employer: stringValue(item.employer),
    location: stringValue(item.location),
    startDate: parseDateToMonthInput(
      stringValue(item.startDate ?? item.start_date),
    ),
    endDate: parseDateToMonthInput(stringValue(item.endDate ?? item.end_date)),
    current: Boolean(item.current),
    bullets:
      bullets.length > 0
        ? bullets
        : legacyDescription
          ? [legacyDescription]
          : [],
  };
}

function normalizeEducation(value: unknown, index: number): Education {
  const item = isRecord(value) ? value : {};
  const details = stringValue(item.details);
  const highlights = arrayValue(item.highlights)
    .map(stringValue)
    .map((highlight) => highlight.trim())
    .filter(Boolean);
  return {
    id: stringValue(item.id) || `edu-${index + 1}`,
    degree: stringValue(item.degree),
    institution: stringValue(item.institution),
    location: stringValue(item.location),
    startDate: parseDateToMonthInput(
      stringValue(item.startDate ?? item.start_date),
    ),
    endDate: parseDateToMonthInput(stringValue(item.endDate ?? item.end_date)),
    details,
    highlights:
      highlights.length > 0
        ? highlights
        : details
            .split(/\r?\n/)
            .map((highlight) => highlight.trim())
            .filter(Boolean),
  };
}

function normalizeProject(value: unknown, index: number): Project {
  const item = isRecord(value) ? value : {};
  return {
    id: stringValue(item.id) || `project-${index + 1}`,
    name: stringValue(item.name),
    description: stringValue(item.description),
    bullets: arrayValue(item.bullets)
      .map(stringValue)
      .map((bullet) => bullet.trim())
      .filter(Boolean),
    technologies: stringValue(item.technologies),
    link: stringValue(item.link),
  };
}

function normalizeAchievement(value: unknown, index: number): Achievement {
  const item = isRecord(value) ? value : {};
  return {
    id: stringValue(item.id) || `achievement-${index + 1}`,
    title: stringValue(item.title),
    description: stringValue(item.description),
  };
}

function normalizeSkillGroups(source: UnknownRecord): SkillGroup[] {
  const groups = arrayValue(source.skillGroups ?? source.skill_groups)
    .map((value, index) => {
      const item = isRecord(value) ? value : {};
      return {
        id: stringValue(item.id) || `skills-${index + 1}`,
        name: stringValue(item.name) || "Core skills",
        skills: arrayValue(item.skills)
          .map(stringValue)
          .map((skill) => skill.trim())
          .filter(Boolean),
      };
    })
    .filter((group) => group.name || group.skills.length);

  if (groups.length > 0) return groups;

  const legacySkills = arrayValue(source.skills)
    .map(stringValue)
    .map((skill) => skill.trim())
    .filter(Boolean);
  return legacySkills.length
    ? [{ id: "skills-core", name: "Core skills", skills: legacySkills }]
    : [];
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeCertification(value: unknown, index: number): Certification {
  const item = isRecord(value) ? value : {};
  return {
    id: stringValue(item.id) || `cert-${index + 1}`,
    name: stringValue(item.name),
    issuer: stringValue(item.issuer),
    date: stringValue(item.date),
    credentialUrl: stringValue(item.credentialUrl ?? item.credential_url),
  };
}

function parseDateToMonthInput(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return "";

  // If it starts with YYYY-MM, extract and return it (covers YYYY-MM and YYYY-MM-DD)
  const yyyymmMatch = cleaned.match(/^(\d{4}-\d{2})/);
  if (yyyymmMatch) {
    return yyyymmMatch[1];
  }

  // Try to parse YYYY
  if (/^\d{4}$/.test(cleaned)) {
    return `${cleaned}-01`;
  }

  // Try to parse "Month YYYY" or "Month, YYYY"
  // E.g. "Jan 2024", "January 2024"
  const months: Record<string, string> = {
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12",
  };

  const match = cleaned.match(/^([A-Za-z]+)\s*,?\s*(\d{4})$/);
  if (match) {
    const monthName = match[1].toLowerCase().slice(0, 3);
    const year = match[2];
    const monthNum = months[monthName] || months[match[1].toLowerCase()];
    if (monthNum) {
      return `${year}-${monthNum}`;
    }
  }

  // Try to parse "YYYY Month"
  const matchReverse = cleaned.match(/^(\d{4})\s*,?\s*([A-Za-z]+)$/);
  if (matchReverse) {
    const monthName = matchReverse[2].toLowerCase().slice(0, 3);
    const year = matchReverse[1];
    const monthNum = months[monthName] || months[matchReverse[2].toLowerCase()];
    if (monthNum) {
      return `${year}-${monthNum}`;
    }
  }

  // Fallback: If it contains a 4-digit year, try to match it and extract it
  const yearMatch = cleaned.match(/\b\d{4}\b/);
  if (yearMatch) {
    const year = yearMatch[0];
    for (const [name, num] of Object.entries(months)) {
      if (new RegExp(`\\b${name}\\b`, "i").test(cleaned)) {
        return `${year}-${num}`;
      }
    }
    return `${year}-01`;
  }

  return "";
}

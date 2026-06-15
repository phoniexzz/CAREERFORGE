import { normalizeResumeData } from "./resume-data";
import {
  type Achievement,
  type Certification,
  type Contact,
  type Education,
  type Experience,
  type Project,
  type ResumeData,
  type SkillGroup,
} from "./resume-types";
import { type ParserSection } from "./api/resume-ai.functions";

export type ImportDecision = "imported" | "existing" | "merge";
export type ImportDecisions = Record<ParserSection, ImportDecision | null>;

export const IMPORT_SECTIONS: ParserSection[] = [
  "contact",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
];

export function initialImportDecisions(
  existing: ResumeData,
  imported: ResumeData,
  confidence: Record<ParserSection, number>,
): ImportDecisions {
  return Object.fromEntries(
    IMPORT_SECTIONS.map((section) => {
      if (confidence[section] < 0.7) return [section, null];
      const hasImported = sectionHasContent(imported, section);
      if (!hasImported) return [section, "existing"];
      // Prefer imported — only use existing to fill empty fields via "imported" logic
      return [section, "imported"];
    }),
  ) as ImportDecisions;
}

export function applyImportDecisions(
  existing: ResumeData,
  imported: ResumeData,
  decisions: ImportDecisions,
): ResumeData {
  const result = normalizeResumeData(existing);
  for (const section of IMPORT_SECTIONS) {
    const decision = decisions[section];
    if (!decision || decision === "existing") continue;
    if (decision === "imported") {
      // Replace with imported, but fill any empty imported fields from existing
      assignSectionWithFallback(result, existing, imported, section);
      continue;
    }
    // "merge": explicitly requested blend — still prefer imported, existing fills gaps
    mergeSection(result, imported, section);
  }
  return ensureUniqueIds(normalizeResumeData(result));
}

export function sectionHasContent(data: ResumeData, section: ParserSection) {
  switch (section) {
    case "contact":
      return Object.values(data.contact).some(Boolean);
    case "summary":
      return Boolean(data.summary.trim());
    case "experience":
      return data.experiences.length > 0;
    case "education":
      return data.education.length > 0;
    case "skills":
      return data.skillGroups.some((group) => group.skills.length);
    case "projects":
      return data.projects.length > 0;
    case "achievements":
      return data.achievements.length > 0;
    case "certifications":
      return data.certifications.length > 0;
  }
}

/**
 * Assign imported section to target, falling back to existing values only
 * for fields that are empty in the imported data.
 */
function assignSectionWithFallback(
  target: ResumeData,
  existing: ResumeData,
  imported: ResumeData,
  section: ParserSection,
) {
  switch (section) {
    case "contact":
      target.contact = mergeContact(existing.contact, imported.contact);
      break;
    case "summary":
      target.summary = imported.summary || existing.summary;
      break;
    case "experience":
      target.experiences = imported.experiences.map((item) => ({ ...item }));
      break;
    case "education":
      target.education = imported.education.map((item) => ({ ...item }));
      break;
    case "skills":
      // Use imported skill groups entirely — deduplicated by canonical name
      target.skillGroups = deduplicateSkillGroups(
        imported.skillGroups.map((item) => ({ ...item })),
      );
      break;
    case "projects":
      // Use imported projects, preserve existing links where imported is empty
      target.projects = imported.projects.map((importedProject) => {
        const existingProject = existing.projects.find(
          (p) => normal(p.name) === normal(importedProject.name),
        );
        return {
          ...importedProject,
          link: importedProject.link || existingProject?.link || "",
        };
      });
      break;
    case "achievements":
      target.achievements = imported.achievements.map((item) => ({ ...item }));
      break;
    case "certifications":
      target.certifications = imported.certifications.map((item) => ({
        ...item,
      }));
      break;
  }
}

function assignSection(
  target: ResumeData,
  imported: ResumeData,
  section: ParserSection,
) {
  switch (section) {
    case "contact":
      target.contact = { ...imported.contact };
      break;
    case "summary":
      target.summary = imported.summary;
      break;
    case "experience":
      target.experiences = imported.experiences.map((item) => ({ ...item }));
      break;
    case "education":
      target.education = imported.education.map((item) => ({ ...item }));
      break;
    case "skills":
      target.skillGroups = deduplicateSkillGroups(
        imported.skillGroups.map((item) => ({ ...item })),
      );
      break;
    case "projects":
      target.projects = imported.projects.map((item) => ({ ...item }));
      break;
    case "achievements":
      target.achievements = imported.achievements.map((item) => ({ ...item }));
      break;
    case "certifications":
      target.certifications = imported.certifications.map((item) => ({
        ...item,
      }));
      break;
  }
}

function mergeSection(
  target: ResumeData,
  imported: ResumeData,
  section: ParserSection,
) {
  switch (section) {
    case "contact":
      target.contact = mergeContact(target.contact, imported.contact);
      break;
    case "summary":
      target.summary = imported.summary || target.summary;
      break;
    case "experience":
      target.experiences = mergeItems(
        target.experiences,
        imported.experiences,
        experienceKey,
        mergeExperience,
      );
      break;
    case "education":
      target.education = mergeItems(
        target.education,
        imported.education,
        educationKey,
        mergeEducation,
      );
      break;
    case "skills":
      // Merge by canonical group name, then deduplicate within groups
      target.skillGroups = deduplicateSkillGroups(
        mergeItems(
          target.skillGroups,
          imported.skillGroups,
          (item) => canonicalGroupName(item.name),
          mergeSkillGroup,
        ),
      );
      break;
    case "projects":
      target.projects = mergeItems(
        target.projects,
        imported.projects,
        (item) => normal(item.name),
        mergeProject,
      );
      break;
    case "achievements":
      target.achievements = mergeItems(
        target.achievements,
        imported.achievements,
        (item) => normal(item.title),
        mergeAchievement,
      );
      break;
    case "certifications":
      target.certifications = mergeItems(
        target.certifications,
        imported.certifications,
        (item) => normal(item.name),
        mergeCertification,
      );
      break;
  }
}

function mergeContact(existing: Contact, imported: Contact): Contact {
  return {
    fullName: imported.fullName || existing.fullName,
    title: imported.title || existing.title,
    email: imported.email || existing.email,
    phone: imported.phone || existing.phone,
    location: imported.location || existing.location,
    linkedin: imported.linkedin || existing.linkedin,
    website: imported.website || existing.website,
    github: imported.github || existing.github,
    portfolio: imported.portfolio || existing.portfolio,
    picture: imported.picture || existing.picture,
  };
}

function mergeItems<T>(
  existing: T[],
  imported: T[],
  key: (item: T) => string,
  merge: (existing: T, imported: T) => T,
) {
  const result = existing.map((item) => ({ ...item }));
  for (const importedItem of imported) {
    const importedKey = key(importedItem);
    const matchIndex = result.findIndex(
      (item) => importedKey && key(item) === importedKey,
    );
    if (matchIndex >= 0) {
      result[matchIndex] = merge(result[matchIndex], importedItem);
    } else result.push(importedItem);
  }
  return result;
}

function experienceKey(item: Experience) {
  return [item.jobTitle, item.employer, item.startDate].map(normal).join("|");
}

function educationKey(item: Education) {
  return [item.degree, item.institution, item.startDate].map(normal).join("|");
}

function mergeExperience(
  existing: Experience,
  imported: Experience,
): Experience {
  return {
    ...existing,
    ...filled(existing, imported),
    id: existing.id,
    current: imported.current || existing.current,
    bullets: unique([...imported.bullets, ...existing.bullets]),
  };
}

function mergeEducation(existing: Education, imported: Education): Education {
  return {
    ...existing,
    ...filled(existing, imported),
    id: existing.id,
    highlights: unique([...imported.highlights, ...existing.highlights]),
  };
}

function mergeSkillGroup(
  existing: SkillGroup,
  imported: SkillGroup,
): SkillGroup {
  return {
    ...existing,
    // Use imported name (better formatted), fall back to existing
    name: imported.name || existing.name,
    // Imported skills first, then fill from existing — deduplicated
    skills: unique([...imported.skills, ...existing.skills]),
  };
}

function mergeProject(existing: Project, imported: Project): Project {
  return {
    ...existing,
    ...filled(existing, imported),
    id: existing.id,
    // Keep existing link if imported doesn't provide one
    link: imported.link || existing.link,
    bullets: unique([...imported.bullets, ...existing.bullets]),
  };
}

function mergeAchievement(
  existing: Achievement,
  imported: Achievement,
): Achievement {
  return { ...existing, ...filled(existing, imported), id: existing.id };
}

function mergeCertification(
  existing: Certification,
  imported: Certification,
): Certification {
  return { ...existing, ...filled(existing, imported), id: existing.id };
}

function filled<T extends object>(existing: T, imported: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(imported).filter(([, value]) =>
      Array.isArray(value) ? value.length : Boolean(value),
    ),
  ) as Partial<T>;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normal(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normal(value: string) {
  return value.trim().toLocaleLowerCase();
}

/**
 * Canonical group name: strip all spaces and punctuation for fuzzy matching.
 * "Technical Tools" === "TechnicalTools" === "technical tools"
 */
function canonicalGroupName(name: string) {
  return name
    .toLocaleLowerCase()
    .replace(/[\s\-_&/,()]/g, "")
    .trim();
}

/**
 * Deduplicate skill groups by canonical name, merging skills within duplicates.
 * Keeps the best (longest) display name.
 */
function deduplicateSkillGroups(groups: SkillGroup[]): SkillGroup[] {
  const seen = new Map<string, SkillGroup>();
  for (const group of groups) {
    const key = canonicalGroupName(group.name);
    if (!key) continue;
    const existing = seen.get(key);
    if (existing) {
      // Prefer longer/more readable name, merge skills
      seen.set(key, {
        ...existing,
        name:
          existing.name.length >= group.name.length
            ? existing.name
            : group.name,
        skills: unique([...existing.skills, ...group.skills]),
      });
    } else {
      seen.set(key, { ...group });
    }
  }
  return Array.from(seen.values());
}

/**
 * Validate that a string looks like a real URL (not a line of text).
 * Still used as a guard when displaying project links in the UI.
 */
function isValidUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ensureUniqueIds(data: ResumeData): ResumeData {
  return {
    ...data,
    experiences: uniqueIds(data.experiences, "exp"),
    education: uniqueIds(data.education, "edu"),
    skillGroups: uniqueIds(data.skillGroups, "skills"),
    projects: uniqueIds(data.projects, "project"),
    achievements: uniqueIds(data.achievements, "achievement"),
    certifications: uniqueIds(data.certifications || [], "cert"),
  };
}

function uniqueIds<T extends { id: string }>(items: T[], prefix: string): T[] {
  const used = new Set<string>();
  return items.map((item) => {
    let id = item.id;
    if (!id || used.has(id)) id = `${prefix}-${crypto.randomUUID()}`;
    used.add(id);
    return { ...item, id };
  });
}

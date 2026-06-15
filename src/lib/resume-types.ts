export type CareerStage =
  | "internship"
  | "graduate"
  | "early"
  | "mid"
  | "experienced";

export type TemplateId =
  | "classic-ats"
  | "modern-professional"
  | "graduate-compact"
  | "technical-analyst"
  | "sharp-modern"
  | "academic-photo"
  | "europass";

export type SectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "achievements";

export interface TemplateLayout {
  visible: Record<SectionKey, boolean>;
  regions: Record<string, SectionKey[]>;
}

export type LayoutPreferences = Record<TemplateId, TemplateLayout>;

export interface Contact {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
  portfolio: string;
  picture: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
  highlights: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  bullets: string[];
  technologies: string;
  link: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl: string;
}

export interface ResumeData {
  contact: Contact;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skillGroups: SkillGroup[];
  projects: Project[];
  achievements: Achievement[];
  certifications: Certification[];
}

export const STEPS = [
  { id: "contact", label: "Contact" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "summary", label: "Summary" },
  { id: "achievements", label: "Achievements" },
  { id: "certifications", label: "Certifications" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const emptyResume = (): ResumeData => ({
  contact: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    github: "",
    portfolio: "",
    picture: "",
  },
  summary: "",
  experiences: [],
  education: [],
  skillGroups: [],
  projects: [],
  achievements: [],
  certifications: [],
});

export const defaultLayoutPreferences = (): LayoutPreferences => ({
  "classic-ats": {
    visible: visibleSections(),
    regions: {
      main: [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
      ],
    },
  },
  "modern-professional": {
    visible: visibleSections(),
    regions: {
      upper: ["summary", "experience"],
      education: ["education"],
      skills: ["skills"],
      lower: ["projects", "certifications", "achievements"],
    },
  },
  "graduate-compact": {
    visible: visibleSections(),
    regions: {
      main: [
        "summary",
        "education",
        "experience",
        "projects",
        "skills",
        "certifications",
        "achievements",
      ],
    },
  },
  "technical-analyst": {
    visible: visibleSections(),
    regions: {
      sidebar: ["skills", "education"],
      main: [
        "summary",
        "experience",
        "projects",
        "certifications",
        "achievements",
      ],
    },
  },
  "sharp-modern": {
    visible: visibleSections(),
    regions: {
      main: [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
      ],
    },
  },
  "academic-photo": {
    visible: visibleSections(),
    regions: {
      main: [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
      ],
    },
  },
  europass: {
    visible: visibleSections(),
    regions: {
      main: [
        "summary",
        "skills",
        "experience",
        "education",
        "projects",
        "certifications",
        "achievements",
      ],
    },
  },
});

export function normalizeTemplateId(value: unknown): TemplateId {
  if (value === "latex-professional") return "classic-ats";
  if (
    value === "classic-ats" ||
    value === "modern-professional" ||
    value === "graduate-compact" ||
    value === "technical-analyst" ||
    value === "sharp-modern" ||
    value === "academic-photo" ||
    value === "europass"
  ) {
    return value;
  }
  return "graduate-compact";
}

export function normalizeLayoutPreferences(value: unknown): LayoutPreferences {
  const defaults = defaultLayoutPreferences();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }
  const source = value as Record<string, unknown>;
  for (const template of Object.keys(defaults) as TemplateId[]) {
    const candidate = source[template];
    if (
      !candidate ||
      typeof candidate !== "object" ||
      Array.isArray(candidate)
    ) {
      continue;
    }
    const supplied = candidate as {
      visible?: Partial<Record<SectionKey, boolean>>;
      regions?: Record<string, SectionKey[]>;
    };
    for (const section of Object.keys(
      defaults[template].visible,
    ) as SectionKey[]) {
      if (typeof supplied.visible?.[section] === "boolean") {
        defaults[template].visible[section] = supplied.visible[section];
      }
    }
    for (const [region, allowed] of Object.entries(
      defaults[template].regions,
    )) {
      const requested = supplied.regions?.[region];
      if (!Array.isArray(requested)) continue;
      const ordered = requested.filter(
        (section, index): section is SectionKey =>
          allowed.includes(section) && requested.indexOf(section) === index,
      );
      defaults[template].regions[region] = [
        ...ordered,
        ...allowed.filter((section) => !ordered.includes(section)),
      ];
    }
  }
  return defaults;
}

function visibleSections(): Record<SectionKey, boolean> {
  return {
    summary: true,
    skills: true,
    experience: true,
    education: true,
    projects: true,
    certifications: true,
    achievements: true,
  };
}

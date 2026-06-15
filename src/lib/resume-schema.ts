import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().default(""),
  title: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().default(""),
  website: z.string().default(""),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  jobTitle: z.string().default(""),
  employer: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  degree: z.string().default(""),
  institution: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  details: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(""),
  description: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  technologies: z.string().default(""),
  link: z.string().default(""),
});

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().default(""),
  skills: z.array(z.string()).default([]),
});

export const achievementSchema = z.object({
  id: z.string().min(1),
  title: z.string().default(""),
  description: z.string().default(""),
});

export const resumeDataSchema = z.object({
  contact: contactSchema,
  summary: z.string().default(""),
  experiences: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skillGroups: z.array(skillGroupSchema).default([]),
  projects: z.array(projectSchema).default([]),
  achievements: z.array(achievementSchema).default([]),
});

export const aiSuggestionSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  reasons: z.array(z.string()).min(1),
  needsMetricDisclaimer: z.boolean(),
});

export const auditIssueSchema = z.object({
  id: z.string().min(1),
  severity: z.enum(["warning", "info", "success"]),
  category: z.enum([
    "Contact",
    "Experience",
    "Education",
    "Skills",
    "Summary",
    "Achievements",
    "ATS",
  ]),
  title: z.string().min(1),
  detail: z.string().min(1),
  fix: z.string().optional(),
});

export const auditResultSchema = z.object({
  overall: z.number().min(0).max(100),
  categories: z
    .array(
      z.object({ name: z.string().min(1), score: z.number().min(0).max(100) }),
    )
    .min(1),
  issues: z.array(auditIssueSchema),
});

export const resumeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "contact",
    "summary",
    "experiences",
    "education",
    "skillGroups",
    "projects",
    "achievements",
  ],
  properties: {
    contact: {
      type: "object",
      additionalProperties: false,
      required: [
        "fullName",
        "title",
        "email",
        "phone",
        "location",
        "linkedin",
        "website",
      ],
      properties: {
        fullName: { type: "string" },
        title: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedin: { type: "string" },
        website: { type: "string" },
      },
    },
    summary: { type: "string" },
    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "jobTitle",
          "employer",
          "location",
          "startDate",
          "endDate",
          "current",
          "bullets",
        ],
        properties: {
          id: { type: "string" },
          jobTitle: { type: "string" },
          employer: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          current: { type: "boolean" },
          bullets: { type: "array", items: { type: "string" } },
        },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "degree",
          "institution",
          "location",
          "startDate",
          "endDate",
          "details",
          "highlights",
        ],
        properties: {
          id: { type: "string" },
          degree: { type: "string" },
          institution: { type: "string" },
          location: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          details: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
        },
      },
    },
    skillGroups: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "skills"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
        },
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "name",
          "description",
          "bullets",
          "technologies",
          "link",
        ],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          bullets: { type: "array", items: { type: "string" } },
          technologies: { type: "string" },
          link: { type: "string" },
        },
      },
    },
    achievements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "description"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
} as const;

export const aiSuggestionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["original", "suggested", "reasons", "needsMetricDisclaimer"],
  properties: {
    original: { type: "string" },
    suggested: { type: "string" },
    reasons: { type: "array", items: { type: "string" } },
    needsMetricDisclaimer: { type: "boolean" },
  },
} as const;

export const auditResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["overall", "categories", "issues"],
  properties: {
    overall: { type: "number" },
    categories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score"],
        properties: {
          name: { type: "string" },
          score: { type: "number" },
        },
      },
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "severity", "category", "title", "detail"],
        properties: {
          id: { type: "string" },
          severity: { type: "string", enum: ["warning", "info", "success"] },
          category: {
            type: "string",
            enum: [
              "Contact",
              "Experience",
              "Education",
              "Skills",
              "Summary",
              "Achievements",
              "ATS",
            ],
          },
          title: { type: "string" },
          detail: { type: "string" },
          fix: { type: "string" },
        },
      },
    },
  },
} as const;

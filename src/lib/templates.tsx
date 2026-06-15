import { type TemplateId } from "./resume-types";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "classic-ats",
    name: "Classic ATS",
    description: "Simple one-column, parser-friendly design.",
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Balanced design for business roles.",
  },
  {
    id: "graduate-compact",
    name: "Graduate Compact",
    description: "Optimised for students and early-career applications.",
  },
  {
    id: "technical-analyst",
    name: "Technical Analyst",
    description: "Two-column layout for analytics, engineering and tech roles.",
  },
  {
    id: "sharp-modern",
    name: "Sharp Modern",
    description:
      "Clean Helvetica-style single-column with bold section rules — great for any role.",
  },
  {
    id: "academic-photo",
    name: "Academic Photo",
    description:
      "Traditional CV template featuring a professional profile photo.",
  },
  {
    id: "europass",
    name: "Europass CV",
    description: "Standardized European Union format for professional CVs.",
  },
];

import { flattenSkills } from "./resume-data";
import { type ResumeData, type StepId, type TemplateId } from "./resume-types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getResumeCompletion(data: ResumeData) {
  const checks = [
    Boolean(data.contact.fullName.trim()),
    Boolean(data.contact.email.trim()),
    hasCompleteExperience(data) || hasCompleteProject(data),
    hasCompleteEducation(data),
    flattenSkills(data).length > 0,
    Boolean(data.summary.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function hasMeaningfulResumeContent(data: ResumeData) {
  return Boolean(
    Object.values(data.contact).some((value) => value.trim()) ||
    data.summary.trim() ||
    data.experiences.length ||
    data.education.length ||
    data.skillGroups.length ||
    data.projects.length ||
    data.achievements.length ||
    data.certifications.length,
  );
}

export function validateResumeStep(
  step: StepId,
  data: ResumeData,
  template: TemplateId,
) {
  switch (step) {
    case "contact":
      return validateContact(data, template);
    case "experience":
      return data.experiences.flatMap((experience, index) => {
        if (!hasExperienceContent(experience)) return [];
        const errors: string[] = [];
        if (!experience.jobTitle.trim()) {
          errors.push(`Role ${index + 1} needs a job title.`);
        }
        if (!experience.employer.trim()) {
          errors.push(`Role ${index + 1} needs an employer.`);
        }
        if (
          experience.startDate &&
          experience.endDate &&
          experience.startDate > experience.endDate
        ) {
          errors.push(
            `Role ${index + 1} has an end date before its start date.`,
          );
        }
        return errors;
      });
    case "education":
      return data.education.flatMap((education, index) => {
        if (!hasEducationContent(education)) return [];
        const errors: string[] = [];
        if (!education.degree.trim()) {
          errors.push(`Education entry ${index + 1} needs a qualification.`);
        }
        if (!education.institution.trim()) {
          errors.push(`Education entry ${index + 1} needs an institution.`);
        }
        if (
          education.startDate &&
          education.endDate &&
          education.startDate > education.endDate
        ) {
          errors.push(
            `Education entry ${index + 1} has an end date before its start date.`,
          );
        }
        return errors;
      });
    case "skills":
      return data.skillGroups.flatMap((group, index) => {
        if (!group.name.trim() && group.skills.length === 0) return [];
        if (!group.name.trim()) {
          return [`Skill group ${index + 1} needs a group name.`];
        }
        if (group.skills.length === 0) {
          return [`Skill group ${index + 1} needs at least one skill.`];
        }
        return [];
      });
    case "projects":
      return data.projects.flatMap((project, index) => {
        if (!hasProjectContent(project)) return [];
        return project.name.trim()
          ? []
          : [`Project ${index + 1} needs a name.`];
      });
    case "achievements":
      return data.achievements.flatMap((achievement, index) => {
        if (!achievement.title.trim() && !achievement.description.trim()) {
          return [];
        }
        return achievement.title.trim()
          ? []
          : [`Achievement ${index + 1} needs a title.`];
      });
    case "certifications":
      return data.certifications.flatMap((certification, index) => {
        if (
          !certification.name.trim() &&
          !certification.issuer.trim() &&
          !certification.date.trim() &&
          !certification.credentialUrl.trim()
        ) {
          return [];
        }
        return certification.name.trim()
          ? []
          : [`Certification ${index + 1} needs a name.`];
      });
    case "summary":
      return [];
  }
}

function validateContact(data: ResumeData, template: TemplateId) {
  const errors: string[] = [];
  if (!data.contact.fullName.trim()) errors.push("Add your full name.");
  if (!data.contact.email.trim()) {
    errors.push("Add your email address.");
  } else if (!EMAIL_PATTERN.test(data.contact.email.trim())) {
    errors.push("Enter a valid email address.");
  }
  if (template === "academic-photo" && !data.contact.picture) {
    errors.push("Add a profile photo or choose a different template.");
  }
  return errors;
}

function hasCompleteExperience(data: ResumeData) {
  return data.experiences.some(
    (experience) =>
      experience.jobTitle.trim() &&
      experience.employer.trim() &&
      experience.bullets.some((bullet) => bullet.trim()),
  );
}

function hasCompleteEducation(data: ResumeData) {
  return data.education.some(
    (education) => education.degree.trim() && education.institution.trim(),
  );
}

function hasCompleteProject(data: ResumeData) {
  return data.projects.some(
    (project) =>
      project.name.trim() &&
      (project.description.trim() ||
        project.bullets.some((bullet) => bullet.trim())),
  );
}

function hasExperienceContent(experience: ResumeData["experiences"][number]) {
  return Boolean(
    experience.jobTitle.trim() ||
    experience.employer.trim() ||
    experience.location.trim() ||
    experience.startDate ||
    experience.endDate ||
    experience.bullets.some((bullet) => bullet.trim()),
  );
}

function hasEducationContent(education: ResumeData["education"][number]) {
  return Boolean(
    education.degree.trim() ||
    education.institution.trim() ||
    education.location.trim() ||
    education.startDate ||
    education.endDate ||
    education.details.trim() ||
    education.highlights.some((highlight) => highlight.trim()),
  );
}

function hasProjectContent(project: ResumeData["projects"][number]) {
  return Boolean(
    project.name.trim() ||
    project.description.trim() ||
    project.bullets.some((bullet) => bullet.trim()) ||
    project.technologies.trim() ||
    project.link.trim(),
  );
}

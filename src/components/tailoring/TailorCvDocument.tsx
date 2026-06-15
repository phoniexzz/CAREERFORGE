/**
 * TailorCvDocument
 *
 * A high-fidelity, fully interactive HTML recreation of the compiled PDF CV.
 * Renders all resume sections from the actual store data and makes
 * AI-suggested sections hoverable / clickable for inline review.
 *
 * Supported templates:
 *   classic-ats         — serif, centered header, ruled section titles
 *   graduate-compact    — tighter spacing, smaller type
 *   modern-professional — slightly bolder accents
 *   technical-analyst   — two-column (main + sidebar)
 *   sharp-modern        — sans-serif, thick rule accent bar
 *   academic-photo      — header with photo placeholder
 *   europass            — left-accent stripe, two-column header
 */

import { Phone, Mail, Linkedin, Globe, MapPin, User } from "lucide-react";

import { useResumeStore } from "@/lib/resume-store";
import { cn } from "@/lib/utils";
import type { TemplateId } from "@/lib/resume-types";
import type { TailoringSuggestion } from "@/lib/tailoring/mock-data";

interface Props {
  suggestions: TailoringSuggestion[];
  onSuggestionClick: (id: string, currentText: string) => void;
  selectedSuggestionId: string | null;
}

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */

function datePeriod(start: string, end: string, current: boolean) {
  const parts = [start, current ? "Present" : end].filter(Boolean);
  return parts.join(" – ");
}

function getSuggestionForText(
  text: string,
  suggestions: TailoringSuggestion[],
  experienceId?: string,
) {
  if (experienceId) {
    return suggestions.find(
      (s) => s.experienceId === experienceId && s.original === text,
    );
  }
  return suggestions.find((s) => s.original === text);
}

function getSummaryText(original: string, suggestions: TailoringSuggestion[]) {
  const sug = suggestions.find((s) => s.id === "summary");
  if (!sug) return original;
  if (sug.status === "rejected") return sug.original;
  return sug.suggested;
}

function getBulletText(
  bullet: string,
  expId: string,
  suggestions: TailoringSuggestion[],
) {
  const sug = suggestions.find(
    (s) => s.experienceId === expId && s.original === bullet,
  );
  if (!sug) return bullet;
  if (sug.status === "rejected") return sug.original;
  return sug.suggested;
}

function SuggestionBadge({ sug }: { sug: TailoringSuggestion | undefined }) {
  if (!sug) return null;
  if (sug.status === "accepted")
    return (
      <span className="ml-1 inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
        ✓ Applied
      </span>
    );
  if (sug.status === "rejected") return null;
  return (
    <span className="ml-1 inline-flex items-center rounded-full bg-indigo-100 border border-indigo-300 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 animate-pulse">
      ✨ Optimised
    </span>
  );
}

function SkillsSuggestionBadge({
  sug,
}: {
  sug: TailoringSuggestion | undefined;
}) {
  if (!sug || sug.status === "rejected") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-dashed px-2 py-0.5 text-[10px] font-semibold",
        sug.status === "accepted"
          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
          : "border-amber-400 bg-amber-50 text-amber-700",
      )}
    >
      ⚠ {sug.suggested} (Gap)
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Section heading — styled per template
───────────────────────────────────────────────────────── */

function SectionHeading({
  children,
  template,
}: {
  children: React.ReactNode;
  template: TemplateId;
}) {
  if (template === "sharp-modern") {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-slate-800 rounded-full shrink-0" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800">
          {children}
        </h3>
        <div className="flex-1 h-px bg-slate-300" />
      </div>
    );
  }
  if (template === "europass") {
    return (
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#1a4f6e] border-b-2 border-[#1a4f6e] pb-0.5 mb-3">
        {children}
      </h3>
    );
  }
  if (template === "modern-professional") {
    return (
      <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2 pb-1 border-b border-slate-300">
        {children}
      </h3>
    );
  }
  // classic-ats, graduate-compact, technical-analyst, academic-photo
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b border-slate-400 pb-0.5 mb-3">
      {children}
    </h3>
  );
}

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */

export function TailorCvDocument({
  suggestions,
  onSuggestionClick,
  selectedSuggestionId,
}: Props) {
  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);
  const {
    contact,
    summary,
    experiences,
    education,
    skillGroups,
    projects,
    achievements,
    certifications,
  } = data;

  const summarySug = suggestions.find((s) => s.id === "summary");
  const skillsSug = suggestions.find((s) => s.id === "unsupported-1");

  /* ── Wrapper styles by template ── */
  const isCompact = template === "graduate-compact";
  const isTwoCol = template === "technical-analyst";
  const hasPhoto = template === "academic-photo" || template === "europass";
  const isEuropass = template === "europass";
  const isSharp = template === "sharp-modern";

  const fontClass = isSharp
    ? "font-sans"
    : "font-[Georgia,_'Times_New_Roman',_serif]";

  const bodySize = isCompact ? "text-[10.5px]" : "text-[11px]";
  const gap = isCompact ? "space-y-3" : "space-y-5";

  /* ── Clickable section wrapper ── */
  const Section = ({
    sug,
    onClick,
    children,
    className,
  }: {
    sug?: TailoringSuggestion;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded transition-all duration-150",
        sug && onClick && "cursor-pointer group",
        sug?.status === "pending" &&
          "ring-1 ring-indigo-300/50 hover:ring-indigo-400 hover:bg-indigo-50/30",
        sug?.status === "accepted" &&
          "ring-1 ring-emerald-300/50 hover:bg-emerald-50/20",
        selectedSuggestionId === sug?.id && "ring-2 ring-indigo-500",
        className,
      )}
    >
      {children}
      {sug && onClick && sug.status === "pending" && (
        <span className="absolute -top-2 -right-1 hidden group-hover:flex items-center gap-0.5 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow z-10">
          ✨ Click to review
        </span>
      )}
    </div>
  );

  /* ── Contact header ── */
  const renderHeader = () => {
    const name = contact.fullName || "Your Name";
    const title = contact.title || "";
    const info = [
      contact.phone && { icon: Phone, text: contact.phone },
      contact.email && { icon: Mail, text: contact.email },
      contact.linkedin && { icon: Linkedin, text: "LinkedIn" },
      contact.website && { icon: Globe, text: "Website" },
      contact.location && { icon: MapPin, text: contact.location },
    ].filter(Boolean) as { icon: React.ElementType; text: string }[];

    if (hasPhoto) {
      return (
        <div
          className={cn(
            "flex items-start gap-5 pb-4 border-b border-slate-300 mb-5",
            isEuropass && "border-b-2 border-[#1a4f6e]",
          )}
        >
          <div
            className={cn(
              "shrink-0 size-20 rounded border flex flex-col items-center justify-center text-[9px] text-slate-400",
              isEuropass
                ? "rounded-none border-[#1a4f6e]"
                : "border-slate-300 bg-slate-50",
            )}
          >
            <User className="size-7 text-slate-300 mb-1" />
            <span>Photo</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                "font-bold text-slate-900 leading-tight",
                isCompact ? "text-xl" : "text-2xl",
              )}
            >
              {name}
            </h1>
            {title && (
              <p
                className={cn(
                  "font-semibold mt-0.5",
                  isEuropass ? "text-[#1a4f6e]" : "text-slate-600",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                {title}
              </p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
              {info.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1 text-[10px] text-slate-500"
                >
                  <Icon className="size-2.5 shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "text-center pb-4 border-b border-slate-400 mb-5",
          isSharp && "border-b-0 pb-0 mb-0",
        )}
      >
        {isSharp && <div className="h-1.5 bg-slate-800 w-full mb-4 rounded" />}
        <h1
          className={cn(
            "font-bold text-slate-900 tracking-wide leading-tight",
            isCompact ? "text-[22px]" : "text-[26px]",
          )}
        >
          {name}
        </h1>
        {title && (
          <p
            className={cn(
              "mt-0.5 font-semibold text-slate-600",
              isCompact ? "text-xs" : "text-sm",
            )}
          >
            {title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 mt-2">
          {info.map(({ icon: Icon, text }, i) => (
            <span
              key={text}
              className="flex items-center gap-1 text-[10px] text-slate-500"
            >
              {i > 0 && <span className="text-slate-300 mr-1">|</span>}
              <Icon className="size-2.5 shrink-0" />
              {text}
            </span>
          ))}
        </div>
        {isSharp && <div className="h-px bg-slate-300 w-full mt-4" />}
      </div>
    );
  };

  /* ── Summary ── */
  const renderSummary = () => {
    if (!summary && !summarySug) return null;
    return (
      <div>
        <SectionHeading template={template}>Summary</SectionHeading>
        <Section
          sug={summarySug}
          onClick={
            summarySug
              ? () =>
                  onSuggestionClick(
                    "summary",
                    getSummaryText(summary, suggestions),
                  )
              : undefined
          }
        >
          <p className={cn("leading-relaxed text-slate-700", bodySize)}>
            {getSummaryText(summary, suggestions)}
            <SuggestionBadge sug={summarySug} />
          </p>
        </Section>
      </div>
    );
  };

  /* ── Skills ── */
  const renderSkills = () => {
    if (skillGroups.length === 0 && !skillsSug) return null;
    return (
      <div>
        <SectionHeading template={template}>Skills</SectionHeading>
        <div className={cn("space-y-1", bodySize)}>
          {skillGroups.map((group) => (
            <p key={group.id} className="leading-relaxed text-slate-700">
              {group.name && (
                <span className="font-semibold text-slate-800">
                  {group.name}:{" "}
                </span>
              )}
              {group.skills.join(", ")}
            </p>
          ))}
          <SkillsSuggestionBadge sug={skillsSug} />
        </div>
      </div>
    );
  };

  /* ── Experience ── */
  const renderExperience = () => {
    if (experiences.length === 0) return null;
    return (
      <div>
        <SectionHeading template={template}>Experience</SectionHeading>
        <div className="space-y-4">
          {experiences.map((exp) => {
            const expSuggestions = suggestions.filter(
              (s) => s.experienceId === exp.id,
            );
            return (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn("font-bold text-slate-900", bodySize)}>
                    {exp.employer}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {datePeriod(exp.startDate, exp.endDate, exp.current)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cn("italic text-slate-600", bodySize)}>
                    {exp.jobTitle}
                  </span>
                  {exp.location && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {exp.location}
                    </span>
                  )}
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1.5 list-disc pl-4 space-y-1">
                    {exp.bullets.map((bullet) => {
                      const sug = expSuggestions.find(
                        (s) => s.original === bullet,
                      );
                      return (
                        <li
                          key={bullet}
                          onClick={
                            sug
                              ? () =>
                                  onSuggestionClick(
                                    sug.id,
                                    getBulletText(bullet, exp.id, suggestions),
                                  )
                              : undefined
                          }
                          className={cn(
                            "leading-relaxed text-slate-700 relative pr-6 rounded transition-all",
                            bodySize,
                            sug && "cursor-pointer group hover:bg-indigo-50/40",
                            sug?.status === "pending" &&
                              "ring-1 ring-inset ring-indigo-200 hover:ring-indigo-400",
                            sug?.status === "accepted" &&
                              "ring-1 ring-inset ring-emerald-200",
                            selectedSuggestionId === sug?.id &&
                              "ring-2 ring-indigo-500",
                          )}
                        >
                          <span>
                            {getBulletText(bullet, exp.id, suggestions)}
                          </span>
                          <SuggestionBadge sug={sug} />
                          {sug && sug.status === "pending" && (
                            <span className="absolute right-0 top-0.5 hidden group-hover:flex items-center text-indigo-600 text-[8px] font-bold">
                              ✨
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Education ── */
  const renderEducation = () => {
    if (education.length === 0) return null;
    return (
      <div>
        <SectionHeading template={template}>Education</SectionHeading>
        <div className="space-y-3">
          {education.map((edu) => (
            <div key={edu.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("font-bold text-slate-900", bodySize)}>
                  {edu.institution}
                </span>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                  {datePeriod(edu.startDate, edu.endDate, false)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("italic text-slate-600", bodySize)}>
                  {edu.degree}
                </span>
                {edu.location && (
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {edu.location}
                  </span>
                )}
              </div>
              {edu.details && (
                <p
                  className={cn(
                    "text-slate-600 mt-0.5 leading-relaxed",
                    bodySize,
                  )}
                >
                  {edu.details}
                </p>
              )}
              {edu.highlights.length > 0 && (
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {edu.highlights.map((h) => (
                    <li key={h} className={cn("text-slate-700", bodySize)}>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── Projects ── */
  const renderProjects = () => {
    if (projects.length === 0) return null;
    return (
      <div>
        <SectionHeading template={template}>Projects</SectionHeading>
        <div className="space-y-3">
          {projects.map((proj) => (
            <div key={proj.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn("font-bold text-slate-900", bodySize)}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span className="text-[10px] text-slate-500 shrink-0 italic">
                    {proj.technologies}
                  </span>
                )}
              </div>
              {proj.description && (
                <p
                  className={cn(
                    "text-slate-700 mt-0.5 leading-relaxed",
                    bodySize,
                  )}
                >
                  {proj.description}
                </p>
              )}
              {proj.bullets.length > 0 && (
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {proj.bullets.map((b) => (
                    <li key={b} className={cn("text-slate-700", bodySize)}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ── Achievements ── */
  const renderAchievements = () => {
    if (achievements.length === 0) return null;
    return (
      <div>
        <SectionHeading template={template}>Achievements</SectionHeading>
        <ul className="list-disc pl-4 space-y-1">
          {achievements.map((ach) => (
            <li
              key={ach.id}
              className={cn("text-slate-700 leading-relaxed", bodySize)}
            >
              <span className="font-semibold">{ach.title}</span>
              {ach.description && ` – ${ach.description}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /* ── Certifications ── */
  const renderCertifications = () => {
    if (certifications.length === 0) return null;
    return (
      <div>
        <SectionHeading template={template}>Certifications</SectionHeading>
        <ul className="list-disc pl-4 space-y-1">
          {certifications.map((cert) => (
            <li
              key={cert.id}
              className={cn("text-slate-700 leading-relaxed", bodySize)}
            >
              <span className="font-semibold">{cert.name}</span>
              {cert.issuer && ` — ${cert.issuer}`}
              {cert.date && (
                <span className="text-slate-500"> ({cert.date})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /* ── Two-column layout (Technical Analyst) ── */
  if (isTwoCol) {
    return (
      <div
        className={cn(
          "bg-white text-slate-900 p-10 min-h-[900px] w-full",
          fontClass,
        )}
      >
        {renderHeader()}
        <div className="grid grid-cols-3 gap-6 mt-5">
          {/* Main column */}
          <div className="col-span-2 space-y-5">
            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
            {renderAchievements()}
            {renderCertifications()}
          </div>
          {/* Sidebar */}
          <div className="space-y-5 border-l border-slate-200 pl-5">
            {renderSkills()}
            {renderEducation()}
          </div>
        </div>
      </div>
    );
  }

  /* ── Single-column layout (all others) ── */
  return (
    <div
      className={cn(
        "bg-white text-slate-900 min-h-[900px] w-full",
        fontClass,
        isCompact ? "p-7" : "p-10",
      )}
    >
      {renderHeader()}
      <div className={cn(isCompact ? "space-y-4 mt-4" : "space-y-5 mt-5")}>
        {renderSummary()}
        {renderSkills()}
        {renderExperience()}
        {renderEducation()}
        {renderProjects()}
        {renderAchievements()}
        {renderCertifications()}
      </div>
    </div>
  );
}

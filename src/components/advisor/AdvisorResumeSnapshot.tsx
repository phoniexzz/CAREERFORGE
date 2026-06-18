import type { ResumeData } from "@/lib/resume-types";

export function AdvisorResumeSnapshot({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-4">
      <SnapshotSection title="Professional summary">
        <p className="text-sm leading-6 text-[#24324a]">
          {data.summary || "No professional summary supplied."}
        </p>
      </SnapshotSection>

      {data.experiences.length > 0 && (
        <SnapshotSection title="Experience">
          <div className="space-y-4">
            {data.experiences.map((experience) => (
              <div
                key={experience.id}
                className="border-l-2 border-[#e2e6eb] pl-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong className="text-sm text-[#172036]">
                    {experience.jobTitle}
                    {experience.employer && (
                      <span className="font-medium text-[#667085]">
                        {" "}
                        · {experience.employer}
                      </span>
                    )}
                  </strong>
                  <span className="text-xs text-[#667085]">
                    {dateRange(
                      experience.startDate,
                      experience.endDate,
                      experience.current,
                    )}
                  </span>
                </div>
                {experience.location && (
                  <p className="mt-0.5 text-xs text-[#667085]">
                    {experience.location}
                  </p>
                )}
                {experience.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#24324a]">
                    {experience.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SnapshotSection>
      )}

      {data.education.length > 0 && (
        <SnapshotSection title="Education">
          <div className="space-y-4">
            {data.education.map((education) => (
              <div key={education.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong className="text-sm text-[#172036]">
                    {education.institution}
                  </strong>
                  <span className="text-xs text-[#667085]">
                    {dateRange(education.startDate, education.endDate, false)}
                  </span>
                </div>
                <p className="text-sm text-[#667085]">{education.degree}</p>
                {education.details && (
                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    {education.details}
                  </p>
                )}
                {education.highlights.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-[#24324a]">
                    {education.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SnapshotSection>
      )}

      {data.projects.length > 0 && (
        <SnapshotSection title="Projects">
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <strong className="text-sm text-[#172036]">
                  {project.name}
                </strong>
                {project.description && (
                  <p className="mt-1 text-sm leading-6 text-[#667085]">
                    {project.description}
                  </p>
                )}
                {project.technologies && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.technologies.split(",").map((technology) => (
                      <span
                        key={technology}
                        className="rounded-md bg-[#edf0f4] px-2 py-1 text-xs text-[#667085]"
                      >
                        {technology.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {project.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#24324a]">
                    {project.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SnapshotSection>
      )}

      {data.skillGroups.length > 0 && (
        <SnapshotSection title="Skills">
          <div className="space-y-3">
            {data.skillGroups.map((group) => (
              <div key={group.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  {group.name}
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-[#edf0f4] px-2 py-1 text-xs text-[#667085]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SnapshotSection>
      )}

      {data.achievements.length > 0 && (
        <SnapshotSection title="Achievements">
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#24324a]">
            {data.achievements.map((achievement) => (
              <li key={achievement.id}>
                {achievement.title}
                {achievement.description && ` — ${achievement.description}`}
              </li>
            ))}
          </ul>
        </SnapshotSection>
      )}

      {data.certifications.length > 0 && (
        <SnapshotSection title="Certifications">
          <ul className="list-disc space-y-1 pl-5 text-sm text-[#24324a]">
            {data.certifications.map((certification) => (
              <li key={certification.id}>
                {certification.name}
                {certification.issuer && ` — ${certification.issuer}`}
                {certification.date && ` (${certification.date})`}
              </li>
            ))}
          </ul>
        </SnapshotSection>
      )}
    </div>
  );
}

function SnapshotSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe3e8] bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[#667085]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function dateRange(start: string, end: string, current: boolean) {
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

import { Button } from "@/components/ui/button";
import { selectedJob } from "@/lib/tailoring/mock-data";

export function JobSummaryCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold leading-tight">
            {selectedJob.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedJob.company} · {selectedJob.location}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="font-mono text-xl font-bold text-primary">
            {selectedJob.matchScore}%
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Demo match
          </span>
        </div>
      </div>

      {!compact && (
        <div className="space-y-3 border-t border-border pt-4">
          <SkillList label="Required" skills={selectedJob.requiredSkills} />
          <SkillList
            label="Preferred"
            skills={selectedJob.preferredSkills}
            muted
          />
          <div className="pt-2">
            <Button variant="outline" size="sm" disabled className="text-xs">
              Job Matcher connection coming later
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillList({
  label,
  skills,
  muted = false,
}: {
  label: string;
  skills: string[];
  muted?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className={
              muted
                ? "rounded bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                : "rounded bg-primary-soft px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary"
            }
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

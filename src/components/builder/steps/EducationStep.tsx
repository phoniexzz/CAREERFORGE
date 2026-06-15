import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume-store";
import { type Education } from "@/lib/resume-types";
import { Plus, Trash2 } from "lucide-react";

const newEd = (): Education => ({
  id: Math.random().toString(36).slice(2),
  degree: "",
  institution: "",
  location: "",
  startDate: "",
  endDate: "",
  details: "",
  highlights: [],
});

export function EducationStep() {
  const items = useResumeStore((s) => s.data.education);
  const setData = useResumeStore((s) => s.setData);

  const update = (id: string, patch: Partial<Education>) =>
    setData((d) => ({
      ...d,
      education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  const remove = (id: string) =>
    setData((d) => ({
      ...d,
      education: d.education.filter((e) => e.id !== id),
    }));
  const add = () =>
    setData((d) => ({ ...d, education: [...d.education, newEd()] }));

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Academic profile</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">Education</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Put your current or most recent degree first, then add relevant
          qualifications.
        </p>
      </header>

      {items.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="text-sm text-neutral-500 mb-4">
            No education entries yet.
          </p>
          <Button onClick={add}>
            <Plus className="size-4" /> Add education
          </Button>
        </div>
      )}

      {items.map((e, i) => (
        <div key={e.id} className="form-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-chip">Entry {i + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(e.id)}
              className="text-neutral-400 hover:text-destructive"
              aria-label={`Remove education entry ${i + 1}`}
              title="Remove entry"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Degree / Qualification">
              <Input
                value={e.degree}
                onChange={(ev) => update(e.id, { degree: ev.target.value })}
              />
            </Field>
            <Field label="Institution">
              <Input
                value={e.institution}
                onChange={(ev) =>
                  update(e.id, { institution: ev.target.value })
                }
              />
            </Field>
            <Field label="Location">
              <Input
                value={e.location}
                onChange={(ev) => update(e.id, { location: ev.target.value })}
              />
            </Field>
            <Field label="Start Date">
              <Input
                type="month"
                value={e.startDate}
                onChange={(ev) => update(e.id, { startDate: ev.target.value })}
              />
            </Field>
            <Field label="End / Expected">
              <Input
                type="month"
                value={e.endDate}
                onChange={(ev) => update(e.id, { endDate: ev.target.value })}
              />
            </Field>
          </div>

          <Field label="Grade, modules, awards or activities">
            <Textarea
              value={e.highlights.join("\n") || e.details}
              onChange={(ev) =>
                update(e.id, {
                  details: ev.target.value,
                  highlights: ev.target.value
                    .split(/\r?\n/)
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
              className="min-h-20"
              placeholder="One highlight per line"
            />
          </Field>
        </div>
      ))}

      {items.length > 0 && (
        <Button
          variant="outline"
          onClick={add}
          className="w-full rounded-md border-2 border-dashed border-[#b8c7ce] bg-transparent py-6 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Plus className="size-4" /> Add another entry
        </Button>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="field-label">{label}</Label>
      {children}
    </div>
  );
}

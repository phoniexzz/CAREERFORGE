import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume-store";
import { type Project } from "@/lib/resume-types";
import { Plus, Trash2 } from "lucide-react";

const newProject = (): Project => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  description: "",
  bullets: [],
  technologies: "",
  link: "",
});

export function ProjectsStep() {
  const items = useResumeStore((s) => s.data.projects);
  const setData = useResumeStore((s) => s.setData);

  const update = (id: string, patch: Partial<Project>) =>
    setData((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  const remove = (id: string) =>
    setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
  const add = () =>
    setData((d) => ({ ...d, projects: [...d.projects, newProject()] }));

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Applied evidence</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">Projects</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Include relevant coursework, dissertations, society roles, hackathons
          or personal work.
        </p>
      </header>

      {items.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="text-sm text-neutral-500 mb-4">No projects yet.</p>
          <Button onClick={add}>
            <Plus className="size-4" /> Add a project
          </Button>
        </div>
      )}

      {items.map((p, i) => (
        <div key={p.id} className="form-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-chip">Project {i + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(p.id)}
              className="text-neutral-400 hover:text-destructive"
              aria-label={`Remove project ${i + 1}`}
              title="Remove project"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={p.name}
                onChange={(e) => update(p.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Link">
              <Input
                value={p.link}
                onChange={(e) => update(p.id, { link: e.target.value })}
                placeholder="github.com/..."
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={p.description}
              onChange={(e) => update(p.id, { description: e.target.value })}
              className="min-h-20"
            />
          </Field>
          <Field label="Project evidence">
            <Textarea
              value={p.bullets.join("\n")}
              onChange={(e) =>
                update(p.id, {
                  bullets: e.target.value
                    .split(/\r?\n/)
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
              className="min-h-20"
              placeholder="One bullet per line"
            />
          </Field>
          <Field label="Technologies">
            <Input
              value={p.technologies}
              onChange={(e) => update(p.id, { technologies: e.target.value })}
              placeholder="React, Node, PostgreSQL"
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
          <Plus className="size-4" /> Add another project
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

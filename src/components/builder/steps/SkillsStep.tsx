import { useState, type KeyboardEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

import { AIGuidancePanel } from "../AIGuidancePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/resume-store";
import { type SkillGroup } from "@/lib/resume-types";

const newGroup = (): SkillGroup => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  skills: [],
});

export function SkillsStep() {
  const groups = useResumeStore((state) => state.data.skillGroups);
  const setData = useResumeStore((state) => state.setData);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const update = (id: string, patch: Partial<SkillGroup>) =>
    setData((data) => ({
      ...data,
      skillGroups: data.skillGroups.map((group) =>
        group.id === id ? { ...group, ...patch } : group,
      ),
    }));

  const addGroup = () =>
    setData((data) => ({
      ...data,
      skillGroups: [...data.skillGroups, newGroup()],
    }));

  const removeGroup = (id: string) =>
    setData((data) => ({
      ...data,
      skillGroups: data.skillGroups.filter((group) => group.id !== id),
    }));

  const addSkill = (group: SkillGroup) => {
    const values = (drafts[group.id] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) return;
    const existing = new Set(
      group.skills.map((skill) => skill.trim().toLowerCase()),
    );
    const additions = values.filter((value) => {
      const normalized = value.toLowerCase();
      if (existing.has(normalized)) return false;
      existing.add(normalized);
      return true;
    });
    if (additions.length > 0) {
      update(group.id, { skills: [...group.skills, ...additions] });
    }
    setDrafts((current) => ({ ...current, [group.id]: "" }));
  };

  const removeSkill = (group: SkillGroup, skill: string) =>
    update(group.id, {
      skills: group.skills.filter((item) => item !== skill),
    });

  const onKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    group: SkillGroup,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill(group);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Capability profile</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">Skills</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Group related capabilities so recruiters can understand your technical
          and professional strengths quickly.
        </p>
      </header>

      {groups.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="mb-4 text-sm text-neutral-500">
            No skill groups added yet.
          </p>
          <Button onClick={addGroup}>
            <Plus className="size-4" /> Add a skill group
          </Button>
        </div>
      )}

      {groups.map((group, index) => (
        <div key={group.id} className="form-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-chip">Group {index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-neutral-400 hover:text-destructive"
              onClick={() => removeGroup(group.id)}
              aria-label={`Remove skill group ${index + 1}`}
              title="Remove skill group"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="field-label">Group name</Label>
            <Input
              value={group.name}
              onChange={(event) =>
                update(group.id, { name: event.target.value })
              }
              placeholder="e.g. Technical tools"
            />
          </div>

          <div className="space-y-2">
            <Label className="field-label">Skills</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={drafts[group.id] ?? ""}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [group.id]: event.target.value,
                  }))
                }
                onKeyDown={(event) => onKeyDown(event, group)}
                placeholder="e.g. Python, Power BI, stakeholder communication"
              />
              <Button onClick={() => addSkill(group)}>Add skill</Button>
            </div>
          </div>

          <div className="flex min-h-10 flex-wrap gap-2">
            {group.skills.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No skills in this group yet.
              </p>
            ) : (
              group.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand/20 bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(group, skill)}
                    className="hover:text-destructive"
                    aria-label={`Remove ${skill}`}
                    title={`Remove ${skill}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      ))}

      {groups.length > 0 && (
        <Button
          variant="outline"
          onClick={addGroup}
          className="w-full rounded-md border-2 border-dashed border-[#b8c7ce] bg-transparent py-6 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Plus className="size-4" /> Add another skill group
        </Button>
      )}

      <AIGuidancePanel
        title="Skills checklist"
        tips={[
          "Use clear category names such as Technical tools or Business analysis.",
          "Focus on skills you can support with an example.",
          "Keep each group focused and avoid duplicate skills.",
          "Prioritise language that appears in the roles you are targeting.",
        ]}
      />
    </div>
  );
}

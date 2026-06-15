import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/lib/resume-store";
import { type Achievement } from "@/lib/resume-types";

const newAchievement = (): Achievement => ({
  id: Math.random().toString(36).slice(2),
  title: "",
  description: "",
});

export function AchievementsStep() {
  const achievements = useResumeStore((state) => state.data.achievements);
  const setData = useResumeStore((state) => state.setData);

  const update = (id: string, patch: Partial<Achievement>) =>
    setData((data) => ({
      ...data,
      achievements: data.achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, ...patch } : achievement,
      ),
    }));

  const add = () =>
    setData((data) => ({
      ...data,
      achievements: [...data.achievements, newAchievement()],
    }));

  const remove = (id: string) =>
    setData((data) => ({
      ...data,
      achievements: data.achievements.filter(
        (achievement) => achievement.id !== id,
      ),
    }));

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Optional distinction</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">Achievements</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Add awards, competition results, scholarships or other distinctions
          that strengthen your application.
        </p>
      </header>

      {achievements.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="mb-2 text-sm font-semibold text-[#28485b]">
            This section is optional
          </p>
          <p className="mb-4 text-sm text-neutral-500">
            Leave it empty if you do not have a relevant distinction to add.
          </p>
          <Button onClick={add}>
            <Plus className="size-4" /> Add an achievement
          </Button>
        </div>
      )}

      {achievements.map((achievement, index) => (
        <div key={achievement.id} className="form-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-chip">Achievement {index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-neutral-400 hover:text-destructive"
              onClick={() => remove(achievement.id)}
              aria-label={`Remove achievement ${index + 1}`}
              title="Remove achievement"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label className="field-label">Title</Label>
            <Input
              value={achievement.title}
              onChange={(event) =>
                update(achievement.id, { title: event.target.value })
              }
              placeholder="e.g. CORMSIS Excellence Award"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="field-label">Description</Label>
            <Textarea
              value={achievement.description}
              onChange={(event) =>
                update(achievement.id, { description: event.target.value })
              }
              className="min-h-20"
              placeholder="Briefly explain the award, result or recognition."
            />
          </div>
        </div>
      ))}

      {achievements.length > 0 && (
        <Button
          variant="outline"
          onClick={add}
          className="w-full rounded-md border-2 border-dashed border-[#b8c7ce] bg-transparent py-6 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Plus className="size-4" /> Add another achievement
        </Button>
      )}
    </div>
  );
}

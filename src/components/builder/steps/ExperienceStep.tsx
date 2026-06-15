import { useState } from "react";
import { LoaderCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AIGuidancePanel } from "../AIGuidancePanel";
import { AISuggestionModal } from "../AISuggestionModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { rewriteExperience } from "@/lib/api/resume-ai.functions";
import { type AISuggestion } from "@/lib/mock-ai";
import { useResumeStore } from "@/lib/resume-store";
import { type Experience } from "@/lib/resume-types";

const newExperience = (): Experience => ({
  id: Math.random().toString(36).slice(2),
  jobTitle: "",
  employer: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: [""],
});

type AITarget = { experienceId: string; bulletIndex: number };

export function ExperienceStep() {
  const experiences = useResumeStore((state) => state.data.experiences);
  const setData = useResumeStore((state) => state.setData);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTarget, setAiTarget] = useState<AITarget | null>(null);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Experience>) =>
    setData((data) => ({
      ...data,
      experiences: data.experiences.map((experience) =>
        experience.id === id ? { ...experience, ...patch } : experience,
      ),
    }));

  const updateBullet = (id: string, index: number, value: string) =>
    setData((data) => ({
      ...data,
      experiences: data.experiences.map((experience) =>
        experience.id === id
          ? {
              ...experience,
              bullets: experience.bullets.map((bullet, bulletIndex) =>
                bulletIndex === index ? value : bullet,
              ),
            }
          : experience,
      ),
    }));

  const addBullet = (experience: Experience) =>
    update(experience.id, { bullets: [...experience.bullets, ""] });

  const removeBullet = (experience: Experience, index: number) =>
    update(experience.id, {
      bullets:
        experience.bullets.length === 1
          ? [""]
          : experience.bullets.filter(
              (_, bulletIndex) => bulletIndex !== index,
            ),
    });

  const remove = (id: string) =>
    setData((data) => ({
      ...data,
      experiences: data.experiences.filter(
        (experience) => experience.id !== id,
      ),
    }));

  const add = () =>
    setData((data) => ({
      ...data,
      experiences: [...data.experiences, newExperience()],
    }));

  const triggerAI = async (experience: Experience, bulletIndex: number) => {
    const bullet = experience.bullets[bulletIndex] ?? "";
    if (!bullet.trim()) {
      toast.error("Write a contribution before enhancing it");
      return;
    }
    const targetKey = `${experience.id}-${bulletIndex}`;
    setAiTarget({ experienceId: experience.id, bulletIndex });
    setSuggestion(null);
    setPendingTarget(targetKey);
    try {
      const nextSuggestion = await rewriteExperience({
        data: {
          text: bullet,
          context: [
            experience.jobTitle,
            experience.employer,
            experience.location,
          ]
            .filter(Boolean)
            .join(", "),
        },
      });
      setSuggestion(nextSuggestion);
      setAiOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "AI rewrite is unavailable right now.";
      toast.error("AI rewrite unavailable", { description: message });
    } finally {
      setPendingTarget(null);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Evidence of experience</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">
          Work experience
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Add each contribution as a separate bullet so every template remains
          clear and easy to scan.
        </p>
      </header>

      {experiences.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="mb-4 text-sm text-neutral-500">No roles added yet.</p>
          <Button onClick={add}>
            <Plus className="size-4" /> Add your first role
          </Button>
        </div>
      )}

      {experiences.map((experience, index) => (
        <div key={experience.id} className="form-panel space-y-5">
          <div className="flex items-center justify-between">
            <span className="section-chip">Role {index + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(experience.id)}
              className="text-neutral-400 hover:text-destructive"
              aria-label={`Remove role ${index + 1}`}
              title="Remove role"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title">
              <Input
                value={experience.jobTitle}
                onChange={(event) =>
                  update(experience.id, { jobTitle: event.target.value })
                }
              />
            </Field>
            <Field label="Employer">
              <Input
                value={experience.employer}
                onChange={(event) =>
                  update(experience.id, { employer: event.target.value })
                }
              />
            </Field>
            <Field label="Location">
              <Input
                value={experience.location}
                onChange={(event) =>
                  update(experience.id, { location: event.target.value })
                }
              />
            </Field>
            <Field label="Start date">
              <Input
                type="month"
                value={experience.startDate}
                onChange={(event) =>
                  update(experience.id, { startDate: event.target.value })
                }
              />
            </Field>
            <Field label="End date">
              <Input
                type="month"
                value={experience.endDate}
                disabled={experience.current}
                onChange={(event) =>
                  update(experience.id, { endDate: event.target.value })
                }
              />
            </Field>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id={`current-${experience.id}`}
                checked={experience.current}
                onCheckedChange={(checked) =>
                  update(experience.id, {
                    current: Boolean(checked),
                    endDate: checked ? "" : experience.endDate,
                  })
                }
              />
              <Label
                htmlFor={`current-${experience.id}`}
                className="text-sm font-medium"
              >
                Currently working here
              </Label>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="field-label">Contributions and outcomes</Label>
              <p className="mt-1 text-xs text-[#718590]">
                Keep one action or result in each bullet.
              </p>
            </div>
            {experience.bullets.map((bullet, bulletIndex) => (
              <div
                key={`${experience.id}-${bulletIndex}`}
                className="rounded-md border border-[#d9e2e7] bg-[#f8fafb] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#607482]">
                    Bullet {bulletIndex + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void triggerAI(experience, bulletIndex)}
                      className="h-8 text-brand"
                      disabled={!bullet.trim() || pendingTarget !== null}
                    >
                      {pendingTarget === `${experience.id}-${bulletIndex}` ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      Enhance
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-neutral-400 hover:text-destructive"
                      onClick={() => removeBullet(experience, bulletIndex)}
                      aria-label={`Remove bullet ${bulletIndex + 1}`}
                      title="Remove bullet"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={bullet}
                  onChange={(event) =>
                    updateBullet(experience.id, bulletIndex, event.target.value)
                  }
                  className="min-h-24 bg-white"
                  placeholder="Built, analysed, improved or delivered..."
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBullet(experience)}
            >
              <Plus className="size-3.5" /> Add bullet
            </Button>
          </div>

          <AIGuidancePanel />
        </div>
      ))}

      {experiences.length > 0 && (
        <Button
          variant="outline"
          onClick={add}
          className="w-full rounded-md border-2 border-dashed border-[#b8c7ce] bg-transparent py-6 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Plus className="size-4" /> Add another role
        </Button>
      )}

      <AISuggestionModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        suggestion={suggestion}
        onAccept={(text) => {
          if (aiTarget) {
            updateBullet(aiTarget.experienceId, aiTarget.bulletIndex, text);
          }
        }}
      />
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

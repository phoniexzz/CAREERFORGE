import { Settings2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getMatchPreferences,
  recalculateJobMatches,
  updateMatchPreferences,
  type MatchPreferences,
  type MatchRun,
} from "@/lib/matchmaker-api";

const empty: MatchPreferences = {
  revision: 0,
  preferredLocations: [],
  workModes: [],
  targetRoles: [],
  industries: [],
  drivingLicence: "unknown",
  workEligibility: "unknown",
};

function split(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MatchPreferencesDialog({
  resumeId,
  onRecalculation,
}: {
  resumeId: string;
  onRecalculation: (run: MatchRun) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<MatchPreferences>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void getMatchPreferences(resumeId)
      .then(setValue)
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Preferences could not be loaded.",
        ),
      );
  }, [open, resumeId]);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await updateMatchPreferences(resumeId, value);
      setValue(saved);
      onRecalculation(await recalculateJobMatches(resumeId));
      setOpen(false);
      toast.success("Matching preferences saved");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Preferences could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-bold hover:bg-muted">
          <Settings2 className="h-4 w-4 text-primary" />
          Match preferences
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Match preferences</DialogTitle>
          <DialogDescription>
            These private settings improve matching and are not added to your
            downloadable CV. Unknown values are never guessed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <Field label="Preferred locations">
            <input
              value={value.preferredLocations.join(", ")}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  preferredLocations: split(event.target.value),
                }))
              }
              placeholder="London, Manchester"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            />
          </Field>
          <Field label="Target roles">
            <input
              value={value.targetRoles.join(", ")}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  targetRoles: split(event.target.value),
                }))
              }
              placeholder="Business Analyst, Data Analyst"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            />
          </Field>
          <Field label="Preferred industries">
            <input
              value={value.industries.join(", ")}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  industries: split(event.target.value),
                }))
              }
              placeholder="Consulting, Financial services"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            />
          </Field>
          <Field label="Work modes">
            <div className="flex min-h-10 flex-wrap items-center gap-3 rounded-lg border border-input px-3 py-2 text-sm">
              {(["remote", "hybrid", "on-site"] as const).map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-1 capitalize"
                >
                  <input
                    type="checkbox"
                    checked={value.workModes.includes(mode)}
                    onChange={() =>
                      setValue((current) => ({
                        ...current,
                        workModes: current.workModes.includes(mode)
                          ? current.workModes.filter((item) => item !== mode)
                          : [...current.workModes, mode],
                      }))
                    }
                  />
                  {mode}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Driving licence">
            <ConfirmationSelect
              value={value.drivingLicence}
              onChange={(drivingLicence) =>
                setValue((current) => ({ ...current, drivingLicence }))
              }
            />
          </Field>
          <Field label="UK work eligibility">
            <ConfirmationSelect
              value={value.workEligibility}
              onChange={(workEligibility) =>
                setValue((current) => ({ ...current, workEligibility }))
              }
            />
          </Field>
        </div>

        <DialogFooter>
          <button
            onClick={() => setOpen(false)}
            className="h-10 rounded-lg border border-border px-4 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save and recalculate"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-bold">{label}</span>
      {children}
    </label>
  );
}

function ConfirmationSelect({
  value,
  onChange,
}: {
  value: "yes" | "no" | "unknown";
  onChange: (value: "yes" | "no" | "unknown") => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as "yes" | "no" | "unknown")
      }
      className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
    >
      <option value="unknown">Not confirmed</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  );
}

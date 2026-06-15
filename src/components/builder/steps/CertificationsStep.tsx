import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/resume-store";
import { type Certification } from "@/lib/resume-types";

const newCertification = (): Certification => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  issuer: "",
  date: "",
  credentialUrl: "",
});

export function CertificationsStep() {
  const certifications = useResumeStore(
    (state) => state.data.certifications || [],
  );
  const setData = useResumeStore((state) => state.setData);

  const update = (id: string, patch: Partial<Certification>) =>
    setData((data) => ({
      ...data,
      certifications: (data.certifications || []).map((cert) =>
        cert.id === id ? { ...cert, ...patch } : cert,
      ),
    }));

  const add = () =>
    setData((data) => ({
      ...data,
      certifications: [...(data.certifications || []), newCertification()],
    }));

  const remove = (id: string) =>
    setData((data) => ({
      ...data,
      certifications: (data.certifications || []).filter(
        (cert) => cert.id !== id,
      ),
    }));

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Professional credentials</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">
          Certifications
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Add professional certifications, licences, or training courses that
          prove your expertise.
        </p>
      </header>

      {certifications.length === 0 && (
        <div className="form-panel py-8 text-center">
          <p className="mb-2 text-sm font-semibold text-[#28485b]">
            This section is optional
          </p>
          <p className="mb-4 text-sm text-neutral-500">
            Leave it empty if you do not have any certifications to list.
          </p>
          <Button onClick={add}>
            <Plus className="size-4" /> Add a certification
          </Button>
        </div>
      )}

      {certifications.map((cert, index) => (
        <div key={cert.id} className="form-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-chip">Certification {index + 1}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-neutral-400 hover:text-destructive"
              onClick={() => remove(cert.id)}
              aria-label={`Remove certification ${index + 1}`}
              title="Remove certification"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="field-label">Certification Name</Label>
              <Input
                value={cert.name}
                onChange={(event) =>
                  update(cert.id, { name: event.target.value })
                }
                placeholder="e.g. AWS Certified Solutions Architect"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="field-label">Issuer</Label>
              <Input
                value={cert.issuer}
                onChange={(event) =>
                  update(cert.id, { issuer: event.target.value })
                }
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="field-label">Date Earned</Label>
              <Input
                value={cert.date}
                onChange={(event) =>
                  update(cert.id, { date: event.target.value })
                }
                placeholder="e.g. 2025-08 or Aug 2025"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="field-label">Credential URL</Label>
              <Input
                value={cert.credentialUrl}
                onChange={(event) =>
                  update(cert.id, { credentialUrl: event.target.value })
                }
                placeholder="e.g. credly.com/certs/..."
              />
            </div>
          </div>
        </div>
      ))}

      {certifications.length > 0 && (
        <Button
          variant="outline"
          onClick={add}
          className="w-full rounded-md border-2 border-dashed border-[#b8c7ce] bg-transparent py-6 text-sm font-medium text-neutral-600 hover:border-brand hover:text-brand"
        >
          <Plus className="size-4" /> Add another certification
        </Button>
      )}
    </div>
  );
}

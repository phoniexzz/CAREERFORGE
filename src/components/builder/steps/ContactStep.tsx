import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/lib/resume-store";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const SUPPORTED_PHOTO_TYPES = new Set(["image/jpeg", "image/png"]);

export function ContactStep() {
  const contact = useResumeStore((s) => s.data.contact);
  const template = useResumeStore((s) => s.template);
  const setData = useResumeStore((s) => s.setData);

  const update = (k: keyof typeof contact, v: string) =>
    setData((d) => ({ ...d, contact: { ...d.contact, [k]: v } }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!SUPPORTED_PHOTO_TYPES.has(file.type)) {
      toast.error("Choose a PNG or JPEG image");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("The profile photo must be smaller than 2 MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      update("picture", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="page-kicker">Profile foundation</p>
        <h1 className="mt-2 text-2xl font-bold text-[#172b3a]">
          Contact details
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Use details you are comfortable sharing with employers and careers
          advisors.
        </p>
      </header>

      <div className="form-panel space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {(template === "academic-photo" || template === "europass") && (
            <div className="sm:col-span-2 border border-dashed border-[#cfe2e0] rounded-lg p-4 bg-[#e7f4f2]/30 space-y-3">
              <Label className="field-label flex items-center justify-between">
                <span>
                  Profile Photo{" "}
                  {template === "academic-photo" && (
                    <span className="text-destructive">*</span>
                  )}
                </span>
                <span className="text-[11px] text-neutral-500 font-normal">
                  {template === "academic-photo"
                    ? "Required for Academic Photo template"
                    : "Optional profile picture"}
                </span>
              </Label>
              <div className="flex items-center gap-4">
                {contact.picture ? (
                  <div className="relative size-20 rounded-md border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={contact.picture}
                      alt="Profile photo"
                      className="size-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      className="absolute top-1 right-1 size-6 rounded-full"
                      onClick={() => update("picture", "")}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="size-20 rounded-md border border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50 text-neutral-400 shrink-0">
                    <Upload className="size-5" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-photo-input"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("profile-photo-input")?.click()
                    }
                  >
                    Select image file
                  </Button>
                  <p className="text-xs text-neutral-500">
                    PNG, JPG or JPEG. Max size 2MB.
                  </p>
                </div>
              </div>
            </div>
          )}
          <Field label="Full Name" required>
            <Input
              value={contact.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Professional Title">
            <Input
              value={contact.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Graduate Software Engineer"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="jane@email.com"
            />
          </Field>
          <Field label="Phone">
            <Input
              value={contact.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </Field>
          <Field label="Location">
            <Input
              value={contact.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="London, UK"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              value={contact.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="linkedin.com/in/jane"
            />
          </Field>
          <Field label="Website">
            <Input
              value={contact.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="janedoe.dev"
            />
          </Field>
          <Field label="GitHub">
            <Input
              value={contact.github}
              onChange={(e) => update("github", e.target.value)}
              placeholder="github.com/jane"
            />
          </Field>
          <Field label="Portfolio">
            <Input
              value={contact.portfolio}
              onChange={(e) => update("portfolio", e.target.value)}
              placeholder="janedoe.portfolio"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="field-label">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

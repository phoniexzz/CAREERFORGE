import { cn } from "@/lib/utils";

type CvSourceCardProps = {
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function CvSourceCard({
  title,
  description,
  selected,
  disabled,
  onClick,
}: CvSourceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-2xl border bg-card p-4 text-left transition-colors",
        selected
          ? "border-2 border-primary bg-primary-soft ring-1 ring-primary/10"
          : "border-border hover:border-primary/40",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-8 items-center justify-center rounded-lg",
          selected ? "bg-primary" : "bg-muted",
        )}
      >
        <div
          className={cn(
            "size-3 rounded-sm border-2",
            selected
              ? "border-primary-foreground"
              : "border-muted-foreground/40",
          )}
        />
      </div>
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
    </button>
  );
}

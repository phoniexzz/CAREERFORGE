import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Pencil,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { type AuditIssue } from "@/lib/mock-ai";
import { cn } from "@/lib/utils";

interface Props {
  issue: AuditIssue;
  onAccept?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  resolved?: boolean;
}

export function IssueCard({
  issue,
  onAccept,
  onReject,
  onEdit,
  resolved,
}: Props) {
  const Icon =
    issue.severity === "warning"
      ? AlertTriangle
      : issue.severity === "success"
        ? CheckCircle2
        : Info;
  const tone =
    issue.severity === "warning"
      ? "border-l-[#b7791f] bg-[#fffdf8] text-[#8a611c]"
      : issue.severity === "success"
        ? "border-l-brand bg-[#f8fbfa] text-brand"
        : "border-l-[#4c7b99] bg-[#f8fafb] text-[#4c7b99]";

  return (
    <article
      className={cn(
        "surface-panel border-l-4 p-5 transition-opacity",
        tone,
        resolved && "opacity-55",
      )}
    >
      <div className="flex gap-4">
        <Icon className="mt-0.5 size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-[#718590]">
              {issue.category === "ATS" ? "Structure" : issue.category}
            </span>
            {resolved && (
              <span className="section-chip">
                <Check className="size-3" /> Addressed
              </span>
            )}
          </div>
          <h3 className="mt-1 text-sm font-bold text-[#17364b]">
            {issue.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#607482]">
            {issue.detail}
          </p>
          {issue.fix && (
            <div className="mt-3 border-l-2 border-[#b9c8cf] pl-3">
              <p className="text-[11px] font-bold uppercase text-[#718590]">
                Suggested change
              </p>
              <p className="mt-1 text-sm text-[#425968]">{issue.fix}</p>
            </div>
          )}
          {issue.severity !== "success" && (onAccept || onReject || onEdit) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onEdit && (
                <Button size="sm" onClick={onEdit}>
                  <Pencil className="size-3.5" /> Edit section
                </Button>
              )}
              {onAccept && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAccept}
                  disabled={resolved}
                >
                  <Check className="size-3.5" /> Mark addressed
                </Button>
              )}
              {onReject && (
                <Button size="sm" variant="ghost" onClick={onReject}>
                  <X className="size-3.5" /> Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

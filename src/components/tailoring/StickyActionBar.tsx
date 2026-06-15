import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { getNextStep, getPrevStep } from "@/lib/tailoring/steps";

type StickyActionBarProps = {
  status?: string;
  primaryLabel?: string;
  secondary?: ReactNode;
  onPrimaryClick?: () => void;
  onBackClick?: () => void;
  primaryHref?: string;
  backHref?: string;
  hideDefaultActions?: boolean;
};

export function StickyActionBar({
  status,
  primaryLabel,
  secondary,
  onPrimaryClick,
  onBackClick,
  primaryHref,
  backHref,
  hideDefaultActions = false,
}: StickyActionBarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const next = getNextStep(pathname);
  const previous = getPrevStep(pathname);

  const renderBackButton = () => {
    if (onBackClick) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="text-xs text-white hover:bg-white/10 hover:text-white"
        >
          Back
        </Button>
      );
    }
    const href = backHref || previous?.to;
    if (href) {
      return (
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-white hover:bg-white/10 hover:text-white"
        >
          <Link to={href}>Back</Link>
        </Button>
      );
    }
    return null;
  };

  const renderNextButton = () => {
    if (onPrimaryClick) {
      return (
        <Button size="sm" onClick={onPrimaryClick} className="text-xs">
          {primaryLabel ?? "Continue"}
        </Button>
      );
    }
    const href = primaryHref || next?.to;
    if (href) {
      return (
        <Button asChild size="sm" className="text-xs">
          <Link to={href}>{primaryLabel ?? `Continue to ${next?.label}`}</Link>
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-3xl -translate-x-1/2 px-4 lg:left-[calc(50%+138px)]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#142c3d] p-3 pl-5 text-white shadow-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="size-1.5 shrink-0 animate-pulse rounded-full bg-[#62b89a]" />
          <p className="truncate text-sm font-medium">
            {status ?? "Tailoring in progress"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hideDefaultActions ? (
            secondary
          ) : (
            <>
              {secondary}
              {renderBackButton()}
              {renderNextButton()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-2 animate-pulse rounded-full bg-primary" />
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-3/4 rounded-2xl" />
      </div>
    </div>
  );
}

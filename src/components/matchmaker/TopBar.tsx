import { Briefcase } from "lucide-react";

export function TopBar() {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border bg-card px-6 py-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Briefcase className="h-4 w-4" />
        </div>
        <span className="text-base font-bold">Job Matchmaker</span>
      </div>
    </header>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  claimAdvisorReview,
  getAdvisorQueue,
  getAdvisorQueueSummary,
  type AdvisorReviewQueueItem,
  type AdvisorReviewSummary,
} from "@/lib/advisor-review-api";
import { cn } from "@/lib/utils";

type QueueView = "available" | "mine" | "completed";

export const Route = createFileRoute("/advisor/")({
  component: AdvisorQueuePage,
  head: () => ({
    meta: [{ title: "Advisor Queue - CareerForge AI" }],
  }),
});

function AdvisorQueuePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<QueueView>("available");
  const [summary, setSummary] = useState<AdvisorReviewSummary>({
    available: 0,
    mine: 0,
    completed: 0,
  });
  const [items, setItems] = useState<AdvisorReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [nextSummary, page] = await Promise.all([
        getAdvisorQueueSummary(),
        getAdvisorQueue(view),
      ]);
      setSummary(nextSummary);
      setItems(page.items);
    } catch (error) {
      toast.error("Advisor queue could not be loaded", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void load();
  }, [load]);

  const openReview = async (item: AdvisorReviewQueueItem) => {
    if (view === "available") {
      setClaiming(item.id);
      try {
        await claimAdvisorReview(item.id);
      } catch (error) {
        toast.error("This review could not be claimed", {
          description:
            error instanceof Error
              ? error.message
              : "Another advisor may have claimed it.",
        });
        await load();
        return;
      } finally {
        setClaiming("");
      }
    }
    await navigate({
      to: "/advisor/reviews/$reviewId",
      params: { reviewId: item.id },
    });
  };

  const tabs: Array<{ id: QueueView; label: string; count: number }> = [
    { id: "available", label: "Available Queue", count: summary.available },
    { id: "mine", label: "My Reviews", count: summary.mine },
    { id: "completed", label: "Completed", count: summary.completed },
  ];

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <div className="mx-auto max-w-[1280px] px-5 py-9 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
            Advisor workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101a2d]">
            Advisor Queue Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            Review submitted student CVs, claim pending requests, and manage
            your active feedback queue.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Pending Requests"
            value={summary.available}
            icon={Clock3}
          />
          <MetricCard
            label="My Claimed Reviews"
            value={summary.mine}
            icon={ClipboardList}
          />
          <MetricCard
            label="Completed Reviews"
            value={summary.completed}
            icon={CheckCircle2}
            success
          />
        </div>

        <div className="mt-8 inline-flex flex-wrap rounded-xl bg-[#e9edf3] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                view === tab.id
                  ? "bg-white text-[#101a2d] shadow-sm"
                  : "text-[#5f6b7a] hover:text-[#101a2d]",
              )}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-[#eef1f5] px-2 py-0.5 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="grid min-h-64 place-items-center rounded-2xl border bg-white">
              <LoaderCircle className="size-6 animate-spin text-[#101a2d]" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
              <ClipboardList className="mx-auto size-8 text-[#98a2b3]" />
              <h2 className="mt-4 font-semibold text-[#101a2d]">
                No reviews in this queue
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                New student submissions will appear here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-5 rounded-2xl border border-[#dfe3e8] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-[#101a2d]">
                      {item.studentName}
                    </h2>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#667085]">
                    <FileText className="size-4" />
                    {item.resumeName}
                  </p>
                  <p className="mt-2 text-xs text-[#7b8493]">
                    Submitted {formatDate(item.submittedAt)}
                  </p>
                  {item.hasStudentMessage && (
                    <p className="mt-2 flex items-center gap-2 text-xs italic text-[#667085]">
                      <MessageSquareText className="size-3.5" />
                      Student message available in the review workspace.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  className="shrink-0 bg-[#101a2d] hover:bg-[#1e2c45]"
                  disabled={claiming === item.id}
                  onClick={() => void openReview(item)}
                >
                  {claiming === item.id && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  {view === "available"
                    ? "Claim & Review"
                    : view === "completed"
                      ? "View Review"
                      : "Continue Review"}
                </Button>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  success = false,
}: {
  label: string;
  value: number;
  icon: typeof Clock3;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dfe3e8] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#667085]">{label}</span>
        <Icon
          className={cn(
            "size-5",
            success ? "text-[#54a86f]" : "text-[#344054]",
          )}
        />
      </div>
      <strong className="mt-3 block text-3xl text-[#101a2d]">{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: AdvisorReviewQueueItem["status"] }) {
  const labels = {
    pending: "Pending",
    in_review: "In review",
    completed: "Completed",
    withdrawn: "Withdrawn",
  };
  return (
    <span className="rounded-full border border-[#e8d3ad] bg-[#fff7e8] px-2.5 py-0.5 text-xs font-semibold text-[#805b1c]">
      {labels[status]}
    </span>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

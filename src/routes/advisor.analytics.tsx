import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  exportAdvisorAnalytics,
  getAdvisorAnalytics,
  type AdvisorAnalyticsOverview,
} from "@/lib/advisor-analytics-api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisor/analytics")({
  component: AdvisorAnalyticsPage,
  head: () => ({
    meta: [{ title: "Pipeline Analytics - CareerForge AI" }],
  }),
});

const WEEKS = 12;

function AdvisorAnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdvisorAnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let interval: number | undefined;

    const load = async (silent: boolean) => {
      if (!silent) setLoading(true);
      try {
        const overview = await getAdvisorAnalytics(WEEKS, controller.signal);
        setData(overview);
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Pipeline analytics could not be loaded.",
        );
      } finally {
        if (!silent && !controller.signal.aborted) setLoading(false);
      }
    };

    void load(false);
    if (live) {
      interval = window.setInterval(() => {
        void load(true);
      }, 60_000);
    }
    return () => {
      controller.abort();
      if (interval) window.clearInterval(interval);
    };
  }, [live, reloadKey]);

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const blob = await exportAdvisorAnalytics(WEEKS);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "careerforge-analytics.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Analytics CSV exported");
    } catch (caught) {
      toast.error("Analytics CSV could not be exported", {
        description: caught instanceof Error ? caught.message : "Try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  if (!user?.canManageAdvisors) return null;

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
              Advisor workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101a2d]">
              Pipeline Analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#667085]">
              Aggregate, anonymized signals from student CV, matching,
              tailoring, application, and advisor-review activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={exporting || !data}
              onClick={() => void downloadCsv()}
            >
              {exporting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Export CSV
            </Button>
            <Button
              type="button"
              variant={live ? "default" : "outline"}
              className={cn(live && "bg-[#101a2d] hover:bg-[#1e2c45]")}
              onClick={() => setLive((value) => !value)}
            >
              <Radio className={cn("size-4", live && "animate-pulse")} />
              {live ? "Live view on" : "Live view"}
            </Button>
          </div>
        </header>

        <div className="mt-5 flex flex-col gap-2 border-y border-[#e1e5ea] py-3 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Small categorical groups are suppressed. No personally identifiable
            data is shown.
          </span>
          {data && (
            <span className="shrink-0">
              Updated {formatTimestamp(data.generatedAt)}
            </span>
          )}
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : error && !data ? (
          <AnalyticsError
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : data ? (
          <AnalyticsContent data={data} />
        ) : null}
      </div>
    </main>
  );
}

function AnalyticsContent({ data }: { data: AdvisorAnalyticsOverview }) {
  const { summary } = data;
  const cards: Array<{
    label: string;
    value: string;
    note: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Active Students",
      value: formatNumber(summary.activeStudents),
      note: "Session activity in the last 30 days",
      icon: Users,
    },
    {
      label: "Base CVs Created",
      value: formatNumber(summary.baseCvs),
      note: "Saved CV profiles",
      icon: FileText,
    },
    {
      label: "Tailored CVs",
      value: formatNumber(summary.tailoredCvs),
      note: "Role-specific projects",
      icon: Sparkles,
    },
    {
      label: "Tracked Applications",
      value: formatNumber(summary.trackedApplications),
      note: "Jobs marked as applied",
      icon: Send,
    },
    {
      label: "Avg. Match Score",
      value:
        summary.averageMatchScore == null
          ? "—"
          : `${formatNumber(summary.averageMatchScore)} / 100`,
      note: "Latest completed match profiles",
      icon: BarChart3,
    },
    {
      label: "Completed Reviews",
      value: formatNumber(summary.completedReviews),
      note: "Advisor feedback submitted",
      icon: ClipboardCheck,
    },
    {
      label: "Advisor Review Queue",
      value: formatNumber(summary.reviewQueue),
      note: "Pending and in-review requests",
      icon: FileCheck2,
    },
    {
      label: "Most Common Gap",
      value: summary.mostCommonGap?.skill ?? "—",
      note: summary.mostCommonGap
        ? `${formatNumber(summary.mostCommonGap.students)} students`
        : `No group met the ${data.minimumGroupSize}-student privacy threshold`,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Panel
          title="Student adoption funnel"
          description="Distinct students progressing through recorded CareerForge activity."
        >
          <div className="space-y-4">
            {data.funnel.map((stage) => (
              <div key={stage.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[#172036]">
                    {stage.label}
                  </span>
                  <span className="text-xs text-[#667085]">
                    {formatNumber(stage.count)} ·{" "}
                    {formatPercent(stage.percentage)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f4]">
                  <div
                    className="h-full rounded-full bg-[#101a2d] transition-[width]"
                    style={{ width: `${Math.min(100, stage.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Match score distribution"
          description="Job matches generated from each CV’s latest completed match profile."
        >
          {hasVisibleScoreData(data) ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.matchScoreDistribution}
                  margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                >
                  <CartesianGrid
                    stroke="#e4e8ed"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fill: "#667085", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#667085", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={<ScoreTooltip />}
                    cursor={{ fill: "#f4f6f8" }}
                  />
                  <Bar dataKey="count" fill="#101a2d" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPanel message="Match scores will appear after completed matching runs meet the privacy threshold." />
          )}
        </Panel>

        <Panel
          title="Outcomes by career stage"
          description="Distinct students, grouped by the career stage saved on their Base CV."
        >
          {data.careerStages.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b text-[10px] font-bold uppercase tracking-wide text-[#667085]">
                    <th className="pb-3">Career stage</th>
                    <th className="pb-3 text-right">Students</th>
                    <th className="pb-3 text-right">Matched</th>
                    <th className="pb-3 text-right">Tailored</th>
                    <th className="pb-3 text-right">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.careerStages.map((row) => (
                    <tr key={row.stage}>
                      <td className="py-3 font-medium text-[#172036]">
                        {row.stage}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(row.students)}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(row.matched)}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(row.tailored)}
                      </td>
                      <td className="py-3 text-right font-semibold text-[#26835f]">
                        {formatNumber(row.applied)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyPanel message="Career-stage groups will appear once at least five students share a stage." />
          )}
        </Panel>

        <Panel
          title="Skill gap analysis"
          description="Skills most often missing from matched CVs, counted once per student."
        >
          <RankedList
            rows={data.skillGaps.map((row) => ({
              label: row.skill,
              value: row.students,
            }))}
            emptyMessage="No skill gap currently meets the privacy threshold."
          />
        </Panel>

        <Panel
          title="Most requested target roles"
          description="Roles students have selected in their current matching preferences."
        >
          <RankedList
            rows={data.targetRoles.map((row) => ({
              label: row.role,
              value: row.students,
            }))}
            emptyMessage="Target-role groups will appear once enough students select the same role."
          />
        </Panel>

        <Panel
          title="Student engagement over time"
          description={`Distinct students with recorded session activity across the last ${data.weeks} weeks.`}
        >
          {hasVisibleEngagement(data) ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.engagement}
                  margin={{ top: 8, right: 10, bottom: 0, left: -18 }}
                >
                  <CartesianGrid
                    stroke="#e4e8ed"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    interval="preserveStartEnd"
                    tick={{ fill: "#667085", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#667085", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<EngagementTooltip />} />
                  <Line
                     type="monotone"
                     dataKey="activeStudents"
                     stroke="#101a2d"
                     strokeWidth={2.5}
                     connectNulls={false}
                     dot={{ r: 3, fill: "#101a2d", strokeWidth: 0 }}
                     activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyPanel message="Weekly engagement will appear when activity meets the privacy threshold." />
          )}
        </Panel>
      </section>

      <p className="mt-6 text-center text-[11px] text-[#7b8493]">
        Analytics are computed from live CareerForge records and contain no
        student names, emails, CV text, or account identifiers.
      </p>
    </>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <article className="min-h-32 rounded-2xl border border-[#dfe3e8] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#667085]">{label}</span>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f1f3f6] text-[#344054]">
          <Icon className="size-4" />
        </span>
      </div>
      <strong className="mt-3 block break-words text-2xl leading-tight text-[#101a2d]">
        {value}
      </strong>
      <span className="mt-2 block text-[11px] leading-4 text-[#7b8493]">
        {note}
      </span>
    </article>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#dfe3e8] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-bold text-[#101a2d]">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-[#667085]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RankedList({
  rows,
  emptyMessage,
}: {
  rows: Array<{ label: string; value: number }>;
  emptyMessage: string;
}) {
  const maximum = useMemo(
    () => Math.max(1, ...rows.map((row) => row.value)),
    [rows],
  );
  if (!rows.length) return <EmptyPanel message={emptyMessage} />;
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-xl border border-[#e1e5ea] px-3 py-3"
        >
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="min-w-0 font-medium text-[#172036]">
              {row.label}
            </span>
            <span className="shrink-0 rounded-full bg-[#f2f4f7] px-2.5 py-1 text-[10px] font-semibold text-[#667085]">
              {formatNumber(row.value)} students
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf0f4]">
            <div
              className="h-full rounded-full bg-[#101a2d]"
              style={{ width: `${(row.value / maximum) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed bg-[#fafbfc] px-5 text-center">
      <div>
        <Activity className="mx-auto size-6 text-[#98a2b3]" />
        <p className="mt-3 max-w-sm text-xs leading-5 text-[#667085]">
          {message}
        </p>
      </div>
    </div>
  );
}

function AnalyticsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-8 grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white px-6 text-center">
      <div>
        <BarChart3 className="mx-auto size-8 text-[#98a2b3]" />
        <h2 className="mt-4 font-bold text-[#101a2d]">
          Analytics could not be loaded
        </h2>
        <p className="mt-2 max-w-md text-sm text-[#667085]">{message}</p>
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl bg-[#e5e8ec]" />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-80 rounded-2xl bg-[#e5e8ec]" />
        ))}
      </div>
    </>
  );
}

function ScoreTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: { count: number | null; suppressed: boolean } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-lg">
      <strong className="text-[#101a2d]">{label}</strong>
      <p className="mt-1 text-[#667085]">
        {row.suppressed
          ? "Suppressed for privacy"
          : `${formatNumber(row.count ?? 0)} matches`}
      </p>
    </div>
  );
}

function EngagementTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { activeStudents: number | null; suppressed: boolean };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-lg">
      <strong className="text-[#101a2d]">Week of {label}</strong>
      <p className="mt-1 text-[#667085]">
        {row.suppressed
          ? "Suppressed for privacy"
          : `${formatNumber(row.activeStudents ?? 0)} active students`}
      </p>
    </div>
  );
}

function hasVisibleScoreData(data: AdvisorAnalyticsOverview) {
  return data.matchScoreDistribution.some((row) => (row.count ?? 0) > 0);
}

function hasVisibleEngagement(data: AdvisorAnalyticsOverview) {
  return data.engagement.some((row) => (row.activeStudents ?? 0) > 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

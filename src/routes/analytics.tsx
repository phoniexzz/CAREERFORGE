import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { AlertCircle, ArrowUpRight, BarChart3, Briefcase, CheckCircle, FileSpreadsheet, Users } from "lucide-react";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const SKILL_GAPS_DATA = [
  { name: "SQL", percentage: 42, count: 220 },
  { name: "Comm. Awareness", percentage: 38, count: 199 },
  { name: "Power BI", percentage: 35, count: 183 },
  { name: "Interview Prep", percentage: 28, count: 146 },
  { name: "Agile / Jira", percentage: 24, count: 125 },
  { name: "Python", percentage: 18, count: 94 },
];

const MATCH_DISTRIBUTION_DATA = [
  { name: "Strong Match", value: 35, color: "#10b981" }, // Emerald 500
  { name: "Good Match", value: 40, color: "#3b82f6" },   // Blue 500
  { name: "Stretch Match", value: 18, color: "#f59e0b" },  // Amber 500
  { name: "Low Match", value: 7, color: "#ef4444" },     // Red 500
];

const MONTHLY_PROGRESS_DATA = [
  { name: "Jan", CVs: 120, Applications: 250 },
  { name: "Feb", CVs: 180, Applications: 340 },
  { name: "Mar", CVs: 240, Applications: 490 },
  { name: "Apr", CVs: 310, Applications: 680 },
  { name: "May", CVs: 420, Applications: 910 },
  { name: "Jun", CVs: 486, Applications: 1204 },
];

function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "advisor") {
      void navigate({ to: "/login" });
    }
  }, [user, navigate]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f7f8] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Title */}
        <div>
          <p className="page-kicker">University Employability Console</p>
          <h1 className="page-title mt-2">Cohort insights & analytics</h1>
          <p className="page-description mt-2 max-w-3xl">
            Anonymized summaries of student preparedness, skill deficits, and engagement patterns across the MSc Business Analytics and Computer Science departments.
          </p>
        </div>

        {/* Highlight Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            title="Total Students"
            value="524"
            change="+12% this term"
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            icon={FileSpreadsheet}
            title="CVs Generated"
            value="486"
            change="92.7% activation"
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            icon={Briefcase}
            title="Applications Tailored"
            value="1,204"
            change="Avg 2.5 per student"
            iconClass="bg-blue-50 text-blue-600"
          />
          <MetricCard
            icon={CheckCircle}
            title="Reviews Completed"
            value="382"
            change="82% workload cleared"
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Main Analytics Graphs Section */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Chart 1: Skill Gaps (Horizontal Bar Chart) */}
          <div className="surface-panel p-5 flex flex-col h-[380px]">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top Cohort Skill Gaps</h3>
              <p className="text-[10px] text-slate-500 font-medium">Percentage of students missing this keyword in target job matches</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SKILL_GAPS_DATA}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" unit="%" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip
                    contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                    formatter={(value) => [`${value}% of cohort`, "Deficiency"]}
                  />
                  <Bar dataKey="percentage" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Match Category Distribution (Pie Chart) */}
          <div className="surface-panel p-5 flex flex-col h-[380px]">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Match Grade Distribution</h3>
              <p className="text-[10px] text-slate-500 font-medium">Job matching grades across student profiles</p>
            </div>
            <div className="flex-1 grid grid-cols-[1fr_130px] items-center min-h-0">
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MATCH_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {MATCH_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      formatter={(value) => [`${value}% of matches`, "Distribution"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5 text-xs pr-4">
                {MATCH_DISTRIBUTION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="size-3 rounded shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 leading-none">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{item.value}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Application & CV Progress over time */}
          <div className="surface-panel p-5 flex flex-col h-[350px] md:col-span-2">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Engagement Timeline</h3>
              <p className="text-[10px] text-slate-500 font-medium">Cumulative CV activations and tailored applications prepared over the academic term</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_PROGRESS_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", marginTop: "5px" }} />
                  <Line type="monotone" dataKey="CVs" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} name="Activated CVs" />
                  <Line type="monotone" dataKey="Applications" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} name="Applications Tailored" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
        
        {/* Advisors Workload Status Info Table */}
        <div className="surface-panel p-5">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Advisor Review Staff Capacity</h3>
              <p className="text-[10px] text-slate-500 font-medium">Clearance and workload status of team advisors</p>
            </div>
            <span className="bg-[#e2e8f0] text-slate-700 font-bold text-[10px] px-2.5 py-0.5 rounded">Active Team</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <StaffCard
              name="Dr. Sarah Jenkins"
              pending={2}
              completed={143}
              rate="98.6%"
              title="Senior Career Lead"
            />
            <StaffCard
              name="Mark Rutherford"
              pending={4}
              completed={121}
              rate="96.8%"
              title="Employer Liaison Officer"
            />
            <StaffCard
              name="Eleanor Vance"
              pending={0}
              completed={118}
              rate="100%"
              title="Graduate Placement Advisor"
            />
          </div>
        </div>
        
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  change,
  iconClass,
}: {
  icon: any;
  title: string;
  value: string;
  change: string;
  iconClass: string;
}) {
  return (
    <div className="surface-panel p-4 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 leading-none mt-1.5">{value}</h3>
        <p className="text-[10px] font-medium text-[#5aab73] flex items-center gap-0.5 mt-1">
          <ArrowUpRight className="size-3 shrink-0" /> {change}
        </p>
      </div>
      <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="size-5" />
      </div>
    </div>
  );
}

function StaffCard({
  name,
  pending,
  completed,
  rate,
  title,
}: {
  name: string;
  pending: number;
  completed: number;
  rate: string;
  title: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-start justify-between">
      <div>
        <h4 className="text-xs font-bold text-slate-800">{name}</h4>
        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{title}</p>
        
        <div className="flex items-center gap-3 mt-3.5 text-[10px] text-slate-500 font-bold">
          <div>
            <span className="text-amber-600">{pending}</span> Pending
          </div>
          <div>
            <span className="text-slate-700">{completed}</span> Completed
          </div>
        </div>
      </div>

      <div className="text-right">
        <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-100">
          {rate} Clear
        </span>
      </div>
    </div>
  );
}

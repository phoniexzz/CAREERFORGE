import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Sparkles,
  Check,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Bookmark,
  Plus,
  TrendingUp,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home - Career Co-Pilot" },
      {
        name: "description",
        content: "Student command centre dashboard. Today's focus, matchmaker stats, and search progress.",
      },
    ],
  }),
  component: StudentHomePage,
});

interface FocusItem {
  id: string;
  company: string;
  role: string;
  action: "Submit" | "Tailor" | "Prep";
  task: string;
  badge?: string;
  status: "pending" | "completed";
}

// ─── Application Journey Board ────────────────────────────────────────────────
const BASE_W = 1672;
const BASE_H = 941;

function pct(value: number, total: number): string {
  if (!total) return "0%";
  const raw = (value / total) * 100;
  return `${Number.isInteger(raw) ? raw : raw.toFixed(1)}%`;
}

const journeyData = {
  applied: 32,
  interviews: 12,
  rejections: 20,
  accepted: 4,
  rejectedAfterInterview: 8,
};

function AnimatedNumber({
  value,
  duration = 1000,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    setDisplayValue(0);
    const timeoutId = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setDisplayValue(Math.floor(progress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, duration, delay]);

  return <>{displayValue}</>;
}

function AnimatedDonut({
  accepted,
  applied,
  delay = 2600,
  duration = 1000,
  size = 120,
}: {
  accepted: number;
  applied: number;
  delay?: number;
  duration?: number;
  size?: number;
}) {
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targetPercent = applied ? Math.round((accepted / applied) * 100) : 0;
    if (mediaQuery.matches) {
      setDisplayPercent(targetPercent);
      return;
    }

    setDisplayPercent(0);
    const timeoutId = setTimeout(() => {
      let start: number | null = null;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setDisplayPercent(Math.floor(progress * targetPercent));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [accepted, applied, delay, duration]);

  const deg = (displayPercent / 100) * 360;
  const donutBg = `conic-gradient(from 0deg, #26835f 0 ${deg}deg, #e2e8f0 ${deg}deg 360deg)`;
  const innerInset = Math.round(size * 0.17);
  const fontSize = Math.round(size * 0.17);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: donutBg,
        boxShadow: "0 4px 12px rgba(38, 131, 95, 0.15)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: innerInset,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "inset 0 0 15px rgba(0, 0, 0, 0.05)",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "grid",
          placeItems: "center",
          fontSize: fontSize,
          fontWeight: 760,
          color: "#172b3a",
        }}
      >
        {displayPercent}%
      </span>
    </div>
  );
}

function ApplicationJourneyBoard() {
  const shellRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const setBoardRef = useCallback((node: HTMLDivElement | null) => {
    boardRef.current = node;
  }, []);

  // ResizeObserver to dynamically handle scaling on mount, resize, and sidebar state transitions
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const observer = new ResizeObserver((entries) => {
      const board = boardRef.current;
      if (!board) return;
      for (const entry of entries) {
        const scale = entry.contentRect.width / BASE_W;
        board.style.transform = `scale(${scale})`;
        board.style.transformOrigin = "top left";
        shell.style.height = `${BASE_H * scale}px`;
      }
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [animationKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const d = journeyData;
  const acceptanceRate = pct(d.accepted, d.applied);

  /* ── shared style tokens ── */
  const nodeBase: React.CSSProperties = {
    position: "absolute",
    zIndex: 3,
    border: "1px solid #d9e2e7",
    borderRadius: 18,
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 4px 20px rgba(20, 44, 61, 0.05)",
    backdropFilter: "blur(18px)",
    overflow: "hidden",
  };

  return (
    <div className="surface-panel p-6 sm:p-8 space-y-4 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#142c3d]">Application Journey</h2>
          <p className="text-xs text-[#607482] mt-0.5">A clear view of your job search path</p>
        </div>
      </div>

      {/* Responsive shell — grows to fill available width */}
      <div ref={shellRef} style={{ width: "100%", position: "relative", overflow: "hidden" }}>
        {/* Fixed-size board scaled via CSS transform */}
        <div
          ref={setBoardRef}
          key={animationKey}
          className="is-initial-load is-replaying-flows"
          style={{
            width: BASE_W,
            height: BASE_H,
            position: "relative",
            isolation: "isolate",
            overflow: "hidden",
            fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
            color: "#172b3a",
            background: [
              "radial-gradient(circle at 82% 19%, rgba(34, 197, 94, 0.05), transparent 25%)",
              "radial-gradient(circle at 39% 52%, rgba(239, 68, 68, 0.04), transparent 25%)",
              "radial-gradient(circle at 35% 17%, rgba(59, 130, 246, 0.05), transparent 30%)",
              "radial-gradient(circle at 48% 104%, rgba(37, 99, 235, 0.06), transparent 45%)",
              "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            ].join(", "),
          }}
          aria-label="Application Journey Sankey board"
          role="region"
        >
          {/* Grid overlay */}
          <div style={{
            position: "absolute", inset: -80, zIndex: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(37, 99, 235, 0.02) 1px,transparent 1px), linear-gradient(90deg,rgba(37, 99, 235, 0.02) 1px,transparent 1px)",
            backgroundSize: "48px 48px", opacity: 0.75,
            maskImage: "radial-gradient(circle at 50% 42%, black 0 42%, transparent 76%)",
          }} />

          {/* Vignette overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 50%, transparent 0 60%, rgba(241, 245, 249, 0.2) 100%)",
          }} />

          {/* Title */}
          <div className="journey-title" style={{ position: "absolute", zIndex: 4, left: 0, right: 0, top: 38, textAlign: "center" }}>
            <h1 style={{ margin: 0, fontSize: 67, lineHeight: 0.98, letterSpacing: -2, fontWeight: 850, color: "#172b3a" }}>
              Application Journey
            </h1>
            <p style={{ margin: "14px 0 0", color: "#607482", fontSize: 27, letterSpacing: 0.2, fontWeight: 500 }}>
              A clear view of my job search path
            </p>
          </div>

          {/* CSS Animation style block for staged load */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes drawPath {
              from { stroke-dashoffset: 1000; }
              to { stroke-dashoffset: 0; }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(24px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes fadeInDown {
              from {
                opacity: 0;
                transform: translateY(-24px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .flow-band {
              stroke-dashoffset: 0;
              transition: stroke-width 0.3s, opacity 0.3s;
            }
            .flow-band:hover {
              stroke-width: 80px !important;
              opacity: 1 !important;
            }

            .is-replaying-flows .flow-band-1 {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
            }
            .is-replaying-flows .flow-band-4 {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
            }
            .is-replaying-flows .flow-band-2 {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards;
            }
            .is-replaying-flows .flow-band-3 {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.7s forwards;
            }

            .is-initial-load .journey-title {
              opacity: 0;
              animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0s both;
            }
            .is-initial-load .journey-card-1 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
            }
            .is-initial-load .journey-card-2 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both;
            }
            .is-initial-load .journey-card-3 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s both;
            }
            .is-initial-load .journey-card-4 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.7s both;
            }
            .is-initial-load .journey-card-5 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.0s both;
            }
            .is-initial-load .journey-card-6 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.3s both;
            }
            .is-initial-load .journey-card-7 {
              opacity: 0;
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2.6s both;
            }

            @media (prefers-reduced-motion: reduce) {
              .is-replaying-flows .flow-band-1,
              .is-replaying-flows .flow-band-2,
              .is-replaying-flows .flow-band-3,
              .is-replaying-flows .flow-band-4 {
                stroke-dashoffset: 0 !important;
                animation: none !important;
              }
              .is-initial-load .journey-title,
              .is-initial-load .journey-card-1,
              .is-initial-load .journey-card-2,
              .is-initial-load .journey-card-3,
              .is-initial-load .journey-card-4,
              .is-initial-load .journey-card-5,
              .is-initial-load .journey-card-6,
              .is-initial-load .journey-card-7 {
                opacity: 1 !important;
                transform: none !important;
                animation: none !important;
              }
            }
          `}} />

          {/* SVG Flows - Staged Draw-in */}
          <svg className="flows" style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }} width="1672" height="941" viewBox="0 0 1672 941" aria-hidden="true">
            <defs>
              <filter id="flowGlow" x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="blueFlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#93c5fd" stopOpacity={0.4} />
                <stop offset="1" stopColor="#3f51b5" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="greenFlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#3f51b5" stopOpacity={0.4} />
                <stop offset="0.5" stopColor="#60a5fa" stopOpacity={0.4} />
                <stop offset="1" stopColor="#26835f" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="purpleRedFlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#3f51b5" stopOpacity={0.4} />
                <stop offset="0.5" stopColor="#fca5a5" stopOpacity={0.4} />
                <stop offset="1" stopColor="#ef4444" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="redFlow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fca5a5" stopOpacity={0.4} />
                <stop offset="1" stopColor="#ef4444" stopOpacity={0.5} />
              </linearGradient>
            </defs>

            {/* Sankey-like bands. These sit under the cards, so the cards visually cut the paths. */}
            <g filter="url(#flowGlow)" fill="none" strokeLinecap="round">
              <path className="flow-band flow-band-1" id="flowAppliedToInterviews" d="M 307 333 C 394 336 437 257 548 255" stroke="url(#blueFlow)" strokeWidth={64} opacity={0.95} />
              <path className="flow-band flow-band-2" id="flowInterviewsToAccepted" d="M 790 264 C 970 271 1064 235 1315 224" stroke="url(#greenFlow)" strokeWidth={52} opacity={0.88} />
              <path className="flow-band flow-band-3" id="flowInterviewsToRejected" d="M 791 315 C 958 319 1056 385 1315 391" stroke="url(#purpleRedFlow)" strokeWidth={76} opacity={0.82} />
              <path className="flow-band flow-band-4" id="flowAppliedToRejections" d="M 307 459 C 412 462 461 541 548 546" stroke="url(#redFlow)" strokeWidth={94} opacity={0.86} />
            </g>
          </svg>

          {/* ── MAIN CARD: Jobs Applied ── */}
          <section className="journey-card journey-card-1" style={{ ...nodeBase, left: 78, top: 269, width: 240, height: 283, padding: "42px 28px 30px", borderColor: "rgba(63, 81, 181, 0.2)" }} aria-label="Jobs applied">
            <div style={{ width: 68, height: 68, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 34% 28%, #3f51b5, #24358b 68%)", boxShadow: "0 4px 12px rgba(63,81,181,0.2)", marginBottom: 33 }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M7 3.8h7.2L18 7.6v12.6H7V3.8Z" stroke="white" strokeWidth="1.55" />
                <path d="M14.2 3.8v4h3.9" stroke="white" strokeWidth="1.55" />
                <path d="M9.4 14.6h5.2M9.4 17.1h6.7" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="11.4" cy="10.3" r="1.5" stroke="white" strokeWidth="1.25" />
                <path d="M8.9 13.1c.55-1 1.35-1.5 2.5-1.5s1.95.5 2.5 1.5" stroke="white" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.1, fontWeight: 650, color: "#172b3a", letterSpacing: -0.3 }}>Jobs Applied</p>
            <div style={{ marginTop: 10, fontSize: 54, lineHeight: 1, fontWeight: 850, color: "#172b3a", letterSpacing: -1.8 }}>
              <AnimatedNumber value={d.applied} delay={800} />
            </div>
            <div style={{ marginTop: 14, fontSize: 17, color: "#607482", fontWeight: 500 }}>100% of applications</div>
          </section>

          {/* ── MID CARD: Interviews ── */}
          <section className="journey-card journey-card-2" style={{ ...nodeBase, left: 548, top: 214, width: 249, height: 145, padding: "28px 26px", textAlign: "center", borderColor: "rgba(63, 81, 181, 0.2)" }} aria-label="Interviews">
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.1, fontWeight: 650, color: "#172b3a" }}>Interviews</p>
            <div style={{ marginTop: 7, fontSize: 43, lineHeight: 1, fontWeight: 850, color: "#3f51b5", letterSpacing: -1.4 }}>
              <AnimatedNumber value={d.interviews} delay={1100} />
            </div>
          </section>

          {/* ── RED CARD: Rejections ── */}
          <section className="journey-card journey-card-3" style={{
            ...nodeBase,
            left: 547, top: 452, width: 241, height: 185,
            padding: "48px 53px",
            borderColor: "rgba(194, 65, 59, 0.2)",
            background: "rgba(254, 242, 242, 0.95)",
            boxShadow: "0 4px 20px rgba(194, 65, 59, 0.03)",
          }} aria-label="Rejections">
            <p style={{ margin: 0, fontSize: 24, lineHeight: 1.1, fontWeight: 650, color: "#172b3a" }}>Rejections</p>
            <div style={{ marginTop: 10, fontSize: 50, lineHeight: 1, fontWeight: 850, color: "#c2413b", letterSpacing: -1.8 }}>
              <AnimatedNumber value={d.rejections} delay={1400} />
            </div>
          </section>

          {/* ── RIGHT CARD: Accepted ── */}
          <section className="journey-card journey-card-4" style={{
            ...nodeBase,
            left: 1315, top: 161, width: 281, height: 129,
            borderColor: "rgba(38, 131, 95, 0.2)",
            background: "rgba(240, 253, 250, 0.95)",
            boxShadow: "0 4px 20px rgba(38, 131, 95, 0.03)",
            display: "grid", gridTemplateColumns: "64px 1fr", alignItems: "center",
            columnGap: 18, padding: "18px 26px 18px 23px",
          }} aria-label="Accepted">
            <div style={{ width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid #26835f", boxShadow: "0 0 12px rgba(38,131,95,0.2)", color: "#26835f" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6.5 12.4 10 15.9 17.8 7.7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.5 10.2a8 8 0 1 1-3.1-4.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, lineHeight: 1.04, fontWeight: 650, color: "#172b3a", letterSpacing: -0.25 }}>Accepted</p>
              <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 850, color: "#26835f", letterSpacing: -1, marginTop: 6 }}>
                <AnimatedNumber value={d.accepted} delay={1700} />
              </div>
            </div>
          </section>

          {/* ── RIGHT CARD: Rejected after Interviews ── */}
          <section className="journey-card journey-card-5" style={{
            ...nodeBase,
            left: 1315, top: 324, width: 281, height: 150,
            borderColor: "rgba(194, 65, 59, 0.2)",
            background: "rgba(254, 242, 242, 0.95)",
            boxShadow: "0 4px 20px rgba(194, 65, 59, 0.03)",
            display: "grid", gridTemplateColumns: "64px 1fr", alignItems: "center",
            columnGap: 18, padding: "18px 26px 18px 23px",
          }} aria-label="Rejected after interviews">
            <div style={{ width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", border: "2px solid #c2413b", boxShadow: "0 0 12px rgba(194,65,59,0.2)", color: "#c2413b" }}>
              <svg width="31" height="31" viewBox="0 0 24 24" fill="none">
                <path d="M7.3 7.3 16.7 16.7M16.7 7.3 7.3 16.7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, lineHeight: 1.04, fontWeight: 650, color: "#172b3a", letterSpacing: -0.25 }}>Rejected after<br />Interviews</p>
              <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 850, color: "#c2413b", letterSpacing: -1, marginTop: 6 }}>
                <AnimatedNumber value={d.rejectedAfterInterview} delay={2000} />
              </div>
            </div>
          </section>

          {/* ── BOTTOM: What to improve next ── */}
          <section className="journey-card journey-card-6" style={{
            position: "absolute", zIndex: 3, top: 689, left: 72, width: 1094, height: 195,
            border: "1px solid #d9e2e7", borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)", padding: "20px 32px",
          }} aria-label="What to improve next">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: 14, margin: 0, color: "#3f51b5", fontSize: 22, lineHeight: 1, fontWeight: 650, letterSpacing: -0.15 }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "#3f51b5" }}>
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                What to improve next
              </h2>
              <span style={{
                color: "#26835f",
                backgroundColor: "#eaf6f0",
                border: "1.5px solid #d4ede1",
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1,
              }}>
                Strong momentum
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 16, alignItems: "stretch" }}>
              {/* Box 1: Interview Conversion */}
              <div style={{
                background: "#f8fafb",
                border: "1px solid #e2e8eb",
                borderRadius: 12,
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <span style={{ display: "block", color: "#607482", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                  Interview Conversion
                </span>
                <strong style={{ display: "block", fontSize: 30, lineHeight: 1.1, fontWeight: 800, color: "#26835f" }}>
                  {pct(d.interviews, d.applied)}
                </strong>
              </div>

              {/* Box 2: Interview Win Rate */}
              <div style={{
                background: "#f8fafb",
                border: "1px solid #e2e8eb",
                borderRadius: 12,
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <span style={{ display: "block", color: "#607482", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                  Interview Win Rate
                </span>
                <strong style={{ display: "block", fontSize: 30, lineHeight: 1.1, fontWeight: 800, color: "#b7791f" }}>
                  {pct(d.accepted, d.interviews)}
                </strong>
              </div>

              {/* Box 3: Suggested Focus */}
              <div style={{
                background: "#f8fafb",
                border: "1px solid #e2e8eb",
                borderRadius: 12,
                padding: "12px 18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                <span style={{ display: "block", color: "#607482", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                  Suggested Focus
                </span>
                <strong style={{ display: "block", fontSize: 20, lineHeight: 1.1, fontWeight: 800, color: "#3f51b5", marginBottom: 4 }}>
                  Scale what works
                </strong>
                <p style={{ margin: 0, color: "#607482", fontSize: 13, lineHeight: 1.3, fontWeight: 500 }}>
                  Your overall acceptance rate is healthy. Reuse the strongest CV patterns and prioritize similar roles.
                </p>
              </div>
            </div>
          </section>

          {/* ── BOTTOM: Acceptance Rate ── */}
          <section className="journey-card journey-card-7" style={{
            position: "absolute", zIndex: 3, top: 689, left: 1184, width: 419, height: 195,
            border: "1px solid #d9e2e7", borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)", padding: "26px 30px",
          }} aria-label="Acceptance rate">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", alignItems: "center", gap: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, color: "#607482", fontSize: 19, fontWeight: 560 }}>
                  Acceptance Rate
                  <span style={{ width: 18, height: 18, display: "inline-grid", placeItems: "center", border: "1px solid #94a3b8", borderRadius: "50%", color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>i</span>
                </div>
                <div style={{ fontSize: 42, lineHeight: 1, fontWeight: 850, letterSpacing: -1.4, color: "#172b3a" }}>
                  <AnimatedNumber value={Math.round((d.accepted / d.applied) * 100)} delay={2600} />%
                </div>
                <div style={{ marginTop: 8, fontSize: 18, color: "#607482", fontWeight: 520 }}>
                  <AnimatedNumber value={d.accepted} delay={2600} /> out of <AnimatedNumber value={d.applied} delay={2600} />
                </div>
              </div>
              {/* Donut */}
              <AnimatedDonut accepted={d.accepted} applied={d.applied} delay={2600} size={120} />
            </div>
          </section>

          {/* Screen-reader summary */}
          <div className="sr-only">
            <h3>Application Journey Summary</h3>
            <p>You have applied to {d.applied} jobs. You received {d.interviews} interviews, {d.rejections} rejections, {d.accepted} acceptances ({acceptanceRate}), and {d.rejectedAfterInterview} post-interview rejections.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student Home Page ─────────────────────────────────────────────────────────
function StudentHomePage() {
  const [isPrepOpen, setIsPrepOpen] = useState(false);
  const [focusItems, setFocusItems] = useState<FocusItem[]>([
    {
      id: "jpmc",
      company: "JPMorganChase",
      role: "Market Risk Analyst",
      action: "Submit",
      task: "Submit tailored application package",
      badge: "HIGH MATCH • 86%",
      status: "pending",
    },
    {
      id: "wise",
      company: "Wise",
      role: "Junior Frontend Developer",
      action: "Submit",
      task: "Submit tailored application package",
      badge: "READY TO GO",
      status: "pending",
    },
    {
      id: "bbc",
      company: "BBC",
      role: "UX Research Assistant",
      action: "Tailor",
      task: "Tailor CV to close 2 skill gaps",
      badge: "RECOMMENDED • 89%",
      status: "pending",
    },
    {
      id: "schroders",
      company: "Schroders",
      role: "ESG Analyst",
      action: "Prep",
      task: "Prep for scheduled interview on Wednesday",
      badge: "INTERVIEW SCHEDULED",
      status: "pending",
    },
  ]);

  const toggleStatus = (id: string) => {
    setFocusItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "pending" ? "completed" : "pending";
          if (nextStatus === "completed") {
            toast.success(`Marked application for ${item.company} as submitted!`);
          }
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const completedCount = focusItems.filter((i) => i.status === "completed").length;

  return (
    <main className="min-h-screen bg-[#f4f7f8] pb-12">
      <div className="mx-auto max-w-[1460px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10 space-y-8">
        
        {/* TITLE BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#172b3a] flex items-center gap-2">
              You're doing well.
              <Sparkles className="size-6 text-purple-400 shrink-0" />
            </h1>
            <p className="text-sm text-[#607482]">
              Keep up the momentum—great opportunities are ahead!
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button asChild size="lg" className="bg-[#26835f] hover:bg-[#1e6d4e] text-white flex items-center gap-2 font-semibold text-sm h-10 px-4 rounded-lg shadow-sm border-0 transition-all cursor-pointer">
              <Link
                to="/matchmaker"
                search={{ selected: undefined }}
              >
                <Briefcase className="size-4" />
                Match Jobs
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-[#111c2e] hover:bg-[#1a2b44] text-white flex items-center gap-2 font-semibold text-sm h-10 px-4 rounded-lg shadow-sm border-0 transition-all cursor-pointer">
              <Link to="/builder">
                Edit CV
              </Link>
            </Button>
          </div>
        </div>

        {/* STATISTICS CARDS GRID */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Base CV Strength */}
          <div className="relative overflow-hidden rounded-2xl border border-[#d8ebe7] bg-gradient-to-br from-[#f4fbf9] to-[#ffffff] p-5 shadow-sm">
            <div className="absolute right-2 bottom-0 translate-y-3 translate-x-3 text-emerald-500/5 select-none pointer-events-none">
              <ShieldCheck className="size-24" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#607482] uppercase tracking-wider">Base CV Strength</span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#e8f5e9] text-[#26835f] border border-[#c8e6c9]">
                <ShieldCheck className="size-4" />
              </div>
            </div>
            <p className="relative z-10 mt-3 text-3xl font-extrabold tracking-tight text-[#172b3a]">100%</p>
            <p className="relative z-10 mt-1 text-[13px] text-[#26835f] font-semibold">Verified & ready</p>
          </div>

          {/* Card 2: Matched Roles */}
          <div className="relative overflow-hidden rounded-2xl border border-[#e6e2f7] bg-gradient-to-br from-[#f8f7fd] to-[#ffffff] p-5 shadow-sm">
            <div className="absolute right-2 bottom-0 translate-y-3 translate-x-3 text-indigo-500/5 select-none pointer-events-none">
              <Briefcase className="size-24" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#607482] uppercase tracking-wider">Matched Roles</span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#e8eaf6] text-[#3f51b5] border border-[#c5cae9]">
                <Briefcase className="size-4" />
              </div>
            </div>
            <p className="relative z-10 mt-3 text-3xl font-extrabold tracking-tight text-[#172b3a]">8 Roles</p>
            <p className="relative z-10 mt-1 text-[13px] text-[#3f51b5] font-semibold">Suitable for you</p>
          </div>

          {/* Card 3: Tailored Packages */}
          <div className="relative overflow-hidden rounded-2xl border border-[#f5ecd8] bg-gradient-to-br from-[#fdfbf7] to-[#ffffff] p-5 shadow-sm">
            <div className="absolute right-2 bottom-0 translate-y-3 translate-x-3 text-amber-500/5 select-none pointer-events-none">
              <Sparkles className="size-24" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#607482] uppercase tracking-wider">Tailored Packages</span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]">
                <Sparkles className="size-4" />
              </div>
            </div>
            <p className="relative z-10 mt-3 text-3xl font-extrabold tracking-tight text-[#172b3a]">3 Created</p>
            <p className="relative z-10 mt-1 text-[13px] text-[#e65100] font-semibold">Ready to submit</p>
          </div>

          {/* Card 4: Interviews */}
          <div className="relative overflow-hidden rounded-2xl border border-[#d9ebf8] bg-gradient-to-br from-[#f5fafe] to-[#ffffff] p-5 shadow-sm">
            <div className="absolute right-2 bottom-0 translate-y-3 translate-x-3 text-sky-500/5 select-none pointer-events-none">
              <Calendar className="size-24" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#607482] uppercase tracking-wider">Interviews</span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#e1f5fe] text-[#0288d1] border border-[#b3e5fc]">
                <Calendar className="size-4" />
              </div>
            </div>
            <p className="relative z-10 mt-3 text-3xl font-extrabold tracking-tight text-[#172b3a]">1 Scheduled</p>
            <p className="relative z-10 mt-1 text-[13px] text-[#0288d1] font-semibold">Schroders ESG</p>
          </div>

        </div>

        {/* TWO COLUMN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-[7fr_4fr]">
          
          {/* LEFT COLUMN: TODAY'S FOCUS */}
          <div className="space-y-6">
            
            <div className="surface-panel p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-[#e2e8eb] pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#142c3d]">Today's Focus</h2>
                    <p className="text-xs text-[#607482] mt-0.5">Action checklist for your active roles</p>
                  </div>
                </div>
                {completedCount > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    {completedCount} of {focusItems.length} completed
                  </span>
                )}
              </div>

              <div className="divide-y divide-[#e2e8eb]">
                {focusItems.map((item) => {
                  const isCompleted = item.status === "completed";
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 transition-colors",
                        isCompleted && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => {
                            if (item.action === "Submit") {
                              toggleStatus(item.id);
                            }
                          }}
                          disabled={item.action !== "Submit"}
                          className={cn(
                            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isCompleted
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : item.action === "Submit"
                              ? "border-[#cbd7dd] bg-white hover:border-[#147d78] cursor-pointer"
                              : "border-[#cbd7dd] bg-slate-50 cursor-not-allowed"
                          )}
                          aria-label={isCompleted ? "Mark pending" : "Mark completed"}
                        >
                          {isCompleted && (
                            <Check className="size-3" strokeWidth={3} />
                          )}
                        </button>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className={cn(
                              "font-bold text-[#142c3d] text-[15px]",
                              isCompleted && "line-through text-[#8798a3]"
                            )}>
                              {item.company}
                            </span>
                            <span className="text-[#cbd7dd] font-bold text-xs">·</span>
                            <span className={cn(
                              "text-[#425968] font-semibold text-sm",
                              isCompleted && "text-[#8798a3]"
                            )}>
                              {item.role}
                            </span>
                            {item.badge && (
                              <span className={cn(
                                "rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                                item.id === "jpmc" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                                item.id === "wise" && "bg-[#edf4f8] text-[#1c6496] border border-[#d3e3ed]",
                                item.id === "bbc" && "bg-amber-50 text-amber-700 border border-[#f5ecd8]",
                                item.id === "schroders" && "bg-sky-50 text-sky-700 border border-sky-100",
                                isCompleted && "bg-gray-100 text-gray-500 border-gray-200"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "mt-1 text-xs text-[#607482]",
                            isCompleted && "text-[#8798a3]"
                          )}>
                            {item.task}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-end">
                        {item.action === "Submit" && (
                          <Button
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleStatus(item.id)}
                            className={cn(
                              "h-9 px-4 font-semibold text-xs transition-all rounded-lg cursor-pointer",
                              isCompleted
                                ? "border-[#cbd7dd] hover:bg-gray-50 text-[#425968]"
                                : "bg-[#26835f] hover:bg-[#1e6d4e] text-white border-0"
                            )}
                          >
                            {isCompleted ? "Undo" : "Mark submitted"}
                          </Button>
                        )}

                        {item.action === "Tailor" && (
                          <Button
                            asChild
                            size="sm"
                            className="h-9 px-4 font-semibold text-xs bg-[#d97706] hover:bg-[#b45309] text-white border-0 shadow-sm transition-all rounded-lg cursor-pointer"
                          >
                            <Link to="/tailor">
                              Tailor CV
                            </Link>
                          </Button>
                        )}

                        {item.action === "Prep" && (
                          <Button
                            size="sm"
                            onClick={() => setIsPrepOpen(true)}
                            className="h-9 px-4 font-semibold text-xs bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-0 shadow-sm transition-all rounded-lg cursor-pointer"
                          >
                            Prep tips
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: RECENT ACTIVITY */}
          <div className="space-y-6">
            
            <div className="surface-panel p-6 sm:p-8 space-y-5 flex flex-col h-full">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#142c3d]">Recent Activity</h2>
                  <p className="text-xs text-[#607482] mt-0.5">Timeline of your career preparation steps</p>
                </div>
              </div>

              <div className="relative border-l border-[#e2e8eb] pl-5.5 space-y-6 text-sm py-1 flex-1">
                <div className="relative">
                  <div className="absolute -left-[29px] top-0.5 flex size-5.5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <Check className="size-3" />
                  </div>
                  <div>
                    <span className="font-bold text-[#172b3a]">Tailored CV generated</span>
                    <span className="text-[#607482] ml-2 text-xs">Today</span>
                    <p className="text-xs text-[#607482] mt-0.5">Customized for JPMorganChase Market Risk role</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[29px] top-0.5 flex size-5.5 items-center justify-center rounded-full bg-[#edf4f8] border border-[#d3e3ed] text-[#1c6496]">
                    <Bookmark className="size-3" />
                  </div>
                  <div>
                    <span className="font-bold text-[#172b3a]">Saved new role</span>
                    <span className="text-[#607482] ml-2 text-xs">Yesterday</span>
                    <p className="text-xs text-[#607482] mt-0.5">Wise — Junior Frontend Developer saved to list</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[29px] top-0.5 flex size-5.5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
                    <ShieldCheck className="size-3" />
                  </div>
                  <div>
                    <span className="font-bold text-[#172b3a]">Base CV verified</span>
                    <span className="text-[#607482] ml-2 text-xs">3 days ago</span>
                    <p className="text-xs text-[#607482] mt-0.5">AI profile reviewer confirmed 100% complete</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[29px] top-0.5 flex size-5.5 items-center justify-center rounded-full bg-purple-50 border border-purple-200 text-purple-600">
                    <Plus className="size-3" />
                  </div>
                  <div>
                    <span className="font-bold text-[#172b3a]">Education synced</span>
                    <span className="text-[#607482] ml-2 text-xs">4 days ago</span>
                    <p className="text-xs text-[#607482] mt-0.5">Imported initial coursework from LinkedIn profile</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e2e8eb] pt-4 mt-auto">
                <Link to="/" className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8] flex items-center justify-between group">
                  <span>View all activity</span>
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* APPLICATION JOURNEY BOARD */}
        <ApplicationJourneyBoard />

      </div>

      {/* PREP DIALOG (SCHRODERS ESG ANALYST) */}
      <Dialog open={isPrepOpen} onOpenChange={setIsPrepOpen}>
        <DialogContent className="max-w-md bg-white border border-[#d9e2e7] rounded-xl shadow-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-[#142c3d] flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-sky-500 animate-pulse"></span>
              Interview Prep: ESG Analyst
            </DialogTitle>
            <DialogDescription className="text-xs text-[#607482]">
              Schroders • Bournemouth, UK • Hybrid
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4 text-sm leading-relaxed text-[#425968]">
            <div className="rounded-lg bg-sky-50 border border-sky-100 p-4.5 text-xs text-sky-800 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Calendar className="size-4 shrink-0" />
                Scheduled for Wednesday
              </span>
              <p>Prepare for a 45-minute technical and competency video interview.</p>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-xs uppercase tracking-wider text-[#172b3a]">Recommended Prep Checklist:</p>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Review <strong>Schroders' ESG Integration frameworks</strong> and their recent sustainability reports.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Prepare stories demonstrating quantitative analysis using <strong>Python & SQL</strong> (from your Academic Projects).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Understand key ESG regulations, especially the <strong>EU Taxonomy</strong> and SFDR compliance policies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Be ready for competency questions about managing tight reporting schedules and controls auditing.</span>
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="border-t border-[#e2e8eb] pt-4 mt-2">
            <Button
              onClick={() => setIsPrepOpen(false)}
              className="bg-[#147d78] hover:bg-[#0f625e] text-white font-semibold text-xs h-9 px-4 rounded-md shadow-sm"
            >
              Got it, thanks!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

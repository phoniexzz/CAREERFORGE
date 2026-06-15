import { AlertTriangle, LoaderCircle, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { useResumeStore } from "@/lib/resume-store";
import { DEMO_MODE } from "@/lib/api-client";

export function PdfResumePreview({
  pdf,
  pdfUrl,
  loading,
  error,
  className = "",
  bgClass = "bg-[#dfe5e8]",
  paddingClass = "p-5",
}: {
  pdf: Blob | null;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
  className?: string;
  bgClass?: string;
  paddingClass?: string;
}) {
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);

  useEffect(() => {
    if (DEMO_MODE) return; // Skip PDF loading in demo mode

    if (!pdf) {
      setPages([]);
      return;
    }
    setPages([]);
    let cancelled = false;
    let documentProxy: PDFDocumentProxy | null = null;
    void (async () => {
      try {
        setViewerError(null);
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        const task = pdfjs.getDocument({ data: await pdf.arrayBuffer() });
        documentProxy = await task.promise;
        const loaded = await Promise.all(
          Array.from({ length: documentProxy.numPages }, (_, index) =>
            documentProxy!.getPage(index + 1),
          ),
        );
        if (!cancelled) setPages(loaded);
      } catch (caught) {
        if (!cancelled) {
          setViewerError(
            caught instanceof Error
              ? caught.message
              : "PDF.js could not display this document.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
      void documentProxy?.destroy();
    };
  }, [pdf]);

  // If Demo Mode is active, render our dynamic, interactive HTML preview!
  if (DEMO_MODE) {
    return (
      <div className={`relative overflow-y-auto ${bgClass} ${paddingClass} ${className} flex justify-center`}>
        {loading && (
          <div className="absolute right-3 top-3 z-10 rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-[#425968] shadow flex items-center gap-1.5 animate-pulse">
            <LoaderCircle className="size-3 animate-spin text-brand" />
            Syncing preview...
          </div>
        )}
        <div className="w-full max-w-[800px]">
          <HtmlResumePreview data={data} template={template} />
        </div>
      </div>
    );
  }

  const visibleError = error || viewerError;
  if (visibleError) {
    return (
      <div
        className={`grid min-h-[420px] place-items-center bg-white p-8 text-center ${className}`}
      >
        <div className="max-w-sm">
          <AlertTriangle className="mx-auto size-6 text-amber-600" />
          <p className="mt-3 text-sm font-bold text-[#17364b]">
            Preview unavailable
          </p>
          <p className="mt-1 text-xs leading-5 text-[#607482]">
            {visibleError}
          </p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-semibold text-brand underline"
            >
              Open the compiled PDF
            </a>
          )}
        </div>
      </div>
    );
  }
  if (!pdf || pages.length === 0) {
    return (
      <div
        className={`grid min-h-[420px] place-items-center bg-white ${className}`}
      >
        <div className="text-center">
          <LoaderCircle className="mx-auto size-5 animate-spin text-brand" />
          <p className="mt-2 text-xs text-[#607482]">Loading</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`relative overflow-y-auto overflow-x-hidden ${bgClass} ${paddingClass} ${className}`}
    >
      {loading && (
        <div className="sticky right-3 top-3 z-10 ml-auto w-fit rounded-md bg-white/95 px-3 py-2 text-xs font-semibold text-[#425968] shadow">
          Updating preview...
        </div>
      )}
      <div className="mx-auto flex max-w-[840px] flex-col gap-5 w-full items-center">
        {pages.map((page) => (
          <PdfPage key={page.pageNumber} page={page} />
        ))}
      </div>
    </div>
  );
}

function PdfPage({ page }: { page: PDFPageProxy }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viewport = page.getViewport({ scale: 1.5 });
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = page.render({ canvas, canvasContext: context, viewport });
    void task.promise.catch(() => undefined);
    return () => task.cancel();
  }, [page]);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full bg-white shadow-[0_18px_45px_rgba(23,54,75,0.16)] ring-1 ring-black/5"
      aria-label={`Resume page ${page.pageNumber}`}
    />
  );
}

// Beautiful Dynamic HTML Resume Renderer for Demo Mode
function HtmlResumePreview({ data, template }: { data: any; template: string }) {
  const { contact, summary, experiences = [], education = [], skillGroups = [], projects = [], achievements = [], certifications = [] } = data;

  const isTwoColumn = template === "technical-analyst";
  const isSerif = template === "academic-photo" || template === "europass";
  
  // Custom template styling options
  let primaryColor = "text-slate-900 border-slate-300";
  let sectionHeaderClass = "text-xs font-bold uppercase tracking-wider text-slate-800 border-b pb-1 mb-2";

  if (template === "modern-professional") {
    primaryColor = "text-sky-950 border-sky-200";
    sectionHeaderClass = "text-sm font-bold uppercase tracking-wide text-sky-900 border-b border-sky-100 pb-1 mb-2";
  } else if (template === "graduate-compact") {
    primaryColor = "text-emerald-950 border-emerald-200";
    sectionHeaderClass = "text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-100 pb-0.5 mb-1.5";
  } else if (template === "technical-analyst") {
    primaryColor = "text-slate-900 border-slate-200";
    sectionHeaderClass = "text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2";
  } else if (template === "sharp-modern") {
    primaryColor = "text-black border-black";
    sectionHeaderClass = "text-xs font-black uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-3";
  }

  const renderContactInfo = () => (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2 font-medium">
      {contact.location && (
        <span className="flex items-center gap-1"><MapPin className="size-3 text-slate-400" /> {contact.location}</span>
      )}
      {contact.phone && (
        <span className="flex items-center gap-1"><Phone className="size-3 text-slate-400" /> {contact.phone}</span>
      )}
      {contact.email && (
        <span className="flex items-center gap-1"><Mail className="size-3 text-slate-400" /> {contact.email}</span>
      )}
      {contact.linkedin && (
        <span className="flex items-center gap-1"><Linkedin className="size-3 text-slate-400" /> {contact.linkedin.replace("https://", "")}</span>
      )}
      {contact.website && (
        <span className="flex items-center gap-1"><Globe className="size-3 text-slate-400" /> {contact.website.replace("https://", "")}</span>
      )}
    </div>
  );

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <div className="mb-4">
        <h3 className={sectionHeaderClass}>Professional Summary</h3>
        <p className="text-[11px] text-slate-700 leading-relaxed font-normal">{summary}</p>
      </div>
    );
  };

  const renderExperience = () => {
    if (experiences.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className={sectionHeaderClass}>Work Experience</h3>
        <div className="space-y-3">
          {experiences.map((exp: any, idx: number) => (
            <div key={exp.id || idx} className="text-[11px]">
              <div className="flex items-baseline justify-between font-bold text-slate-900 text-[11px]">
                <span>{exp.jobTitle} <span className="font-normal text-slate-500">at</span> {exp.employer}</span>
                <span className="font-medium text-slate-500 text-[10px] whitespace-nowrap ml-2">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
              </div>
              {exp.location && <div className="text-[10px] text-slate-500 font-medium italic mb-1">{exp.location}</div>}
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-disc pl-4 space-y-0.5 text-slate-650 mt-1">
                  {exp.bullets.map((bullet: string, bidx: number) => (
                    <li key={bidx} className="leading-relaxed">{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (education.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className={sectionHeaderClass}>Education</h3>
        <div className="space-y-2">
          {education.map((edu: any, idx: number) => (
            <div key={edu.id || idx} className="text-[11px]">
              <div className="flex items-baseline justify-between font-bold text-slate-900">
                <span>{edu.degree}</span>
                <span className="font-medium text-slate-500 text-[10px] whitespace-nowrap ml-2">{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="text-slate-600 font-medium text-[11px]">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</div>
              {edu.details && (
                <p className="text-[10px] text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed font-normal">{edu.details}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (skillGroups.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className={sectionHeaderClass}>Skills</h3>
        <div className="space-y-1.5">
          {skillGroups.map((group: any, idx: number) => (
            <div key={group.id || idx} className="text-[11px]">
              <span className="font-bold text-slate-800">{group.name}: </span>
              <span className="text-slate-600 font-normal">{group.skills.join(", ")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className={sectionHeaderClass}>Projects</h3>
        <div className="space-y-2.5">
          {projects.map((proj: any, idx: number) => (
            <div key={proj.id || idx} className="text-[11px]">
              <div className="flex items-baseline justify-between font-bold text-slate-900">
                <span>{proj.name}</span>
                {proj.technologies && <span className="font-medium text-slate-500 text-[10px] italic">{proj.technologies}</span>}
              </div>
              {proj.link && <div className="text-[10px] text-brand hover:underline font-medium break-all">{proj.link}</div>}
              <p className="text-slate-650 leading-relaxed font-normal mt-0.5">{proj.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOther = () => {
    const hasAchievements = achievements.length > 0;
    const hasCertifications = certifications.length > 0;
    if (!hasAchievements && !hasCertifications) return null;

    return (
      <div className="mb-4">
        {hasAchievements && (
          <div className="mb-3">
            <h3 className={sectionHeaderClass}>Achievements</h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-650">
              {achievements.map((ach: any, idx: number) => (
                <li key={ach.id || idx}>
                  <strong className="text-slate-800">{ach.title}</strong>: {ach.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasCertifications && (
          <div>
            <h3 className={sectionHeaderClass}>Certifications</h3>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-650">
              {certifications.map((cert: any, idx: number) => (
                <li key={cert.id || idx}>
                  <strong className="text-slate-800">{cert.name}</strong> – {cert.issuer} ({cert.date})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`w-full bg-white text-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-200/50 p-10 min-h-[1050px] text-left select-text relative transition-all duration-300 font-sans`}
      style={{ fontFamily: isSerif ? "Georgia, serif" : "'Inter', sans-serif" }}
    >
      {/* Printable Watermark banner for the demo */}
      <div className="absolute right-0 top-0 bg-slate-100 text-slate-400 text-[8px] font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg select-none print:hidden">
        Demo Preview
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{contact.fullName || "Your Name"}</h1>
        {contact.title && (
          <p className="text-[12px] text-brand font-bold uppercase tracking-wider mt-0.5">{contact.title}</p>
        )}
        {renderContactInfo()}
      </div>

      {/* Main Grid: 2 columns for technical analyst, 1 column otherwise */}
      {isTwoColumn ? (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
          </div>
          {/* Right Column */}
          <div className="space-y-4 border-l border-slate-100 pl-6">
            {renderSkills()}
            {renderEducation()}
            {renderOther()}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderSummary()}
          {renderExperience()}
          {renderEducation()}
          {renderSkills()}
          {renderProjects()}
          {renderOther()}
        </div>
      )}
    </div>
  );
}

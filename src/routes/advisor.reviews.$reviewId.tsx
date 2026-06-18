import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AdvisorResumeSnapshot } from "@/components/advisor/AdvisorResumeSnapshot";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdvisorReviewDetail,
  releaseAdvisorReview,
  saveAdvisorReviewDraft,
  submitAdvisorReview,
  type AdvisorReviewComment,
  type AdvisorReviewDetail,
  type AdvisorReviewPriority,
} from "@/lib/advisor-review-api";
import type { StepId } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/advisor/reviews/$reviewId")({
  component: AdvisorReviewWorkspace,
  head: () => ({
    meta: [{ title: "Advisor Review - CareerForge AI" }],
  }),
});

const SECTION_LABELS: Record<StepId, string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  achievements: "Achievements",
  certifications: "Certifications",
};

function AdvisorReviewWorkspace() {
  const { reviewId } = Route.useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AdvisorReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<AdvisorReviewComment[]>([]);
  const [overallSummary, setOverallSummary] = useState("");
  const [section, setSection] = useState<StepId>("summary");
  const [priority, setPriority] = useState<AdvisorReviewPriority>("medium");
  const [commentText, setCommentText] = useState("");
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [submitting, setSubmitting] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const detailRef = useRef<AdvisorReviewDetail | null>(null);
  const commentsRef = useRef<AdvisorReviewComment[]>([]);
  const summaryRef = useRef("");
  const revisionRef = useRef(0);
  const lastSavedSignature = useRef("");
  const saveTimer = useRef<number | null>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const initialized = useRef(false);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    summaryRef.current = overallSummary;
  }, [overallSummary]);

  useEffect(() => {
    let active = true;
    void getAdvisorReviewDetail(reviewId)
      .then((record) => {
        if (!active) return;
        setDetail(record);
        detailRef.current = record;
        setComments(record.comments);
        commentsRef.current = record.comments;
        setOverallSummary(record.overallSummary);
        summaryRef.current = record.overallSummary;
        revisionRef.current = record.draftRevision;
        lastSavedSignature.current = draftSignature(
          record.overallSummary,
          record.comments,
        );
        initialized.current = true;
      })
      .catch((error) => {
        toast.error("Review workspace could not be opened", {
          description: error instanceof Error ? error.message : "Try again.",
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [reviewId]);

  const saveLatest = useCallback(async () => {
    const current = detailRef.current;
    if (!current || current.status !== "in_review") return true;
    const signature = draftSignature(summaryRef.current, commentsRef.current);
    if (signature === lastSavedSignature.current) return true;
    setSaveState("saving");
    try {
      const saved = await saveAdvisorReviewDraft(reviewId, {
        draftRevision: revisionRef.current,
        overallSummary: summaryRef.current,
        comments: commentsRef.current.map((comment) => ({
          section: comment.section,
          priority: comment.priority,
          comment: comment.comment,
        })),
      });
      revisionRef.current = saved.draftRevision;
      lastSavedSignature.current = signature;
      detailRef.current = saved;
      setDetail(saved);
      setComments(saved.comments);
      commentsRef.current = saved.comments;
      setSaveState("saved");
      return true;
    } catch (error) {
      setSaveState("error");
      toast.error("Review draft was not saved", {
        description:
          error instanceof Error
            ? error.message
            : "Check your connection and try again.",
      });
      return false;
    }
  }, [reviewId]);

  useEffect(() => {
    if (!initialized.current || detailRef.current?.status !== "in_review") {
      return;
    }
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setSaveState("idle");
    saveTimer.current = window.setTimeout(() => {
      saveChain.current = saveChain.current
        .then(async () => {
          await saveLatest();
        })
        .catch(() => undefined);
    }, 750);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [comments, overallSummary, saveLatest]);

  const flushDraft = async () => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    await saveChain.current;
    return saveLatest();
  };

  const addComment = () => {
    const value = commentText.trim();
    if (!value) return;
    setComments((items) => [
      ...items,
      {
        id: `draft-${crypto.randomUUID()}`,
        section,
        priority,
        comment: value,
      },
    ]);
    setCommentText("");
  };

  const release = async () => {
    if (
      !window.confirm(
        "Return this review to the available queue? Your draft feedback will be cleared.",
      )
    ) {
      return;
    }
    setReleasing(true);
    try {
      await releaseAdvisorReview(reviewId);
      toast.success("Review returned to the queue");
      await navigate({ to: "/advisor" });
    } catch (error) {
      toast.error("Review could not be returned", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setReleasing(false);
    }
  };

  const submit = async () => {
    if (!overallSummary.trim()) {
      toast.error("Add an overall review summary before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      if (!(await flushDraft())) return;
      const completed = await submitAdvisorReview(
        reviewId,
        revisionRef.current,
      );
      setDetail(completed);
      detailRef.current = completed;
      toast.success("Advisor feedback submitted");
    } catch (error) {
      toast.error("Review could not be submitted", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f5f1]">
        <LoaderCircle className="size-6 animate-spin text-[#101a2d]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f5f1] px-4 text-center">
        <div>
          <h1 className="text-xl font-bold text-[#101a2d]">
            Review unavailable
          </h1>
          <Button className="mt-4" onClick={() => navigate({ to: "/advisor" })}>
            Back to queue
          </Button>
        </div>
      </div>
    );
  }

  const editable = detail.status === "in_review";

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/advisor" })}
          className="flex items-center gap-2 text-sm font-medium text-[#475467]"
        >
          <ArrowLeft className="size-4" />
          Back to Advisor Queue
        </button>
        <div className="text-right">
          <strong className="block text-sm text-[#101a2d]">
            {detail.snapshot.data.contact.fullName || "Student CV"}
          </strong>
          <span className="text-xs text-[#667085]">{detail.snapshot.name}</span>
        </div>
      </header>

      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.85fr)]">
        <section className="xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto xl:pr-2">
          <AdvisorResumeSnapshot data={detail.snapshot.data} />
        </section>

        <aside className="space-y-4 xl:max-h-[calc(100vh-112px)] xl:overflow-y-auto">
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#667085]">
              <MessageSquare className="size-4" />
              Student message
            </div>
            <p className="mt-3 text-sm leading-6 text-[#172036]">
              {detail.studentMessage || "The student did not add a message."}
            </p>
          </section>

          {editable && (
            <section className="rounded-2xl border bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Add section comment
              </h2>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Select
                  value={section}
                  onValueChange={(value) => setSection(value as StepId)}
                >
                  <SelectTrigger className="sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex rounded-lg bg-[#f2f4f7] p-1">
                  {(["low", "medium", "high"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriority(value)}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-xs font-semibold capitalize",
                        priority === value
                          ? "bg-white text-[#101a2d] shadow-sm"
                          : "text-[#667085]",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                className="mt-3 min-h-28"
                maxLength={5000}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write specific, actionable feedback for this CV section..."
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#667085]">
                  {commentText.length} / 5000
                </span>
                <Button
                  size="sm"
                  onClick={addComment}
                  disabled={!commentText.trim()}
                >
                  <Plus className="size-4" />
                  Add comment
                </Button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#667085]">
              Comments ({comments.length})
            </h2>
            <div className="mt-3 space-y-3">
              {comments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-5 text-center text-sm text-[#667085]">
                  No section comments added yet.
                </div>
              ) : (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-[#e1e5ea] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm text-[#101a2d]">
                        {SECTION_LABELS[comment.section]}
                      </strong>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold uppercase text-[#667085]">
                          {comment.priority}
                        </span>
                        {editable && (
                          <button
                            type="button"
                            onClick={() =>
                              setComments((items) =>
                                items.filter((item) => item.id !== comment.id),
                              )
                            }
                            className="text-[#98a2b3] hover:text-[#b42318]"
                            aria-label="Remove comment"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#475467]">
                      {comment.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Overall review summary
              </h2>
              {editable && <SaveStatus state={saveState} />}
            </div>
            <Textarea
              className="mt-3 min-h-32"
              maxLength={10000}
              value={overallSummary}
              readOnly={!editable}
              onChange={(event) => setOverallSummary(event.target.value)}
              placeholder="Summarise the main strengths, key improvements, and next steps for the student..."
            />
            {editable ? (
              <>
                <Button
                  className="mt-4 w-full bg-[#101a2d] hover:bg-[#1e2c45]"
                  disabled={submitting}
                  onClick={() => void submit()}
                >
                  {submitting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Submit Review
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  disabled={releasing}
                  onClick={() => void release()}
                >
                  {releasing ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Return to queue
                </Button>
              </>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#edf8f2] p-3 text-sm font-semibold text-[#1f6b4d]">
                <CheckCircle2 className="size-4" />
                This review was submitted and is read-only.
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function SaveStatus({
  state,
}: {
  state: "idle" | "saving" | "saved" | "error";
}) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-[#667085]">
        <LoaderCircle className="size-3.5 animate-spin" />
        Saving
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-[#26835f]">
        <CheckCircle2 className="size-3.5" />
        Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="text-xs font-semibold text-[#b42318]">Not saved</span>
    );
  }
  return <span className="text-xs text-[#98a2b3]">Autosaves</span>;
}

function draftSignature(
  overallSummary: string,
  comments: AdvisorReviewComment[],
) {
  return JSON.stringify({
    overallSummary,
    comments: comments.map(({ section, priority, comment }) => ({
      section,
      priority,
      comment,
    })),
  });
}

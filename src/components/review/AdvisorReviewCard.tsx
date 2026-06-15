import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  Send,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createAdvisorReview,
  getLatestAdvisorReview,
  type AdvisorReview,
  type AdvisorReviewComment,
  withdrawAdvisorReview,
} from "@/lib/advisor-review-api";
import { syncCurrentResume } from "@/lib/resume-sync";
import { useResumeStore } from "@/lib/resume-store";
import type { StepId } from "@/lib/resume-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AdvisorReviewCardProps {
  onEditSection: (section: StepId) => void;
}

export function AdvisorReviewCard({ onEditSection }: AdvisorReviewCardProps) {
  const resumeId = useResumeStore((state) => state.resumeId);
  const [review, setReview] = useState<AdvisorReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const loadReview = useCallback(async () => {
    if (!resumeId) {
      setReview(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      setReview(await getLatestAdvisorReview(resumeId));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Advisor review status could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    void loadReview();
  }, [loadReview]);

  const sendReview = async () => {
    if (!resumeId || !confirmed) return;
    setWorking(true);
    try {
      await syncCurrentResume();
      const created = await createAdvisorReview(resumeId, message.trim());
      setReview(created);
      setRequestOpen(false);
      setMessage("");
      setConfirmed(false);
      toast.success("Base CV sent for advisor review", {
        description: "The advisor will review the fixed version you submitted.",
      });
    } catch (error) {
      toast.error("Advisor review could not be requested", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setWorking(false);
    }
  };

  const withdrawReview = async () => {
    if (!review || review.status !== "pending") return;
    if (
      !window.confirm(
        "Withdraw this advisor review request? The submitted CV snapshot will no longer be available in the review queue.",
      )
    ) {
      return;
    }
    setWorking(true);
    try {
      const withdrawn = await withdrawAdvisorReview(review.id);
      setReview(withdrawn);
      toast.success("Advisor review request withdrawn");
    } catch (error) {
      toast.error("The request could not be withdrawn", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
      void loadReview();
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <section className="surface-panel p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#e7f4f2] text-brand">
            <UserRoundCheck className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#17364b]">
                Advisor review
              </h2>
              {review && <ReviewStatus status={review.status} />}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#607482]">
              Send a fixed copy of this Base CV to your university careers team.
              Later edits will not change the submitted version.
            </p>
          </div>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#607482]">
            <LoaderCircle className="size-4 animate-spin" />
            Loading advisor review status...
          </div>
        )}

        {!loading && loadError && (
          <div className="mt-4 rounded-md border border-[#ead6ae] bg-[#fff7e6] p-3">
            <div className="flex gap-2 text-xs leading-5 text-[#74551f]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{loadError}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => void loadReview()}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !loadError && (
          <ReviewAction
            review={review}
            working={working}
            onRequest={() => setRequestOpen(true)}
            onWithdraw={() => void withdrawReview()}
            onViewFeedback={() => setFeedbackOpen(true)}
          />
        )}
      </section>

      <Dialog
        open={requestOpen}
        onOpenChange={(open) => {
          if (!working) setRequestOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send for advisor review</DialogTitle>
            <DialogDescription>
              Your latest saved Base CV will be copied into a fixed review
              version. You can continue editing your working CV afterward.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="advisor-review-message" className="field-label">
                Message to the careers team (optional)
              </label>
              <Textarea
                id="advisor-review-message"
                className="mt-2 min-h-28"
                maxLength={2000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="For example: Please focus on how clearly I present the impact of my internship."
              />
              <p className="mt-1 text-right text-[11px] text-[#718590]">
                {message.length}/2000
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[#d9e2e7] bg-[#f8fafb] p-3">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-0.5 size-4 accent-[#147d78]"
              />
              <span className="text-xs leading-5 text-[#425968]">
                I understand that my university careers team will receive the
                submitted CV snapshot and my optional message.
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestOpen(false)}
              disabled={working}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void sendReview()}
              disabled={!confirmed || working}
            >
              {working ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {working ? "Sending..." : "Send for review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advisor feedback</DialogTitle>
            <DialogDescription>
              Feedback relates to the fixed CV version submitted on{" "}
              {review ? formatDate(review.submittedAt) : ""}.
            </DialogDescription>
          </DialogHeader>

          {review?.status === "completed" && (
            <div className="space-y-5">
              <div className="rounded-md border border-[#cfe2e0] bg-[#f3faf9] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  Overall feedback
                </p>
                <p className="mt-2 text-sm leading-6 text-[#28485b]">
                  {review.overallSummary}
                </p>
                {review.advisorName && (
                  <p className="mt-3 text-xs text-[#607482]">
                    Reviewed by {review.advisorName}
                  </p>
                )}
              </div>

              {review.comments.length > 0 ? (
                <div className="space-y-3">
                  {review.comments.map((comment) => (
                    <FeedbackComment
                      key={comment.id}
                      comment={comment}
                      onEdit={() => {
                        setFeedbackOpen(false);
                        onEditSection(comment.section);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#607482]">
                  The advisor did not add section-specific comments.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReviewAction({
  review,
  working,
  onRequest,
  onWithdraw,
  onViewFeedback,
}: {
  review: AdvisorReview | null;
  working: boolean;
  onRequest: () => void;
  onWithdraw: () => void;
  onViewFeedback: () => void;
}) {
  if (!review || review.status === "withdrawn") {
    return (
      <div className="mt-4">
        {review?.status === "withdrawn" && (
          <p className="mb-3 text-xs leading-5 text-[#718590]">
            Your previous request was withdrawn. You may send the latest CV
            version when you are ready.
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onRequest}
        >
          <Send className="size-4" />
          {review ? "Send again" : "Send for advisor review"}
        </Button>
      </div>
    );
  }

  if (review.status === "pending") {
    return (
      <div className="mt-4 rounded-md border border-[#d9e2e7] bg-[#f8fafb] p-3">
        <div className="flex items-start gap-2">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-[#b7791f]" />
          <div>
            <p className="text-xs font-semibold text-[#425968]">
              Waiting for an advisor
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[#718590]">
              Submitted {formatDate(review.submittedAt)}. You can withdraw it
              until an advisor starts reviewing.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-[#607482]"
          disabled={working}
          onClick={onWithdraw}
        >
          {working ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          Withdraw request
        </Button>
      </div>
    );
  }

  if (review.status === "in_review") {
    return (
      <div className="mt-4 rounded-md border border-[#cfe2e0] bg-[#f3faf9] p-3">
        <div className="flex items-start gap-2">
          <Eye className="mt-0.5 size-4 shrink-0 text-brand" />
          <div>
            <p className="text-xs font-semibold text-[#28485b]">
              An advisor is reviewing your CV
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[#607482]">
              {review.advisorName
                ? `${review.advisorName} has started the review.`
                : "Your request has been claimed by the careers team."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-start gap-2 rounded-md border border-[#cfe2e0] bg-[#f3faf9] p-3">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#26835f]" />
        <div>
          <p className="text-xs font-semibold text-[#28485b]">
            Your feedback is ready
          </p>
          <p className="mt-1 text-[11px] leading-5 text-[#607482]">
            Completed{" "}
            {review.completedAt ? formatDate(review.completedAt) : "recently"}.
          </p>
        </div>
      </div>
      <Button type="button" className="w-full" onClick={onViewFeedback}>
        <Eye className="size-4" />
        View advisor feedback
      </Button>
    </div>
  );
}

function ReviewStatus({ status }: { status: AdvisorReview["status"] }) {
  const styles = {
    pending: "border-[#ead6ae] bg-[#fff7e6] text-[#74551f]",
    in_review: "border-[#cfe2e0] bg-[#e7f4f2] text-[#0f625e]",
    completed: "border-[#b9dfcd] bg-[#edf8f2] text-[#1f6b4d]",
    withdrawn: "border-[#d9e2e7] bg-[#f4f7f8] text-[#607482]",
  };
  const labels = {
    pending: "Pending",
    in_review: "In review",
    completed: "Completed",
    withdrawn: "Withdrawn",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function FeedbackComment({
  comment,
  onEdit,
}: {
  comment: AdvisorReviewComment;
  onEdit: () => void;
}) {
  const labels: Record<StepId, string> = {
    contact: "Contact",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    summary: "Summary",
    achievements: "Achievements",
    certifications: "Certifications",
  };
  const priorityStyles = {
    low: "bg-[#edf1f3] text-[#607482]",
    medium: "bg-[#fff7e6] text-[#74551f]",
    high: "bg-[#fff1f0] text-[#9f332f]",
  };

  return (
    <article className="rounded-md border border-[#d9e2e7] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#17364b]">
          {labels[comment.section]}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[comment.priority]}`}
        >
          {comment.priority} priority
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#425968]">{comment.comment}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={onEdit}
      >
        Edit {labels[comment.section]}
      </Button>
    </article>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

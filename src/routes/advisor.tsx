import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, ChevronRight, MessageSquare, Plus, RefreshCw, Trash2, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { selectParts } from "@/components/ui/select";
import { PdfResumePreview } from "@/components/builder/PdfResumePreview";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/advisor")({
  component: AdvisorQueuePage,
});

interface AdvisorComment {
  id: string;
  section: string;
  priority: "low" | "medium" | "high";
  comment: string;
}

interface ReviewItem {
  id: string;
  resumeId: string;
  resumeVersionId: string;
  status: "pending" | "in_review" | "completed" | "withdrawn";
  studentName: string;
  studentMessage: string;
  advisorName: string | null;
  overallSummary: string;
  comments: AdvisorComment[];
  submittedAt: string;
  claimedAt?: string | null;
  completedAt?: string | null;
  priority: "low" | "medium" | "high";
}

function AdvisorQueuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);

  // Comments & Feedback State
  const [activeSection, setActiveSection] = useState<string>("summary");
  const [commentText, setCommentText] = useState<string>("");
  const [commentPriority, setCommentPriority] = useState<"low" | "medium" | "high">("medium");
  const [overallSummary, setOverallSummary] = useState<string>("");

  // Load reviews from localStorage or API client default
  useEffect(() => {
    if (user?.role !== "advisor") {
      void navigate({ to: "/login" });
      return;
    }

    const loadReviews = () => {
      const stored = localStorage.getItem("careerforge_demo_reviews");
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        const defaultReviews: ReviewItem[] = [
          {
            id: "rev_001",
            resumeId: "res_001",
            resumeVersionId: "v_001",
            status: "pending",
            studentName: "Alex Morgan",
            studentMessage: "Hi advisor, looking for feedback on my J.P. Morgan Risk Analyst application. Thanks!",
            advisorName: null,
            overallSummary: "",
            comments: [
              { id: "c_1", section: "summary", priority: "medium", comment: "Add a bit more quantitative metric in your summary statement." }
            ],
            submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
            priority: "medium"
          },
          {
            id: "rev_002",
            resumeId: "res_001",
            resumeVersionId: "v_002",
            status: "pending",
            studentName: "Praveen Binoy",
            studentMessage: "I need feedback for PwC technology consulting CV. I'm worried my skills section is a bit weak.",
            advisorName: null,
            overallSummary: "",
            comments: [],
            submittedAt: new Date().toISOString(),
            priority: "high"
          }
        ];
        setReviews(defaultReviews);
        localStorage.setItem("careerforge_demo_reviews", JSON.stringify(defaultReviews));
      }
    };
    loadReviews();
  }, [user, navigate]);

  // Sync back to localStorage
  const syncReviews = (updated: ReviewItem[]) => {
    setReviews(updated);
    localStorage.setItem("careerforge_demo_reviews", JSON.stringify(updated));
    if (selectedReview) {
      const match = updated.find((r) => r.id === selectedReview.id);
      setSelectedReview(match || null);
    }
  };

  const handleClaim = (reviewId: string) => {
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          status: "in_review" as const,
          advisorName: user?.fullName || "Dr. Sarah Jenkins",
          claimedAt: new Date().toISOString()
        };
      }
      return r;
    });
    syncReviews(updated);
    toast.success("Review claimed. You can now leave comments.");
  };

  const handleAddComment = () => {
    if (!selectedReview) return;
    if (!commentText.trim()) {
      toast.error("Please enter comment text.");
      return;
    }

    const newComment: AdvisorComment = {
      id: "c_" + Date.now(),
      section: activeSection,
      priority: commentPriority,
      comment: commentText.trim()
    };

    const updated = reviews.map((r) => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          comments: [...r.comments, newComment]
        };
      }
      return r;
    });

    syncReviews(updated);
    setCommentText("");
    toast.success("Comment added to CV snapshot.");
  };

  const handleDeleteComment = (commentId: string) => {
    if (!selectedReview) return;
    const updated = reviews.map((r) => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          comments: r.comments.filter((c) => c.id !== commentId)
        };
      }
      return r;
    });
    syncReviews(updated);
    toast.success("Comment removed.");
  };

  const handleSaveOverall = () => {
    if (!selectedReview) return;
    const updated = reviews.map((r) => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          overallSummary
        };
      }
      return r;
    });
    syncReviews(updated);
    toast.success("Overall feedback summary saved.");
  };

  const handleComplete = () => {
    if (!selectedReview) return;
    const updated = reviews.map((r) => {
      if (r.id === selectedReview.id) {
        return {
          ...r,
          status: "completed" as const,
          completedAt: new Date().toISOString(),
          overallSummary: overallSummary || r.overallSummary
        };
      }
      return r;
    });
    syncReviews(updated);
    toast.success("Review marked as completed. Feedback sent to student.");
  };

  const activeReview = selectedReview;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f7f8] flex flex-col">
      <div className="flex-1 grid lg:grid-cols-[340px_1fr] border-t border-[#d9e2e7]">
        {/* Left Side: Student queue list */}
        <section className="bg-white border-r border-[#d9e2e7] flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 border-b border-[#d9e2e7] bg-[#f8fafc]">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Advisor Review Queue</h2>
            <p className="text-xs text-slate-500 mt-1">Review student CV snapshot requests</p>
          </div>
          
          <div className="divide-y divide-[#edf2f7] flex-1">
            {reviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No review requests in queue.</div>
            ) : (
              reviews.map((rev) => {
                const isSelected = activeReview?.id === rev.id;
                const isClaimedByMe = rev.advisorName === user?.fullName;
                
                return (
                  <button
                    key={rev.id}
                    onClick={() => {
                      setSelectedReview(rev);
                      setOverallSummary(rev.overallSummary || "");
                    }}
                    className={`w-full text-left p-4 transition-colors hover:bg-slate-50 flex items-start justify-between cursor-pointer ${
                      isSelected ? "bg-slate-100/70 border-l-4 border-brand font-semibold" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 truncate">{rev.studentName}</span>
                        {rev.priority === "high" && (
                          <span className="bg-red-50 text-red-650 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">High</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate italic">"{rev.studentMessage}"</p>
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rev.submittedAt).toLocaleDateString()}
                        </span>
                        
                        {/* Status badges */}
                        {rev.status === "pending" && (
                          <span className="bg-amber-50 border border-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">Pending</span>
                        )}
                        {rev.status === "in_review" && (
                          <span className="bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">In Review</span>
                        )}
                        {rev.status === "completed" && (
                          <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-semibold">Completed</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400 shrink-0 self-center" />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Side: Active Workspace */}
        <section className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          {activeReview ? (
            <div className="flex-1 grid md:grid-cols-[1fr_400px] overflow-hidden">
              
              {/* Left Column: Student CV HTML Preview */}
              <div className="flex flex-col border-r border-[#d9e2e7] bg-[#dfe5e8] overflow-hidden">
                <div className="bg-white border-b border-[#d9e2e7] px-4 py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Student CV Snapshot</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{activeReview.studentName}'s verified base profile</p>
                  </div>
                  
                  {activeReview.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-brand text-white hover:bg-brand/90 flex items-center gap-1 text-xs"
                      onClick={() => handleClaim(activeReview.id)}
                    >
                      <UserCheck className="size-3.5" />
                      Claim Review
                    </Button>
                  )}

                  {activeReview.status === "in_review" && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-blue-150">
                      <UserCheck className="size-3.5" />
                      Claimed by You
                    </div>
                  )}

                  {activeReview.status === "completed" && (
                    <div className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-emerald-150">
                      <CheckCircle2 className="size-3.5" />
                      Completed
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex justify-center">
                  {/* Using standard preview in demo mode which renders HTML */}
                  <PdfResumePreview
                    pdf={null}
                    pdfUrl={null}
                    loading={false}
                    error={null}
                    bgClass="bg-[#dfe5e8] w-full"
                    paddingClass="p-2"
                  />
                </div>
              </div>

              {/* Right Column: Review Comment Panel */}
              <div className="bg-white overflow-y-auto flex flex-col h-full border-l border-[#d9e2e7]">
                <div className="p-4 border-b border-[#d9e2e7] bg-[#f8fafc]">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="size-4 text-brand" /> Advisor Feedback Console
                  </h3>
                </div>

                {activeReview.status === "pending" ? (
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="size-8 text-amber-500 animate-bounce mb-3" />
                    <h4 className="text-sm font-bold text-slate-800">Review request not claimed</h4>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                      You must claim this review request before adding comments or sending feedback to the student.
                    </p>
                    <Button 
                      className="bg-brand hover:bg-brand-strong"
                      onClick={() => handleClaim(activeReview.id)}
                    >
                      Claim Request Now
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-5 flex-1 flex flex-col justify-between">
                    
                    {/* Add comments block */}
                    {activeReview.status === "in_review" && (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Section Comment</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Section</label>
                            <select
                              value={activeSection}
                              onChange={(e) => setActiveSection(e.target.value)}
                              className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium text-slate-700"
                            >
                              <option value="summary">Summary</option>
                              <option value="experience">Experience</option>
                              <option value="education">Education</option>
                              <option value="skills">Skills</option>
                              <option value="projects">Projects</option>
                              <option value="achievements">Achievements</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
                            <select
                              value={commentPriority}
                              onChange={(e) => setCommentPriority(e.target.value as any)}
                              className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white font-medium text-slate-700"
                            >
                              <option value="low">Low Impact</option>
                              <option value="medium">Medium Impact</option>
                              <option value="high">High Impact</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Feedback Comment</label>
                          <Textarea
                            placeholder="Write constructive section advice..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            rows={3}
                            className="bg-white text-xs border border-slate-300"
                          />
                        </div>

                        <Button 
                          onClick={handleAddComment}
                          size="sm"
                          className="w-full text-xs font-bold"
                        >
                          <Plus className="size-3.5 mr-1" /> Add Comment
                        </Button>
                      </div>
                    )}

                    {/* Feedback summary comments list */}
                    <div className="flex-1 min-h-[200px]">
                      <div className="flex items-center justify-between border-b pb-2 mb-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Section Comments</h4>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{activeReview.comments.length}</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {activeReview.comments.length === 0 ? (
                          <div className="text-center text-xs text-slate-400 py-6 font-medium italic">No comments added yet.</div>
                        ) : (
                          activeReview.comments.map((comm) => (
                            <div key={comm.id} className="border border-slate-200 rounded-lg p-3 text-xs bg-slate-50 relative group">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-brand uppercase tracking-wider text-[10px]">{comm.section}</span>
                                <div className="flex items-center gap-1.5 pr-6">
                                  {comm.priority === "high" && <span className="text-[8px] uppercase tracking-wider bg-red-50 text-red-550 border border-red-100 font-bold px-1 rounded">High</span>}
                                  {comm.priority === "medium" && <span className="text-[8px] uppercase tracking-wider bg-amber-50 text-amber-550 border border-amber-100 font-bold px-1 rounded">Medium</span>}
                                  {comm.priority === "low" && <span className="text-[8px] uppercase tracking-wider bg-slate-100 text-slate-500 font-bold px-1 rounded">Low</span>}
                                </div>
                              </div>
                              <p className="mt-1 text-slate-600 leading-normal font-normal pr-5">{comm.comment}</p>
                              
                              {activeReview.status === "in_review" && (
                                <button
                                  onClick={() => handleDeleteComment(comm.id)}
                                  className="absolute right-2.5 top-2.5 text-slate-350 hover:text-red-550 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                  title="Delete comment"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Overall Summary Feedback text */}
                    <div className="border-t border-[#edf2f7] pt-4 mt-auto">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Overall Feedback Summary</label>
                      <Textarea
                        placeholder="Provide an overall review summary statement..."
                        value={overallSummary}
                        onChange={(e) => setOverallSummary(e.target.value)}
                        rows={3}
                        disabled={activeReview.status === "completed"}
                        className="text-xs border border-slate-300 bg-white"
                      />
                      
                      {activeReview.status === "in_review" && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={handleSaveOverall}
                            size="sm"
                            className="text-xs font-bold"
                          >
                            Save Progress
                          </Button>
                          <Button
                            onClick={handleComplete}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            Mark Completed
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <UserCheck className="size-12 text-[#9db5c8] animate-pulse mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Review Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select a student CV review request from the queue sidebar to claim it and provide section feedback.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  LogOut,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { apiRequest } from "@/lib/api-client";
import { useAuth, type AuthSession } from "@/lib/auth";
import { useResumeStore } from "@/lib/resume-store";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const clearWorkspace = useResumeStore((state) => state.clearWorkspace);
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const initialLoadStarted = useRef(false);
  const sessionRequest = useRef<AbortController | null>(null);

  const loadSessions = useCallback(async () => {
    sessionRequest.current?.abort();
    const controller = new AbortController();
    sessionRequest.current = controller;
    setLoading(true);
    try {
      setSessions(
        await apiRequest<AuthSession[]>("/auth/sessions", {
          signal: controller.signal,
        }),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      toast.error("Sessions could not be loaded", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      if (sessionRequest.current === controller) {
        sessionRequest.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void loadSessions();
    return () => sessionRequest.current?.abort();
  }, [loadSessions]);

  const signOut = async () => {
    sessionRequest.current?.abort();
    await logout();
    clearWorkspace();
    await navigate({ to: "/login" });
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Schedule this account and all saved resumes for permanent deletion in 30 days?",
      )
    ) {
      return;
    }
    try {
      await apiRequest<null>("/auth/delete-account", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      await refreshUser();
      clearWorkspace();
      toast.success("Account scheduled for deletion", {
        description: "Use the recovery email within 30 days to restore it.",
      });
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error("Account deletion was not scheduled", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f7f8]">
      <div className="page-shell max-w-5xl">
        <p className="page-kicker">Account security</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="page-title">Your account</h1>
            <p className="page-description mt-2">
              Manage active devices and the lifecycle of your saved workspace.
            </p>
          </div>
          <Button variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#d9e2e7] px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-[#17364b]">
                  Active sessions
                </h2>
                <p className="mt-1 text-xs text-[#718590]">
                  Revoke devices you no longer recognize.
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void loadSessions()}
                aria-label="Refresh sessions"
                title="Refresh sessions"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
            <div className="divide-y divide-[#e1e8eb]">
              {!loading && sessions.length === 0 && (
                <p className="p-5 text-sm text-[#607482]">
                  No active sessions found.
                </p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#edf1f3] text-[#425968]">
                    <MonitorSmartphone className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-[#17364b]">
                        {friendlyAgent(session.userAgent)}
                      </p>
                      {session.current && (
                        <span className="section-chip">Current</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#718590]">
                      {session.ipAddress} - Last used{" "}
                      {new Date(session.lastUsedAt).toLocaleString()}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await apiRequest<null>(`/auth/sessions/${session.id}`, {
                          method: "DELETE",
                        });
                        setSessions((items) =>
                          items.filter((item) => item.id !== session.id),
                        );
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="surface-panel p-5">
              <ShieldCheck className="size-5 text-brand" />
              <h2 className="mt-3 text-sm font-bold text-[#17364b]">
                Verified account
              </h2>
              <p className="mt-2 text-xs leading-5 text-[#607482]">
                {user?.email}
              </p>
            </div>

            <div className="rounded-md border border-[#e7c8c5] bg-[#fffafa] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#9f332f]">
                <AlertTriangle className="size-4" />
                Delete account
              </div>
              <p className="mt-2 text-xs leading-5 text-[#77504e]">
                Access stops immediately. Permanent deletion occurs after 30
                days, with recovery available by email until then.
              </p>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="delete-password" className="field-label">
                  Confirm password
                </Label>
                <PasswordInput
                  id="delete-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="mt-3 w-full border-[#d8aaa6] text-[#9f332f] hover:bg-[#fff1f0]"
                disabled={!password}
                onClick={() => void deleteAccount()}
              >
                <Trash2 className="size-4" />
                Schedule deletion
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function friendlyAgent(value: string) {
  if (/edg/i.test(value)) return "Microsoft Edge";
  if (/chrome/i.test(value)) return "Google Chrome";
  if (/firefox/i.test(value)) return "Mozilla Firefox";
  if (/safari/i.test(value)) return "Safari";
  return value || "Unknown browser";
}

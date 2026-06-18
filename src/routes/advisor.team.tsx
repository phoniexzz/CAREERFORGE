import { createFileRoute } from "@tanstack/react-router";
import {
  LoaderCircle,
  MailPlus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteAdvisor,
  listAdvisorAccounts,
  resendAdvisorInvite,
  updateAdvisorAccount,
  type AdvisorAccount,
} from "@/lib/advisor-admin-api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/advisor/team")({
  component: AdvisorTeamPage,
  head: () => ({
    meta: [{ title: "Advisor Team - CareerForge AI" }],
  }),
});

function AdvisorTeamPage() {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState<AdvisorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [manager, setManager] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAdvisors(await listAdvisorAccounts());
    } catch (error) {
      toast.error("Advisor team could not be loaded", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const replace = (advisor: AdvisorAccount) => {
    setAdvisors((items) =>
      items.map((item) => (item.id === advisor.id ? advisor : item)),
    );
  };

  const sendInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setWorking("invite");
    try {
      const advisor = await inviteAdvisor({
        email,
        fullName,
        canManageAdvisors: manager,
      });
      setAdvisors((items) => [...items, advisor]);
      setEmail("");
      setFullName("");
      setManager(false);
      toast.success("Advisor invitation sent");
    } catch (error) {
      toast.error("Invitation could not be sent", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setWorking("");
    }
  };

  const update = async (
    advisor: AdvisorAccount,
    values: { isActive?: boolean; canManageAdvisors?: boolean },
  ) => {
    setWorking(advisor.id);
    try {
      replace(await updateAdvisorAccount(advisor.id, values));
      toast.success("Advisor account updated");
    } catch (error) {
      toast.error("Advisor account was not updated", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    } finally {
      setWorking("");
    }
  };

  if (!user?.canManageAdvisors) return null;

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#667085]">
          Access management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#101a2d]">
          Advisor Team
        </h1>
        <p className="mt-2 text-sm text-[#667085]">
          Invite trusted careers staff and control advisor-manager access.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MailPlus className="size-5 text-[#101a2d]" />
              <h2 className="font-bold text-[#101a2d]">Invite advisor</h2>
            </div>
            <form className="mt-5 space-y-4" onSubmit={sendInvite}>
              <div className="space-y-1.5">
                <Label htmlFor="advisor-name" className="field-label">
                  Full name
                </Label>
                <Input
                  id="advisor-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="advisor-email" className="field-label">
                  Email
                </Label>
                <Input
                  id="advisor-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-[#f8fafb] p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#101a2d]"
                  checked={manager}
                  onChange={(event) => setManager(event.target.checked)}
                />
                <span>
                  <strong className="block text-sm text-[#344054]">
                    Advisor manager
                  </strong>
                  <span className="mt-1 block text-xs leading-5 text-[#667085]">
                    Can invite, deactivate, and manage other advisors.
                  </span>
                </span>
              </label>
              <Button
                className="w-full bg-[#101a2d] hover:bg-[#1e2c45]"
                disabled={working === "invite"}
              >
                {working === "invite" ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <MailPlus className="size-4" />
                )}
                Send invitation
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-[#101a2d]" />
                <h2 className="font-bold text-[#101a2d]">
                  Advisors ({advisors.length})
                </h2>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => void load()}
                aria-label="Refresh advisors"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>

            {loading ? (
              <div className="grid min-h-56 place-items-center">
                <LoaderCircle className="size-5 animate-spin" />
              </div>
            ) : (
              <div className="divide-y">
                {advisors.map((advisor) => (
                  <article
                    key={advisor.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-[#101a2d]">
                          {advisor.fullName}
                        </strong>
                        {advisor.canManageAdvisors && (
                          <span className="flex items-center gap-1 rounded-full bg-[#edf8f2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1f6b4d]">
                            <ShieldCheck className="size-3" />
                            Manager
                          </span>
                        )}
                        <AccountStatus advisor={advisor} />
                      </div>
                      <p className="mt-1 truncate text-xs text-[#667085]">
                        {advisor.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {advisor.invitationPending ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={working === advisor.id}
                          onClick={async () => {
                            setWorking(advisor.id);
                            try {
                              replace(await resendAdvisorInvite(advisor.id));
                              toast.success("Invitation resent");
                            } catch (error) {
                              toast.error("Invitation was not resent", {
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : "Try again.",
                              });
                            } finally {
                              setWorking("");
                            }
                          }}
                        >
                          <MailPlus className="size-4" />
                          Resend
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={working === advisor.id}
                            onClick={() =>
                              void update(advisor, {
                                canManageAdvisors: !advisor.canManageAdvisors,
                              })
                            }
                          >
                            <ShieldCheck className="size-4" />
                            {advisor.canManageAdvisors
                              ? "Remove manager"
                              : "Make manager"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={
                              working === advisor.id || advisor.id === user.id
                            }
                            onClick={() =>
                              void update(advisor, {
                                isActive: !advisor.isActive,
                              })
                            }
                          >
                            {advisor.isActive ? (
                              <UserX className="size-4" />
                            ) : (
                              <UserCheck className="size-4" />
                            )}
                            {advisor.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AccountStatus({ advisor }: { advisor: AdvisorAccount }) {
  if (advisor.invitationPending) {
    return (
      <span className="rounded-full bg-[#fff7e8] px-2 py-0.5 text-[10px] font-bold uppercase text-[#805b1c]">
        Invitation pending
      </span>
    );
  }
  return (
    <span
      className={
        advisor.isActive
          ? "rounded-full bg-[#edf8f2] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1f6b4d]"
          : "rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold uppercase text-[#667085]"
      }
    >
      {advisor.isActive ? "Active" : "Inactive"}
    </span>
  );
}

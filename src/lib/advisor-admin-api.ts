import { apiRequest } from "./api-client";

export interface AdvisorAccount {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
  canManageAdvisors: boolean;
  invitationPending: boolean;
  createdAt: string;
}

export function listAdvisorAccounts() {
  return apiRequest<AdvisorAccount[]>("/advisor-admin/advisors");
}

export function inviteAdvisor(input: {
  email: string;
  fullName: string;
  canManageAdvisors: boolean;
}) {
  return apiRequest<AdvisorAccount>("/advisor-admin/invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resendAdvisorInvite(advisorId: string) {
  return apiRequest<AdvisorAccount>(
    `/advisor-admin/advisors/${advisorId}/resend-invite`,
    { method: "POST" },
  );
}

export function updateAdvisorAccount(
  advisorId: string,
  input: {
    isActive?: boolean;
    canManageAdvisors?: boolean;
  },
) {
  return apiRequest<AdvisorAccount>(`/advisor-admin/advisors/${advisorId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

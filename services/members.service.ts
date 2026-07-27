import { apiFetch } from "@/libs/apiFetch";
import { OrgMembersPayload, GetOrgMembersParams } from "@/features/user/members/types/types";
import { GetOrgInvitationsParams, OrgInvitationsPayload } from "@/features/user/members/types/invitation.type";
import { UpdateMemberPayload, UpdateMemberResponse } from "@/features/user/members/hooks/useUpdateMember";

export function getOrgMembers(params: GetOrgMembersParams) {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.all) query.append("all", "true");
    if (params.search) query.append("search", params.search);
    if (params.role) query.append("role", params.role);
    if (params.status) query.append("status", params.status);
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<OrgMembersPayload>(`/user/org-users?${query.toString()}`, { method: "GET" });
};

export const deleteOrgMember = ({ memberIds }: { memberIds: string[] }): Promise<{ data: string[]; message: string }> => {
    return apiFetch(`/organisation/members`, { method: "DELETE", body: JSON.stringify({ memberIds }) }, false);
};

export const updateOrgMember = ({ memberId, role, status }: UpdateMemberPayload): Promise<UpdateMemberResponse> => {
    const payload: { role?: string; status?: string } = {};
    if (role) payload.role = role;
    if (status) payload.status = status;

    return apiFetch(`/organisation/member/${memberId}`, { method: "PATCH", body: JSON.stringify(payload) }, false);
};

export const inviteOrgMember = ({ email, role }: {
    email: string
    role?: string
}) => {
    const payload: { email: string; role?: string } = { email };
    if (role) payload.role = role;
    return apiFetch(`/organisation/invite`, { method: "POST", body: JSON.stringify(payload) }, false);
};

export const getAllOrgInvitations = (params: GetOrgInvitationsParams) => {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<OrgInvitationsPayload>(`/organisation/invitations?${query.toString()}`, { method: "GET" });
};

export const resendOrgInvitation = ({ invitationId }: { invitationId: string }) => {
    return apiFetch(`/organisation/invite/${invitationId}/resend`, { method: "POST" }, false);
};

export const cancelOrgInvitation = ({ invitationId }: { invitationId: string }) => {
    return apiFetch(`/organisation/invite/${invitationId}/cancel`, { method: "PATCH" }, false);
};
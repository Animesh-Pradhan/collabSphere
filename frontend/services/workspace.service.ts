import { GetWorkspaceMembersParams, UpdateWorkspaceMemberRolePayload, WorkspaceMemberRole, WorkspaceMembersPayload } from "@/features/user/members/types/workspaceMembers.type";
import { AddWorkspaceMemberPayload, AddWorkspacePayload, UpdateWorkspacePayload } from "@/features/user/workspaces/types/types";
import { GetWorkspaceParams, WorkspacePayload } from "@/features/user/workspaces/types/types";
import { apiFetch } from "@/libs/apiFetch";

export const fetchMyWorkspaces = (params: GetWorkspaceParams) => {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.type) query.append("type", params.type);
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<WorkspacePayload>(`/workspace?${query.toString()}`, { method: "GET" });
};

export const fetchAllOrganisationWorkspaces = (params: GetWorkspaceParams) => {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.type) query.append("type", params.type);
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<WorkspacePayload>(`/workspace/all?${query.toString()}`, {
        method: "GET"
    });
};

export const createWorkspace = ({ name, description, isDefault }: AddWorkspacePayload) => {
    const payload: { name: string; description?: string, isDefault?: boolean; } = { name };
    if (description) payload.description = description;
    if (isDefault) payload.isDefault = isDefault;

    return apiFetch(`/workspace`, { method: "POST", body: JSON.stringify(payload) }, false);
};

export const updateWorkspace = ({ workspaceId, name, description, isDefault, writeQuota, readQuota, status }: UpdateWorkspacePayload) => {
    const payload: any = {};

    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (isDefault !== undefined) payload.isDefault = isDefault;
    if (writeQuota !== undefined) payload.writeQuota = writeQuota;
    if (readQuota !== undefined) payload.readQuota = readQuota;
    if (status !== undefined) payload.status = status;

    return apiFetch(`/workspace/${workspaceId}`, { method: "PATCH", body: JSON.stringify(payload) });
};

export const deleteWorkspace = ({ workspaceId }: { workspaceId: string }) => {
    return apiFetch(`/workspace/${workspaceId}`, { method: "DELETE" });
};

export const addWorkspaceMembers = ({ workspaceId, userIds, emails, source = "internal" }: AddWorkspaceMemberPayload) => {
    const query = new URLSearchParams();
    query.append("source", source);

    const payload: { workspaceId: string; userIds?: string[]; emails?: string[]; } = { workspaceId };
    if (userIds?.length) payload.userIds = userIds;
    if (emails?.length) payload.emails = emails;

    return apiFetch(`/workspace/add-member?${query.toString()}`, { method: "POST", body: JSON.stringify(payload) });
};

export const fetchWorkspaceMembers = ({ workspaceId, page, limit, search, role, status, source, fromDate, toDate, sortBy, order }: GetWorkspaceMembersParams) => {
    const query = new URLSearchParams();

    query.append("page", String(page));
    query.append("limit", String(limit));

    if (search) query.append("search", search);
    if (role) query.append("role", role);
    if (status) query.append("status", status);
    if (source) query.append("source", source);
    if (fromDate) query.append("fromDate", fromDate);
    if (toDate) query.append("toDate", toDate);
    if (sortBy) query.append("sortBy", sortBy);
    if (order) query.append("order", order);

    return apiFetch<WorkspaceMembersPayload>(`/workspace/${workspaceId}/members?${query.toString()}`, { method: "GET" });
};

export const updateWorkspaceMemberRole = ({ workspaceId, memberId, role }: UpdateWorkspaceMemberRolePayload) => {
    return apiFetch(`/workspace/${workspaceId}/update-member-role/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });
};

export const removeWorkspaceMember = ({ workspaceId, memberId }: { workspaceId: string, memberId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/remove-member/${memberId}`, { method: "DELETE" });
};

export const leaveWorkspace = ({ workspaceId }: {
    workspaceId: string,
}) => {
    return apiFetch(`/workspace/${workspaceId}/leave-workspace`, {
        method: "DELETE",
    });
};
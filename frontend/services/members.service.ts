import { apiFetch } from "@/libs/apiFetch";
import { OrgMembersPayload, GetOrgMembersParams } from "@/features/user/members/types";

export function getOrgMembers(params: GetOrgMembersParams) {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.role) query.append("role", params.role);
    if (params.status) query.append("status", params.status);
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<OrgMembersPayload>(`/user/org-users?${query.toString()}`, { method: "GET" });
}
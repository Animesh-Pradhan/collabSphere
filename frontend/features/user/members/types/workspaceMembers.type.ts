import { WorkspaceMember } from "@/store/members/workspaceMembers.store";
import { BaseQueryParams } from "@/types/api";

export enum WorkspaceMemberRole {
    OWNER = "OWNER",
    COMMENTER = "COMMENTER",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
}

export enum WorkspaceMemberStatus {
    ACTIVE = "ACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED",
    REMOVED = "REMOVED",
    LEFT = "LEFT",
}

export enum WorkspaceMemberSource {
    INTERNAL = "internal",
    EXTERNAL = "external",
}

export interface WorkspaceMembersPayload {
    workspacesMembers: WorkspaceMember[];
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export type GetWorkspaceMembersParams = BaseQueryParams & {
    workspaceId: string;
    role?: WorkspaceMemberRole | null;
    status?: WorkspaceMemberStatus | null;
    source?: WorkspaceMemberSource | null;
};

export interface UpdateWorkspaceMemberRolePayload {
    workspaceId: string,
    memberId: string,
    role: WorkspaceMemberRole
}

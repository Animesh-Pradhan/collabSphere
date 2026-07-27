import { Workspace } from "@/store/workspaces/workspaces.store";
import { BaseQueryParams } from "@/types/api";

export interface WorkspacePayload {
    workspaces: Workspace[],
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export enum WorkspaceType {
    ORGANISATION = "ORG",
    PERSONAL = "PERSONAL"
}
export enum WorkspaceStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    LOCKED = "locked",
}

export type GetWorkspaceParams = BaseQueryParams & {
    type?: WorkspaceType | null;
    status?: WorkspaceStatus | null;
};

export type AddWorkspacePayload = {
    name: string;
    description?: string;
    isDefault?: boolean
}

export type UpdateWorkspacePayload = {
    workspaceId: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    writeQuota?: number;
    readQuota?: number;
    status?: string;
}

export type AddWorkspaceMemberPayload = {
    workspaceId: string;
    userIds?: string[];
    emails?: string[];
    source?: "internal" | "external";
}

export type WorkspaceMember = BaseQueryParams & {
    type?: WorkspaceType | null;
    status?: WorkspaceStatus | null;
};
import { BaseQueryParams } from "@/types/api";
import { DocumentContent } from "./blockTypes";

export enum DocumentStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED",
}
export interface DocumentMetadata {
    tags?: string[];
    [key: string]: any;
}

export interface DocumentMember {
    id: string;
    role: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string | null;
    };
}

export type Documents = {
    id: string;
    workspaceId: string;
    title: string;
    description: string | null;
    status: DocumentStatus;
    currentVersion: number;
    createdBy: string;
    updatedBy: string | null;
    lockedBy: string | null;
    lockedAt: string | null;
    publishedAt: string | null;
    metadata: DocumentMetadata | null;
    createdAt: string;
    updatedAt: string;
    createdMember: DocumentMember;
    updatedMember: DocumentMember | null;
    lockedMember: DocumentMember | null;
    isFavorite: boolean;
    _count: { documentComments: number; documentVersions: number; };
}

export type GetDocumentParams = BaseQueryParams & {
    activeWorkspaceId: string;
    locked?: boolean | null;
    status?: DocumentStatus | null;
    favorite?: boolean;
};

export interface CreateDocumentPayload {
    workspaceId: string;
    document: {
        title: string;
        description?: string | null;
        content: DocumentContent;
        metadata?: DocumentMetadata;
    }
}

export interface UpdateDocumentPayload {
    workspaceId: string;
    documentId: string;
    document: {
        title?: string;
        description?: string;
        content?: DocumentContent;
    };
}

export interface DocumentDetails {
    id: string;
    workspaceId: string;
    title: string;
    description: string | null;
    status: DocumentStatus;
    createdBy: string;
    updatedBy: string | null;
    currentVersion: number;
    lockedBy: string | null;
    lockedAt: string | null;
    metadata: DocumentMetadata | null;
    aiContext: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    deletedAt: string | null;
    draftContent: DocumentContent | null;
    draftUpdatedAt: string | null;
    content: DocumentContent;
    hasDraft: boolean;
    isFavorite: boolean;
}
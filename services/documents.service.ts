import { CreateDocumentPayload, DocumentDetails, GetDocumentParams, UpdateDocumentPayload } from "@/features/user/documents/types/types";
import { apiFetch } from "@/libs/apiFetch";
import { DocumentPayload } from "@/store/documents/documents.store";

export const fetchWorkspaceDocuments = ({ params }: { params: GetDocumentParams }) => {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.locked) query.append("locked", "true");
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);
    if (params.favorite) query.append("favorite", "true");

    return apiFetch<DocumentPayload>(`/workspace/${params.activeWorkspaceId}/document?${query.toString()}`, { method: "GET" });
};

export const fetchRecentWorkspaceDocuments = ({ params }: { params: GetDocumentParams }) => {
    const query = new URLSearchParams();

    query.append("page", String(params.page));
    query.append("limit", String(params.limit));

    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.locked) query.append("locked", "true");
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);

    return apiFetch<DocumentPayload>(`/workspace/${params.activeWorkspaceId}/document/recent?${query.toString()}`, { method: "GET" });
};


export const addWorkspaceDocument = ({ workspaceId, document }: CreateDocumentPayload) => {
    const payload = {
        title: document.title,
        description: document.description,
        content: document.content,
        metadata: document.metadata,
    };

    return apiFetch(`/workspace/${workspaceId}/document`, { method: "POST", body: JSON.stringify(payload) });
}

export const updateWorkspaceDocument = ({ workspaceId, documentId, document }: UpdateDocumentPayload) => {
    const payload = {
        ...(document.title !== undefined && { title: document.title }),
        ...(document.description !== undefined && { description: document.description }),
        ...(document.content !== undefined && { content: document.content }),
    };

    return apiFetch(`/workspace/${workspaceId}/document/${documentId}`, { method: "PATCH", body: JSON.stringify(payload) });
};

export const deleteWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}`, { method: "DELETE" });
};

export const publishWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/publish`, { method: "POST" });
};

export const archiveWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/archive`, { method: "POST" });
};

export const restoreWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/restore`, { method: "POST" });
};

export const lockWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/lock`, { method: "POST" });
};

export const unlockWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/unlock`, { method: "POST" });
};

export const duplicateWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/duplicate`, { method: "POST" });
};

export const favoriteWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/favorite`, { method: "POST" });
};

export const unfavoriteWorkspaceDocument = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch(`/workspace/${workspaceId}/document/${documentId}/favorite`, { method: "DELETE" });
};

export const getDocumentDetails = ({ workspaceId, documentId }: { workspaceId: string, documentId: string }) => {
    return apiFetch<DocumentDetails>(`/workspace/${workspaceId}/document/${documentId}`, { method: "GET" });
};
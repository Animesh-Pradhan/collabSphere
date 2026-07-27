import { DocumentPayload, useDocumentsStore } from "@/store/documents/documents.store";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { CreateDocumentPayload, DocumentDetails, GetDocumentParams, UpdateDocumentPayload } from "../types/types";
import { useAppMutation, useAppQuery } from "@/hooks";
import { addWorkspaceDocument, archiveWorkspaceDocument, deleteWorkspaceDocument, duplicateWorkspaceDocument, favoriteWorkspaceDocument, fetchRecentWorkspaceDocuments, fetchWorkspaceDocuments, getDocumentDetails, lockWorkspaceDocument, publishWorkspaceDocument, restoreWorkspaceDocument, unfavoriteWorkspaceDocument, unlockWorkspaceDocument, updateWorkspaceDocument } from "@/services/documents.service";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "@/types/api";
import { showToast } from "@/libs/showToaster";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";

export const useDocumentsQuery = () => {
    const { activeWorkspace } = useWorkspacesStore();
    const { view, page, limit, search, status, locked, fromDate, toDate, sortBy, order, setDocuments } = useDocumentsStore();

    const params: GetDocumentParams = { activeWorkspaceId: activeWorkspace?.id ?? "", page, limit, search, status, locked, fromDate, toDate, sortBy, order, ...(view === "favorite" && { favorite: true }) };
    const fetcher = view === "recent" ? fetchRecentWorkspaceDocuments : fetchWorkspaceDocuments;

    const documentsQuery = useAppQuery<DocumentPayload>(
        ["documents", view, activeWorkspace?.id, page, limit, search, status, locked, fromDate, toDate, sortBy, order],
        async () => {
            const res = await fetcher({ params });
            return res.data;
        },
        { enabled: !!activeWorkspace?.id, placeholderData: keepPreviousData }
    );

    useEffect(() => {
        if (documentsQuery.data) {
            setDocuments(documentsQuery.data.documents);
        }
    }, [documentsQuery.data, setDocuments]);

    return {
        loading: documentsQuery.isLoading,
        isFetching: documentsQuery.isFetching,
        data: documentsQuery.data?.documents ?? [],
        meta: documentsQuery.data?.meta ?? null,
        error: documentsQuery.error?.message ?? null,
        refetchWorkspaceMembers: documentsQuery.refetch,
    };
};

export const useAddDocuments = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, CreateDocumentPayload, ApiError>(
        addWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Members Added", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error) => showToast("error", "Failed", error.message),
        }
    )


    return {
        addWorkspaceDocument: (payload: CreateDocumentPayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
}

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, UpdateDocumentPayload, ApiError>(
        updateWorkspaceDocument,
        {
            onSuccess: (response, variables) => {
                showToast("success", "Updated", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
                queryClient.invalidateQueries({ queryKey: ["document", variables.workspaceId, variables.documentId] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        updateWorkspaceDocument: (payload: UpdateDocumentPayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        deleteWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Deleted", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        deleteWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useArchiveDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        archiveWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Archived", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        archiveWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useRestoreDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        restoreWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Restored", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        restoreWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const usePublishDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        publishWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Restored", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        publishWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useLockDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        lockWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Locked", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        lockWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useUnlockDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        unlockWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Unlocked", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        unlockWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useDuplicateDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        duplicateWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Duplicated", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        duplicateWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useFavoriteDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        favoriteWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Favorited", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        favoriteWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useUnfavoriteDocument = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string; }, { workspaceId: string, documentId: string }, ApiError>(
        unfavoriteWorkspaceDocument,
        {
            onSuccess: (response) => {
                showToast("success", "Removed from favorites", response.message);
                queryClient.invalidateQueries({ queryKey: ["documents"] });
            },
            onError: (error: ApiError) => showToast("error", "Failed", error.message),
        }
    );

    return {
        unfavoriteWorkspaceDocument: (payload: { workspaceId: string, documentId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useAutosaveDocument = () => {
    const autosaveWorkspaceDocument = async (payload: { workspaceId: string; documentId: string; content: any }) => {
        console.log("[autosave stub]", payload);
        return Promise.resolve();
    };

    return {
        autosaveWorkspaceDocument,
        loading: false,
    };
};

export const useDocumentDetails = ({ workspaceId, documentId }: { workspaceId: string; documentId: string }) => {
    const setDocument = useDocumentEditorStore((s) => s.setDocument);

    const query = useAppQuery<DocumentDetails>(["document", workspaceId, documentId], async () => {
        const res = await getDocumentDetails({ workspaceId, documentId });
        return res.data;
    }, { enabled: !!workspaceId && !!documentId });

    useEffect(() => {
        if (query.data) setDocument(query.data);
    }, [query.data, setDocument]);

    return {
        document: query.data ?? null,
        loading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error?.message ?? null,
        refetch: query.refetch,
    };
};
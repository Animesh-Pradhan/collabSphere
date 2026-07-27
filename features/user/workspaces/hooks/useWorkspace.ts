import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks";
import { AddWorkspacePayload, UpdateWorkspacePayload } from "../types/types";
import { ApiError } from "@/types/api";
import { createWorkspace, deleteWorkspace, updateWorkspace } from "@/services/workspace.service";
import { showToast } from "@/libs/showToaster";


export const useAddWokspace = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, AddWorkspacePayload, ApiError>(createWorkspace, {
        onSuccess: (response) => {
            showToast("success", "Workspace Created", response.message);
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
        },
        onError: (error) => showToast("error", "Creation Failed", error.message),
    });

    return {
        inviteMember: (payload: AddWorkspacePayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
}

export const useUpdateWokspace = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, UpdateWorkspacePayload, ApiError>(updateWorkspace, {
        onSuccess: (response) => {
            showToast("success", "Workspace Updated", response.message);

            queryClient.setQueriesData({ queryKey: ["workspaces"] }, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    workspaces: old.workspaces.map((w: any) => w.id === response.data.id ? { ...w, ...response.data } : w),
                };
            });
        },
        onError: (error) => showToast("error", "Creation Failed", error.message),
    });

    return {
        inviteMember: (payload: UpdateWorkspacePayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
}

export const useDeleteWorkspace = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, { workspaceId: string }, ApiError>(deleteWorkspace, {
        onSuccess: (response) => {
            showToast("success", "Workspace Deleted", response.message);
            queryClient.setQueriesData({ queryKey: ["workspaces"] }, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    workspaces: old.workspaces.filter((w: any) => !response.data.includes(w.id)),
                    meta: {
                        ...old.meta,
                        totalItems: old.meta.totalItems - response.data.length,
                    },
                };
            });

            // queryClient.invalidateQueries({ queryKey: ["org-members"] });
        },
        onError: (error) => showToast("error", "Delete Failed", error.message),
    });

    return {
        deleteMember: (payload: { workspaceId: string }) => mutation.mutate(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

// export const useAddWokspace = () => {
//     const mutation = useAppMutation<{ data: any; message: string }, AddWorkspacePayload, ApiError>(createWorkspace, {
//         onSuccess: (response) => showToast("success", "Workspace Created", response.message),
//         onError: (error) => showToast("error", "Creation Failed", error.message),
//     });

//     return {
//         inviteMember: (payload: AddWorkspacePayload) => mutation.mutateAsync(payload),
//         loading: mutation.isPending,
//         error: mutation.error?.message ?? null,
//         resetError: mutation.reset,
//     };
// }
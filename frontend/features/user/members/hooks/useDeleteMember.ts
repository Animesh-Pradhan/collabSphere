import { useQueryClient } from "@tanstack/react-query";
import { deleteOrgMember } from "@/services/members.service";
import { ApiError } from "@/types/api";
import { useAppMutation } from "@/hooks";
import { showToast } from "@/libs/showToaster";

export const useDeleteMember = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: string[]; message: string }, { memberIds: string[] }, ApiError>(deleteOrgMember, {
        onSuccess: (response) => {
            showToast("success", "Member Deleted", response.message);
            queryClient.setQueriesData({ queryKey: ["org-members"] }, (old: any) => {
                if (!old) return old;
                console.log(old.members.filter((m: any) => m.id !== response.data), response.data);

                return {
                    ...old,
                    members: old.members.filter((m: any) => !response.data.includes(m.id)),
                    meta: { ...old.meta, totalItems: old.meta.totalItems - response.data.length },
                };
            });

            // queryClient.invalidateQueries({ queryKey: ["org-members"] });
        },
        onError: (error) => showToast("error", "Delete Failed", error.message),
    });

    return {
        deleteMember: (payload: { memberIds: string[] }) => mutation.mutate(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};
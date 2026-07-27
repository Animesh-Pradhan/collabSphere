import { useQueryClient } from "@tanstack/react-query";
import { updateOrgMember } from "@/services/members.service";
import { ApiError } from "@/types/api";
import { useAppMutation } from "@/hooks";
import { showToast } from "@/libs/showToaster";

export type UpdateMemberResponse = {
    data: {
        id: string;
        role: string;
        status: string;
    };
    message: string;
};

export type UpdateMemberPayload = {
    memberId: string;
    role?: string;
    status?: string;
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<UpdateMemberResponse, UpdateMemberPayload, ApiError>(updateOrgMember, {
        onSuccess: (response) => {
            showToast("success", "Member Updated", response.message);

            queryClient.setQueriesData({ queryKey: ["org-members"] }, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    members: old.members.map((m: any) => m.id === response.data.id ? { ...m, role: response.data.role, status: response.data.status } : m),
                };
            });
        },

        onError: (error) => showToast("error", "Update Failed", error.message),
    });

    return {
        updateMember: (payload: { memberId: string; role: string; status: string }) => mutation.mutate(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};
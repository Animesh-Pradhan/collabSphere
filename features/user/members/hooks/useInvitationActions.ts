import { useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/hooks";
import { showToast } from "@/libs/showToaster";
import { resendOrgInvitation, cancelOrgInvitation } from "@/services/members.service";
import { ApiError } from "@/types/api";
import { InviteStatus } from "../types/invitation.type";


export const useInvitationActions = () => {
    const queryClient = useQueryClient();

    const resendMutation = useAppMutation<{ data: any; message: string }, { invitationId: string }, ApiError>(resendOrgInvitation, {
        onSuccess: (response) => {
            showToast("success", "Invitation Resent", response.message);
            queryClient.invalidateQueries({ queryKey: ["org-invitations"] });
        },
        onError: (error) => showToast("error", "Resend Failed", error.message)
    });

    const cancelMutation = useAppMutation<{ data: any; message: string }, { invitationId: string }, ApiError>(cancelOrgInvitation, {
        onSuccess: (response) => {
            showToast("success", "Invitation Cancelled", response.message);
            queryClient.setQueriesData({ queryKey: ["org-invitation"] }, (old: any) => {
                if (!old) return old;

                return {
                    ...old,
                    invitations: old.invitations.map((inv: any) => inv.id === response.data.id ? { ...inv, status: InviteStatus.CANCELLED } : inv),
                };
            });
        },
        onError: (error) =>
            showToast("error", "Cancel Failed", error.message)
    });

    return {
        resendInvite: (payload: { invitationId: string }) => resendMutation.mutateAsync(payload),
        cancelInvite: (payload: { invitationId: string }) => cancelMutation.mutateAsync(payload),

        loadingResend: resendMutation.isPending,
        loadingCancel: cancelMutation.isPending,

        errorResend: resendMutation.error?.message ?? null,
        errorCancel: cancelMutation.error?.message ?? null
    };
};
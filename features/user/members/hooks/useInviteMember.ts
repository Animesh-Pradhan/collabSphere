import { inviteOrgMember } from "@/services/members.service";
import { ApiError } from "@/types/api";
import { useAppMutation } from "@/hooks";
import { showToast } from "@/libs/showToaster";

type InvitationPayload = {
    email: string
    role?: string
}

export const useInviteMember = () => {
    const mutation = useAppMutation<{ data: any; message: string }, InvitationPayload, ApiError>(inviteOrgMember, {
        onSuccess: (response) => showToast("success", "Invitation Sent", response.message),
        onError: (error) => showToast("error", "Invite Failed", error.message),
    });

    return {
        inviteMember: (payload: InvitationPayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};
import { useAppQuery } from "@/hooks";
import { useInvitationsStore } from "@/store/members/invitation.store";
import { OrgInvitationsPayload } from "../types/invitation.type";
import { getAllOrgInvitations } from "@/services/members.service";
import { keepPreviousData } from "@tanstack/react-query";

export const useInvitationMember = () => {

    const { page, limit, search, order, sortBy, fromDate, toDate, status } = useInvitationsStore();

    const invitationQuery = useAppQuery<OrgInvitationsPayload>(["org-invitation", page, limit, search, order, sortBy, fromDate, toDate, status], async () => {
        const res = await getAllOrgInvitations({ page, limit, search, status, fromDate, toDate, sortBy, order })
        return res.data;
    }, {
        placeholderData: keepPreviousData,
    })

    return {
        loading: invitationQuery.isLoading,
        isFetching: invitationQuery.isFetching,
        data: invitationQuery.data?.invitations ?? [],
        meta: invitationQuery.data?.meta ?? null,
        error: invitationQuery.error?.message ?? null,
        refetchMembers: invitationQuery.refetch,
    }

}
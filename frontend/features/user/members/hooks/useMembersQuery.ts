import { useAppQuery } from "@/hooks";
import { getOrgMembers } from "@/services/members.service";
import { useMembersStore } from "@/store/members/membes.store"
import { keepPreviousData } from "@tanstack/react-query";
import { OrgMembersPayload } from "../types";
import { useEffect } from "react";

export const useMembersQuery = () => {
    const { page, limit, search, order, sortBy, fromDate, toDate, role, status, setMembers } = useMembersStore();

    const membersQuery = useAppQuery<OrgMembersPayload>(["org-members", page, limit, search, role, status, fromDate, toDate, sortBy, order], async () => {
        const res = await getOrgMembers({ page, limit, search, role, status, fromDate, toDate, sortBy, order });
        return res.data;
    }, {
        placeholderData: keepPreviousData,
    });

    useEffect(() => {
        if (membersQuery.data) {
            setMembers(membersQuery.data.members, membersQuery.data.meta)
        }
    }, [membersQuery.data, setMembers])

    return {
        loading: membersQuery.isLoading,
        isFetching: membersQuery.isFetching,
        data: membersQuery.data?.members ?? [],
        meta: membersQuery.data?.meta ?? null,
        error: membersQuery.error?.message ?? null,
        refetchMembers: membersQuery.refetch,
    }
}
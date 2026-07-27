import { useAppQuery } from "@/hooks"
import { fetchMyWorkspaces, fetchAllOrganisationWorkspaces } from "@/services/workspace.service"
import { useEffect } from "react"
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store"
import { WorkspacePayload, WorkspaceType } from "../types/types"
import { keepPreviousData } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"

type WorkspaceTab = "MY" | "ALL";

export const useWorkspacesQuery = (tab: WorkspaceTab) => {
    const { context } = useAuthStore();
    const { page, limit, search, status, type, order, sortBy, fromDate, toDate, setWorkspaces } = useWorkspacesStore()
    const params = { page, limit, search, status, type: type as WorkspaceType, fromDate, toDate, sortBy, order };

    const workspacesQuery = useAppQuery<WorkspacePayload>(["workspaces", tab, context?.mode, page, limit, search, status, type, fromDate, toDate, sortBy, order], async () => {
        const res = (tab === "ALL" && context?.mode === "ORG") ? await fetchAllOrganisationWorkspaces(params) : await fetchMyWorkspaces(params);
        return res.data
    }, { placeholderData: keepPreviousData })

    useEffect(() => {
        if (workspacesQuery.data) {
            setWorkspaces(workspacesQuery.data.workspaces);
        }
    }, [workspacesQuery.data, setWorkspaces]);

    return {
        loading: workspacesQuery.isLoading,
        isFetching: workspacesQuery.isFetching,
        data: workspacesQuery.data?.workspaces ?? [],
        meta: workspacesQuery.data?.meta ?? null,
        error: workspacesQuery.error?.message ?? null,
        refetchWorkspaces: workspacesQuery.refetch,
    }
}
"use client";

import { useWorkspaceMembersStore } from "@/store/members/workspaceMembers.store";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { GetWorkspaceMembersParams, UpdateWorkspaceMemberRolePayload, WorkspaceMembersPayload } from "../types/workspaceMembers.type";
import { useAppMutation, useAppQuery } from "@/hooks";
import { addWorkspaceMembers, fetchWorkspaceMembers, leaveWorkspace, removeWorkspaceMember, updateWorkspaceMemberRole } from "@/services/workspace.service";
import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { showToast } from "@/libs/showToaster";
import { AddWorkspaceMemberPayload } from "../../workspaces/types/types";
import { ApiError } from "@/types/api";

export const useWorkspaceMembersQuery = () => {
    const { activeWorkspace } = useWorkspacesStore();
    const { page, limit, search, role, status, source, fromDate, toDate, sortBy, order, setWorkspaceMembers } = useWorkspaceMembersStore();

    const params: GetWorkspaceMembersParams = { workspaceId: activeWorkspace?.id ?? "", page, limit, search, role, status, source, fromDate, toDate, sortBy, order };

    const workspaceMembersQuery = useAppQuery<WorkspaceMembersPayload>(
        ["workspace-members", activeWorkspace?.id, page, limit, search, role, status, source, fromDate, toDate, sortBy, order],
        async () => {
            const res = await fetchWorkspaceMembers(params);
            return res.data;
        },
        { enabled: !!activeWorkspace?.id, placeholderData: keepPreviousData }
    );

    useEffect(() => {
        if (workspaceMembersQuery.data) {
            setWorkspaceMembers(workspaceMembersQuery.data.workspacesMembers);
        }
    }, [workspaceMembersQuery.data, setWorkspaceMembers]);

    return {
        loading: workspaceMembersQuery.isLoading,
        isFetching: workspaceMembersQuery.isFetching,
        data: workspaceMembersQuery.data?.workspacesMembers ?? [],
        meta: workspaceMembersQuery.data?.meta ?? null,
        error: workspaceMembersQuery.error?.message ?? null,
        refetchWorkspaceMembers: workspaceMembersQuery.refetch,
    };
};

export const useAddWorkspaceMembers = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, AddWorkspaceMemberPayload, ApiError>(
        addWorkspaceMembers,
        {
            onSuccess: (response) => {
                showToast("success", "Members Added", response.message);
                queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
            },
            onError: (error) => showToast("error", "Failed", error.message),
        }
    );

    return {
        addWorkspaceMembers: (payload: AddWorkspaceMemberPayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useUpdateWorkspaceMemberRole = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, UpdateWorkspaceMemberRolePayload, ApiError>(
        updateWorkspaceMemberRole,
        {
            onSuccess: (response) => {
                showToast("success", "Role Updated", response.message);
                queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
            },
            onError: (error) => showToast("error", "Update Failed", error.message),
        }
    );

    return {
        updateWorkspaceMemberRole: (payload: UpdateWorkspaceMemberRolePayload) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useRemoveWorkspaceMember = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, { workspaceId: string, memberId: string }, ApiError>(
        removeWorkspaceMember,
        {
            onSuccess: (response) => {
                showToast("success", "Member Removed", response.message);
                queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
            },
            onError: (error) => showToast("error", "Remove Failed", error.message),
        }
    );

    return {
        removeWorkspaceMember: (payload: { workspaceId: string, memberId: string }) => mutation.mutate(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};

export const useLeaveWorkspace = () => {
    const queryClient = useQueryClient();

    const mutation = useAppMutation<{ data: any; message: string }, { workspaceId: string }, ApiError>(
        leaveWorkspace,
        {
            onSuccess: (response) => {
                showToast("success", "Workspace Left", response.message);
                queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
            },
            onError: (error) => showToast("error", "Failed", error.message),
        }
    );

    return {
        leaveWorkspace: (payload: { workspaceId: string }) => mutation.mutateAsync(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
};
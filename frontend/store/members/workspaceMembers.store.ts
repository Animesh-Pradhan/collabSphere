import { WorkspaceMemberSource, WorkspaceMemberStatus, WorkspaceMemberRole } from "@/features/user/members/types/workspaceMembers.type";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const isDev = process.env.NODE_ENV === "development";

export type WorkspaceMember = {
    id: string;
    role: WorkspaceMemberRole;
    status: WorkspaceMemberStatus;
    source: WorkspaceMemberSource;

    invitedAt: string | null;
    joinedAt: string | null;
    lastActiveAt: string | null;

    externalId: string | null;

    user: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        avatar: string | null;
        mobileNo: string | null;
    };
};

export interface WorkspaceMembersState {
    workspaceMembers: WorkspaceMember[];
    selectedMember: WorkspaceMember | null;

    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;

    search: string;
    role?: WorkspaceMemberRole | null;
    status?: WorkspaceMemberStatus | null;
    source?: WorkspaceMemberSource | null;
    fromDate: string | null;
    toDate: string | null;
    sortBy: string;
    order: "asc" | "desc";

    setWorkspaceMembers: (workspaceMembers: WorkspaceMember[]) => void;
    setPagination: (page: number, limit: number) => void;
    setFilters: (
        payload: Partial<
            Pick<
                WorkspaceMembersState,
                "search" | "role" | "status" | "source" | "fromDate" | "toDate"
            >
        >
    ) => void;
    setSorting: (sortBy: string, order: "asc" | "desc") => void;

    clearWorkspaceMembersState: () => void;
}

export const useWorkspaceMembersStore = create<WorkspaceMembersState>()(
    devtools(
        (set) => ({
            workspaceMembers: [],

            page: 1,
            limit: 20,
            search: "",
            role: null,
            status: null,
            source: null,
            fromDate: null,
            toDate: null,
            sortBy: "joinedAt",
            order: "desc",

            setWorkspaceMembers: (workspaceMembers) => set({ workspaceMembers }),
            setPagination: (page, limit) => set({ page, limit }),
            setFilters: (payload) =>
                set((state) => ({
                    ...state,
                    ...payload,
                    page: 1,
                })),
            setSorting: (sortBy, order) => set({ sortBy, order }),

            clearWorkspaceMembersState: () =>
                set({
                    workspaceMembers: [],
                    page: 1,
                    limit: 20,
                    search: "",
                    role: null,
                    status: null,
                    source: null,
                    fromDate: null,
                    toDate: null,
                    sortBy: "joinedAt",
                    order: "desc",
                }),
        }),
        {
            name: "WorkspaceMembersStore",
            enabled: isDev,
        }
    )
);
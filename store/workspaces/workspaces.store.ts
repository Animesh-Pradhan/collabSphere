import { WorkspaceStatus, WorkspaceType } from "@/features/user/workspaces/types/types";
import { create } from "zustand"
import { devtools } from "zustand/middleware";

const isDev = process.env.NODE_ENV === "development";

export interface Workspace {
    id: string;
    organisationId: string | null;
    ownerId: string;
    type: 'PERSONAL' | 'ORGANISATION';
    name: string;
    slug: string | null;
    description: string | null;
    isDefault: boolean;
    status: 'active' | 'archived' | 'locked';
    eventStreamKey: string | null;
    aiEnabled: boolean;
    aiContext: any | null;
    writeQuota: number | null;
    readQuota: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    archivedAt: string | null;
    organisation: { id: string; name: string; } | null;

    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar: string | null;
    };

    membership: {
        id: string;
        role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
        status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REMOVED' | 'LEFT';
        joinedAt: string;
        lastActiveAt: string | null;
    } | null;

    counts: {
        members: number;
        tasks: number;
        documents: number;
    };
};


export interface WorkspacesState {
    workspaces: Workspace[]
    activeWorkspace: Workspace | null

    page: number;
    limit: number;
    search: string;
    status?: WorkspaceStatus | null;
    type?: WorkspaceType | null;
    fromDate: string | null;
    toDate: string | null;
    sortBy: string;
    order: "asc" | "desc";

    setWorkspaces: (workspaces: Workspace[]) => void;
    setActiveWorkspace: (workspace: Workspace | null) => void;
    setPagination: (page: number, limit: number) => void;
    setFilters: (payload: Partial<Pick<WorkspacesState, "search" | "status" | "type" | "fromDate" | "toDate">>) => void;
    setSorting: (sortBy: string, order: "asc" | "desc") => void;

    clearWorkspacesState: () => void;
}

export const useWorkspacesStore = create<WorkspacesState>()(
    devtools(
        (set) => ({
            workspaces: [],
            activeWorkspace: null,
            mode: "MY",

            page: 1,
            limit: 20,
            search: "",
            status: null,
            type: null,
            fromDate: null,
            toDate: null,
            sortBy: "createdAt",
            order: "desc",

            setWorkspaces: (workspaces) => set({ workspaces }),
            setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
            setPagination: (page, limit) => set({ page, limit }),
            setFilters: (payload) => set((state) => ({ ...state, ...payload, page: 1 })),
            setSorting: (sortBy, order) => set({ sortBy, order }),
            clearWorkspacesState: () => set({ workspaces: [], activeWorkspace: null, page: 1, limit: 20, search: "", status: null, type: null, fromDate: null, toDate: null, sortBy: "createdAt", order: "desc" }),
        }),
        { name: "WorkspacesStore", enabled: isDev }
    )
);
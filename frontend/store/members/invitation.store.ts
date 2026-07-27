import { InviteStatus, OrganisationInvitation } from "@/features/user/members/types/invitation.type";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

const isDev = process.env.NODE_ENV === "development";

export type InvitationsState = {
    selectedInvitation: OrganisationInvitation | null;
    page: number;
    limit: number;
    search: string;
    status?: InviteStatus | null;

    fromDate: string | null;
    toDate: string | null;

    sortBy: string;
    order: "asc" | "desc";

    setSelectedInvitation: (invitation: OrganisationInvitation | null) => void;
    setPagination: (page: number, limit: number) => void;
    setFilters: (payload: Partial<Pick<InvitationsState, "search" | "status" | "fromDate" | "toDate">>) => void;
    setSorting: (sortBy: string, order: "asc" | "desc") => void;

    clearInvitationsState: () => void;
};

export const useInvitationsStore = create<InvitationsState>()(
    devtools(
        (set) => ({
            selectedInvitation: null,
            page: 1,
            limit: 20,
            search: "",
            status: null,
            fromDate: null,
            toDate: null,
            sortBy: "invitedAt",
            order: "desc",

            setSelectedInvitation: (invitation) => set({ selectedInvitation: invitation }),
            setPagination: (page, limit) => set({ page, limit }),
            setFilters: (payload) => set((state) => ({
                ...state,
                ...payload,
                page: 1
            })),
            setSorting: (sortBy, order) => set({ sortBy, order }),
            clearInvitationsState: () => set({
                selectedInvitation: null,
                page: 1,
                limit: 20,
                search: "",
                status: null,
                fromDate: null,
                toDate: null,
                sortBy: "invitedAt",
                order: "desc"
            }),
        }),
        { name: "InvitationsStore", enabled: isDev }
    )
);
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type OrganisationMember = {
    id: string;

    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;

    avatar: string | null;
    username: string;

    isEmailVerified: boolean;
    isMobileVerified: boolean;

    lastLoginAt: string | null;
    signupSource: "email" | "google" | "github" | "apple";

    twoFactorAuthentication: boolean;

    isOnboarded: boolean;
    onBoardingStep: number;

    createdAt: string;
    updatedAt: string;
};

type MembersState = {
    members: OrganisationMember[];
    selectedMember: OrganisationMember | null;

    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;

    search: string;
    role?: "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST" | null;
    status?: "ACTIVE" | "SUSPENDED" | "REMOVED" | null;
    fromDate: string | null;
    toDate: string | null;
    sortBy: string;
    order: "asc" | "desc";

    setMembers: (
        members: OrganisationMember[],
        meta: { totalItems: number; totalPages: number; page: number; limit: number; }
    ) => void;
    setSelectedMember: (member: OrganisationMember | null) => void;
    setPagination: (page: number, limit: number) => void;
    setFilters: (payload: Partial<Pick<MembersState, "search" | "role" | "status" | "fromDate" | "toDate">>) => void;
    setSorting: (sortBy: string, order: "asc" | "desc") => void;
    clearMembersState: () => void;
};

const isDev = process.env.NODE_ENV === "development";

export const useMembersStore = create<MembersState>()(
    devtools(
        (set) => ({
            members: [],
            selectedMember: null,

            page: 1,
            limit: 20,
            totalItems: 0,
            totalPages: 0,

            search: "",
            role: null,
            status: null,
            fromDate: null,
            toDate: null,

            sortBy: "createdAt",
            order: "desc",

            setMembers: (members, meta) => set({ members, totalItems: meta.totalItems, totalPages: meta.totalPages, page: meta.page, limit: meta.limit }),
            setSelectedMember: (member) => set({ selectedMember: member }),
            setPagination: (page, limit) => set({ page, limit }),
            setFilters: (payload) => set((state) => ({ ...state, ...payload, page: 1 })),
            setSorting: (sortBy, order) => set({ sortBy, order }),

            clearMembersState: () => set({
                members: [],
                selectedMember: null,

                page: 1,
                limit: 20,
                totalItems: 0,
                totalPages: 0,

                search: "",
                role: null,
                status: null,
                fromDate: null,
                toDate: null,

                sortBy: "createdAt",
                order: "desc",
            }),
        }),
        {
            name: "MembersStore",
            enabled: isDev,
        }
    )
);


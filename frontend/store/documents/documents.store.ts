import { Documents, DocumentStatus } from "@/features/user/documents/types/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


const isDev = process.env.NODE_ENV === "development";
export type DocumentView = "all" | "recent" | "favorite";

export interface DocumentsState {
    documents: Documents[]
    activeDocument: Documents | null

    view: DocumentView;
    locked: boolean | null;
    page: number;
    limit: number;
    search: string;
    status?: DocumentStatus | null;
    fromDate: string | null;
    toDate: string | null;
    sortBy: string;
    order: "asc" | "desc";

    setDocuments: (documents: Documents[]) => void;
    setView: (view: DocumentView) => void;
    setActiveDocument: (document: Documents | null) => void;
    setPagination: (page: number, limit: number) => void;
    setFilters: (payload: Partial<Pick<DocumentsState, "search" | "locked" | "status" | "fromDate" | "toDate">>) => void;
    setSorting: (sortBy: string, order: "asc" | "desc") => void;

    clearDocumentsState: () => void;
}

export const useDocumentsStore = create<DocumentsState>()(
    devtools(
        (set) => ({
            documents: [],
            activeDocument: null,

            view: "all",
            locked: false,
            page: 1,
            limit: 20,
            search: "",
            status: null,
            fromDate: null,
            toDate: null,
            sortBy: "createdAt",
            order: "desc",

            setDocuments: (documents) => set({ documents }),
            setActiveDocument: (document) => set({ activeDocument: document }),
            setView: (view) => set({ view, page: 1 }),
            setPagination: (page, limit) => set({ page, limit }),
            setFilters: (payload) => set((state) => ({ ...state, ...payload, page: 1 })),
            setSorting: (sortBy, order) => set({ sortBy, order }),
            clearDocumentsState: () => set({ documents: [], activeDocument: null, page: 1, limit: 20, search: "", status: null, fromDate: null, toDate: null, sortBy: "createdAt", order: "desc" }),
        }),
        { name: "DocumentsStore", enabled: isDev }
    )
);
export interface DocumentPayload {
    documents: Documents[],
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
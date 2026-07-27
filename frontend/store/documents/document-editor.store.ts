import { DocumentDetails } from "@/features/user/documents/types/types";
import { Editor } from "@tiptap/react";
import { create } from "zustand";

interface DocumentEditorStore {
    editor: Editor | null;
    setEditor: (editor: Editor | null) => void;

    document: DocumentDetails | null;
    setDocument: (document: DocumentDetails | null) => void;
    updateDocumentLocal: (patch: Partial<DocumentDetails>) => void;

    isSaving: boolean;
    setIsSaving: (isSaving: boolean) => void;

    lastSavedAt: Date | null;
    setLastSavedAt: (date: Date | null) => void;

    clearDocumentEditor: () => void;
}

export const useDocumentEditorStore = create<DocumentEditorStore>((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),

    document: null,
    setDocument: (document) => set({ document }),
    updateDocumentLocal: (patch) => set((state) => ({
        document: state.document ? { ...state.document, ...patch } : state.document,
    })),


    isSaving: false,
    setIsSaving: (isSaving) => set({ isSaving }),

    lastSavedAt: null,
    setLastSavedAt: (date) => set({ lastSavedAt: date }),

    clearDocumentEditor: () => set({ document: null, isSaving: false, lastSavedAt: null })
}));
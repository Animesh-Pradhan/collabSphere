"use client"

import { Flex, Spinner } from "@chakra-ui/react";
import DocumentEditorHeader from "../components/DocumentEditorHeader";
import DocumentEditorStatusBar from "../components/DocumentEditorStatusBar";
import DocumentEditorToolbar from "../components/DocumentEditorToolbar";
import DocumentEditor from "../components/DocumentEditor";
import { useParams } from "next/navigation";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";
import { useDocumentDetails } from "../hooks/useDocument";
import { useEffect } from "react";
import SpecialLoader from "../components/SpecialLoader";

export default function DocumentDetailsPage() {
    const { documentId } = useParams<{ documentId: string }>();
    const { activeWorkspace } = useWorkspacesStore();
    const clearDocumentEditor = useDocumentEditorStore((s) => s.clearDocumentEditor);

    const { loading } = useDocumentDetails({ workspaceId: activeWorkspace?.id ?? "", documentId });

    useEffect(() => {
        return () => clearDocumentEditor();
    }, [documentId, clearDocumentEditor]);

    if (loading) {
        return <SpecialLoader label="Loading document" />;
    }

    return (
        <Flex direction="column" h="100%" w="100%" overflow="hidden" bg="pallete.primary" borderRadius={'8px'}>
            <DocumentEditorHeader />
            <DocumentEditorToolbar />
            <Flex flex={1} overflow="hidden">
                <DocumentEditor />
            </Flex>
            <DocumentEditorStatusBar />
        </Flex>
    )
}
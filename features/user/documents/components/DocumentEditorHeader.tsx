import { UIIconButton } from "@/components/ui/custom";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { Badge, Flex, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline, IoShareOutline, IoStarOutline } from "react-icons/io5";
import { MdSave } from "react-icons/md";
import { useUpdateDocument } from "../hooks/useDocument";
import { tiptapToDocumentContent } from "../actions/helpers";

export default function DocumentEditorHeader() {
    const router = useRouter();
    const { editor, document, isSaving, lastSavedAt } = useDocumentEditorStore();
    const { activeWorkspace } = useWorkspacesStore();
    const { updateWorkspaceDocument, loading } = useUpdateDocument();

    const handleSave = () => {
        if (!editor || !document || !activeWorkspace) return;
        const content = tiptapToDocumentContent(editor.getJSON());

        updateWorkspaceDocument({ workspaceId: activeWorkspace.id, documentId: document.id, document: { content } });
    };


    if (!document) return null;
    return (
        <Flex align="center" justifyContent={'space-between'} px={2} py={1} bg={"pallete.surfaceElevated"} borderBottom="1px solid" borderColor="pallete.borderSubtle">
            <Flex align={'center'} gap={2}>
                <UIIconButton variant="ghost" _hover={{ transform: "translateX(-2px) translateY(-1px)" }} onClick={() => router.back()}><IoArrowBackOutline /></UIIconButton>
                <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>{document.title || "Untitled Document"}</Text>
                <Badge colorPalette="yellow">{document.status}</Badge>
                <Text fontSize="sm" color="text.secondary">{isSaving ? "Saving..." : lastSavedAt ? "✓ Saved" : ""}</Text>
            </Flex>

            <Flex gap={2}>
                <UIIconButton variant="ghost" _hover={{ transform: "scale(1.1)" }}><IoStarOutline /></UIIconButton>
                <UIIconButton variant="ghost" _hover={{ transform: "scale(1.1)" }}><IoShareOutline /></UIIconButton>
                <UIIconButton onClick={handleSave} loading={loading}><MdSave /></UIIconButton>
            </Flex>
        </Flex>
    )
}

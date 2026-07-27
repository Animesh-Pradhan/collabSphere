"use client"

import { Box, Drawer, Flex, Portal, Spacer, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuList, LuX } from "react-icons/lu";
import { UIIconButton } from "@/components/ui/custom";
import DocumentCharacterCounter from "./TipTap/DocumentCharacterCounter";
import DocumentOutline from "./TipTap/DocumentOutline";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";

export default function DocumentEditorStatusBar() {
    const { editor } = useDocumentEditorStore();
    const [outlineOpen, setOutlineOpen] = useState(false);

    if (!editor) return null;

    return (
        <>
            <Flex justifyContent={'space-between'} align="center" h="35px" px={5} flexShrink={0} fontSize="xs"
                color="text.secondary" borderTop="1px solid" borderColor="pallete.borderSubtle"
            >
                <Flex align="center" gap={3}>
                    <Box cursor={'pointer'} onClick={() => setOutlineOpen(true)}>
                        <LuList size={16} />
                    </Box>

                    <Box w="1px" h="14px" bg="pallete.borderSubtle" />

                    <Text fontWeight="medium">Version 1</Text>
                </Flex>

                <Spacer />

                <DocumentCharacterCounter editor={editor} />
                <Text mx={3}>•</Text>
                <Text>0 min read</Text>
                <Text mx={3}>•</Text>
                <Flex align="center" gap={1}>
                    <Box w="5px" h="5px" borderRadius="full" bg="brand.500" />
                    <Text>Saved just now</Text>
                </Flex>
            </Flex>

            <Drawer.Root open={outlineOpen} onOpenChange={(e) => setOutlineOpen(e.open)} placement="end" size="sm">
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content bg="pallete.surfaceElevated">
                            <Drawer.Header borderBottom="1px solid" borderColor="pallete.borderSubtle">
                                <Drawer.Title fontSize="md" fontWeight="semibold" color="text.primary">
                                    Outline
                                </Drawer.Title>
                                <Drawer.CloseTrigger asChild>
                                    <UIIconButton btnType="none" size="xs" position="absolute" top={3} right={3}>
                                        <LuX size={16} />
                                    </UIIconButton>
                                </Drawer.CloseTrigger>
                            </Drawer.Header>

                            <Drawer.Body p={0}>
                                <DocumentOutline editor={editor} onNavigate={() => setOutlineOpen(false)} />
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    )
}
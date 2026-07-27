"use client"

import { Editor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Flex, Box, Text } from "@chakra-ui/react";
import { UIIconButton } from "@/components/ui/custom";
import { LuPlus, LuMinus, LuTrash2 } from "react-icons/lu";
import { useEffect, useState } from "react";
import { toolbarButtonStyle } from "../../styles/docToolbarButton.styles";

interface DocumentEditorTableMenuProps {
    editor: Editor;
    scrollContainer: HTMLElement;
}

export default function DocumentEditorTableMenu({ editor, scrollContainer }: DocumentEditorTableMenuProps) {
    const [visible, setVisible] = useState(false);

    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            canAddRow: ctx.editor?.can().addRowAfter() ?? false,
            canDeleteRow: ctx.editor?.can().deleteRow() ?? false,
            canAddColumn: ctx.editor?.can().addColumnAfter() ?? false,
            canDeleteColumn: ctx.editor?.can().deleteColumn() ?? false,
            canDeleteTable: ctx.editor?.can().deleteTable() ?? false,
        }),
    });

    useEffect(() => {
        const handleSelectionUpdate = ({ transaction }: { transaction: any }) => {
            if (!transaction.getMeta("pointer")) return;

            requestAnimationFrame(() => {
                setVisible(editor.isActive("table"));
            });
        };
        editor.on("selectionUpdate", handleSelectionUpdate);
        return () => { editor.off("selectionUpdate", handleSelectionUpdate); };
    }, [editor]);

    useEffect(() => {
        const handleUpdate = ({ transaction }: { transaction: any }) => {
            if (transaction.getMeta("pointer")) return;
            setVisible(false);
        };
        editor.on("update", handleUpdate);
        return () => { editor.off("update", handleUpdate); };
    }, [editor]);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(false);
        }
        scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }, [scrollContainer]);

    return (
        <BubbleMenu
            editor={editor}
            pluginKey="tableBubbleMenu"
            shouldShow={() => {
                return visible;
            }}
            options={{ placement: "top", offset: 8 }}
            hidden={!visible}
        >
            <Flex direction="column" gap={1} px={2} py={1.5} borderRadius="lg"
                bg="pallete.surfaceElevated" border="1px solid" borderColor="pallete.borderSubtle"
                boxShadow="0 4px 16px rgba(0,0,0,0.12)"
            >
                <Flex align="center" gap={2}>
                    <Text fontSize="xs" fontWeight="600" color="text.secondary" minW="50px">Rows</Text>
                    <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                        disabled={!editorState?.canAddRow}
                        aria-label="Add row"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                    >
                        <LuPlus size={14} />
                    </UIIconButton>
                    <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                        disabled={!editorState?.canDeleteRow}
                        aria-label="Remove row"
                        onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                        <LuMinus size={14} />
                    </UIIconButton>
                </Flex>

                <Flex align="center" gap={2}>
                    <Text fontSize="xs" fontWeight="600" color="text.secondary" minW="50px">Columns</Text>
                    <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                        disabled={!editorState?.canAddColumn}
                        aria-label="Add column"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                    >
                        <LuPlus size={14} />
                    </UIIconButton>
                    <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                        disabled={!editorState?.canDeleteColumn}
                        aria-label="Remove column"
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                    >
                        <LuMinus size={14} />
                    </UIIconButton>
                </Flex>

                <Box h="1px" bg="pallete.borderSubtle" my={0.5} />

                <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                    disabled={!editorState?.canDeleteTable}
                    aria-label="Delete table"
                    justifyContent="flex-start"
                    gap={2}
                    color="red.500"
                    _hover={{ bg: "red.50", color: "red.600" }}
                    onClick={() => editor.chain().focus().deleteTable().run()}
                >
                    <LuTrash2 size={14} /> <Text fontSize="xs">Delete Table</Text>
                </UIIconButton>
            </Flex>
        </BubbleMenu>
    );
}
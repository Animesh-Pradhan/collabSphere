"use client"

import { Editor, useEditorState } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import { UIIconButton, UIPopover } from "@/components/ui/custom";
import { LuPlus } from "react-icons/lu";
import { Box, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { toolbarButtonStyle } from "../../styles/docToolbarButton.styles";
import { getToolbarItem, ToolbarCommandId } from "../../config/toolbar.config";

interface DocumentEditorFloatingMenuProps {
    editor: Editor;
    scrollContainer: HTMLElement;
    isScrolling: boolean;
}

interface FloatingMenuSection {
    label: string;
    items: ToolbarCommandId[];
}

const FLOATING_MENU_SECTIONS: FloatingMenuSection[] = [
    { label: "Headings", items: ["heading1", "heading2", "heading3"] },
    { label: "Lists", items: ["bulletList", "orderedList", "taskList"] },
    { label: "Blocks", items: ["blockquote", "horizontalRule"] },
    { label: "Insert", items: ["image", "insertTable"] },
];

export default function DocumentEditorFloatingMenu({ editor, scrollContainer, isScrolling }: DocumentEditorFloatingMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const allItemIds = FLOATING_MENU_SECTIONS.flatMap((s) => s.items);

    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            const state: Record<string, { active: boolean; canRun: boolean }> = {};
            for (const id of allItemIds) {
                const item = getToolbarItem(id);
                state[id] = {
                    active: item.isActive?.(ctx.editor) ?? false,
                    canRun: item.canRun?.(ctx.editor) ?? true,
                };
            }
            return state;
        },
    });

    return (
        <FloatingMenu
            editor={editor}
            shouldShow={({ editor }) => {
                const { $from } = editor.state.selection;
                return (
                    editor.isFocused &&
                    editor.state.selection.empty &&
                    $from.parent.isTextblock &&
                    $from.parent.content.size === 0
                );
            }}
            options={{ placement: "left", offset: 8, scrollTarget: scrollContainer }}
        >
            <Box
                opacity={isScrolling ? 0 : 1}
                pointerEvents={isScrolling ? "none" : "auto"}
                transition={isScrolling ? "none" : "opacity 0.2s ease"}
            >
                <UIPopover placement="bottom-start" open={isOpen} onOpenChange={setIsOpen}
                    contentProps={{ w: "220px", maxH: "300px", overflowY: "auto", p: 1 }}
                    trigger={
                        <UIIconButton btnType="none" {...toolbarButtonStyle.base}
                            borderRadius="full" p={0} minW="24px" h="24px"
                            display="flex" alignItems="center" justifyContent="center"
                        >
                            <LuPlus size={14} />
                        </UIIconButton>
                    }
                >
                    <VStack gap={0} align="stretch">
                        {FLOATING_MENU_SECTIONS.map((section, sectionIndex) => (
                            <Box key={section.label}>
                                {sectionIndex > 0 && (<Box h="1px" bg="pallete.borderSubtle" my={1.5} mx={1} />)}

                                <Box px={2} py={1} fontSize="xs" fontWeight="600" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">{section.label}</Box>

                                {section.items.map((id) => {
                                    const item = getToolbarItem(id);
                                    const itemState = editorState?.[id];
                                    const isActive = itemState?.active ?? false;
                                    const canRun = itemState?.canRun ?? true;
                                    const Icon = item.icon;

                                    return (
                                        <UIIconButton key={id} btnType="none" disabled={!canRun} px={2}
                                            {...(isActive ? toolbarButtonStyle.active : toolbarButtonStyle.base)}
                                            w={"100%"} justifyContent={'start'}
                                            onClick={() => { item.run(editor); setIsOpen(false); }}
                                        >
                                            <Icon size={16} /> {item.label}
                                        </UIIconButton>
                                    );
                                })}
                            </Box>
                        ))}
                    </VStack>
                </UIPopover>
            </Box>
        </FloatingMenu>
    );
}
"use client"

import { Flex } from "@chakra-ui/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Editor, useEditorState } from "@tiptap/react";
import { UIIconButton } from "@/components/ui/custom";
import { toolbarButtonStyle } from "../../styles/docToolbarButton.styles";
import { getToolbarItem, ToolbarCommandId } from "../../config/toolbar.config";

interface DocumentEditorBubbleMenuProps { editor: Editor; }
const BUBBLE_MENU_ITEMS: ToolbarCommandId[] = [
    "bold", "italic", "underline", "strike", "code", "highlight", "link",
];

export default function DocumentEditorBubbleMenu({ editor }: DocumentEditorBubbleMenuProps) {
    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            const state: Record<string, { active: boolean; canRun: boolean }> = {};
            for (const id of BUBBLE_MENU_ITEMS) {
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
        <BubbleMenu
            editor={editor}
            shouldShow={({ editor }) => editor.isFocused && !editor.state.selection.empty}
            options={{ placement: "left", offset: 10 }}
        >
            <Flex align="center" gap={0.5} px={1.5} py={1} borderRadius="full"
                bg="pallete.surfaceElevated" border="1px solid" borderColor="pallete.borderSubtle"
                boxShadow="0 4px 16px rgba(0,0,0,0.12)"
            >
                {BUBBLE_MENU_ITEMS.map((id) => {
                    const item = getToolbarItem(id);
                    const itemState = editorState?.[id];
                    const isActive = itemState?.active ?? false;
                    const canRun = itemState?.canRun ?? true;
                    const Icon = item.icon;

                    return (
                        <UIIconButton key={id} btnType="none" {...(isActive ? toolbarButtonStyle.active : toolbarButtonStyle.base)}
                            disabled={!canRun}
                            aria-label={item.label}
                            onClick={() => item.run(editor)}
                        >
                            <Icon />
                        </UIIconButton>
                    );
                })}
            </Flex>
        </BubbleMenu>
    );
}
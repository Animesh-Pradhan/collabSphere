"use client"

import { UIIconButton, UIMenu } from "@/components/ui/custom";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";
import { Box, Flex } from "@chakra-ui/react";
import { useEditorState } from "@tiptap/react";
import { LuChevronDown } from "react-icons/lu";
import { toolbarButtonStyle } from "../styles/docToolbarButton.styles";
import { toolbarConfig, ToolbarCommandId } from "../config/toolbar.config";

function ToolbarDivider() {
    return (
        <Box w="1px" h="20px" mx={1} bg="pallete.borderSubtle" />
    )
}

interface ToolbarItemState {
    active: boolean;
    canRun: boolean;
}

export default function DocumentEditorToolbar() {
    const editor = useDocumentEditorStore((state) => state.editor);

    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            const state = {} as Partial<Record<ToolbarCommandId, ToolbarItemState>>;
            if (!ctx.editor) return state;

            for (const group of toolbarConfig) {
                for (const item of group.items) {
                    state[item.id] = {
                        active: item.isActive?.(ctx.editor) ?? false,
                        canRun: item.canRun?.(ctx.editor) ?? false,
                    };
                }
            }
            return state;
        },
    });

    return (
        <Flex align="center" gap={0.5} px={5} py={1} flexShrink={0}
            overflowX="auto" borderBottom="1px solid" borderColor="pallete.borderSubtle" bg="pallete.surfaceElevated"
        >
            {toolbarConfig.map((group, groupIndex) => {
                if (group.type === "dropdown") {
                    const activeItem = group.items.find((item) => editorState?.[item.id]?.active) ?? group.items[0];
                    const ActiveIcon = activeItem.icon;

                    return (
                        <Flex key={group.id} align="center" gap={0.5}>
                            {groupIndex > 0 && <ToolbarDivider />}

                            <UIMenu
                                trigger={
                                    <UIIconButton btnType="none" {...toolbarButtonStyle.base} px={2} w="auto">
                                        <Flex align="center" gap={1}>
                                            <ActiveIcon />
                                            <LuChevronDown size={12} />
                                        </Flex>
                                    </UIIconButton>
                                }
                            >
                                {group.items.map((item) => {
                                    const itemState = editorState?.[item.id];
                                    const isActive = itemState?.active ?? false;
                                    const canRun = itemState?.canRun ?? false;
                                    const Icon = item.icon;

                                    return (
                                        <UIMenu.Item
                                            key={item.id}
                                            value={item.id}
                                            disabled={!canRun}
                                            bg={isActive ? "brand.50" : undefined}
                                            color={isActive ? "brand.600" : undefined}
                                            onClick={() => editor && item.run(editor)}
                                        >
                                            <Icon /> {item.label}
                                        </UIMenu.Item>
                                    );
                                })}
                            </UIMenu>
                        </Flex>
                    );
                }

                return (
                    <Flex key={group.id} align="center" gap={0.5}>
                        {groupIndex > 0 && <ToolbarDivider />}

                        {group.items.map((item) => {
                            const itemState = editorState?.[item.id];
                            const isActive = itemState?.active ?? false;
                            const canRun = itemState?.canRun ?? false;
                            const Icon = item.icon;

                            return (
                                <UIIconButton key={item.id} btnType="none" {...(isActive ? toolbarButtonStyle.active : toolbarButtonStyle.base)}
                                    disabled={!canRun}
                                    aria-label={item.label}
                                    onClick={() => editor && item.run(editor)}
                                >
                                    <Icon />
                                </UIIconButton>
                            );
                        })}
                    </Flex>
                );
            })}
        </Flex>
    )
}
"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Editor, useEditorState } from "@tiptap/react";

interface DocumentOutlineProps {
    editor: Editor;
    onNavigate?: () => void;
}

interface OutlineItem {
    id: string;
    text: string;
    level: number;
    pos: number;
}

export default function DocumentOutline({ editor, onNavigate }: DocumentOutlineProps) {
    const [items, setItems] = useState<OutlineItem[]>([]);

    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            activePos: ctx.editor?.state.selection.from ?? 0,
        }),
    });

    useEffect(() => {
        if (!editor) return;

        const buildOutline = () => {
            const headings: OutlineItem[] = [];

            editor.state.doc.descendants((node, pos) => {
                if (node.type.name !== "heading") return;

                const text = node.textContent.trim();
                if (!text) return;

                headings.push({
                    id: `${pos}`,
                    text,
                    level: node.attrs.level ?? 1,
                    pos,
                });
            });

            setItems(headings);
        };

        buildOutline();
        editor.on("update", buildOutline);
        return () => { editor.off("update", buildOutline); };
    }, [editor]);

    const activePos = editorState?.activePos ?? 0;

    const handleClick = (pos: number) => {
        editor.chain().focus().setTextSelection(pos).run();
        requestAnimationFrame(() => {
            const domNode = editor.view.nodeDOM(pos) as HTMLElement | null;
            if (domNode) {
                domNode.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        onNavigate?.();
    };
    return (
        <Box>
            {items.length === 0 && (
                <Text px={4} py={6} color="text.secondary" fontSize="sm">
                    No headings found
                </Text>
            )}

            {items.map((item) => {
                const active =
                    activePos >= item.pos &&
                    (items.find((i) => i.pos > item.pos)?.pos ?? Number.MAX_SAFE_INTEGER) > activePos;

                return (
                    <Flex
                        key={item.id}
                        px={4}
                        py={2}
                        cursor="pointer"
                        align="center"
                        bg={active ? "pallete.surfaceElevated2" : "transparent"}
                        _hover={{ bg: "pallete.surfaceElevated2" }}
                        onClick={() => handleClick(item.pos)}
                    >
                        <Text
                            flex={1}
                            fontSize="sm"
                            pl={`${(item.level - 1) * 16}px`}
                            fontWeight={item.level === 1 ? "semibold" : "normal"}
                            color="text.primary"
                            truncate
                        >
                            {item.text}
                        </Text>
                    </Flex>
                );
            })}
        </Box>
    );
}
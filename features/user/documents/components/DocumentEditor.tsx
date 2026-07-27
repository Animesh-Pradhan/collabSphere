"use client"

import { Box, Flex } from "@chakra-ui/react";
import useGsapReveal from "@/hooks/useGsapReveal";
import useDocumentEditor from "../hooks/useDocumentEditor";
import { EditorContent } from "@tiptap/react";
import { documentEditorStyles } from "../styles/documentEditor.styles";
import { useEffect, useRef, useState } from "react";
import DocumentEditorFloatingMenu from "./TipTap/DocumentEditorFloatingMenu";
import DocumentEditorTableMenu from "./TipTap/DocumentEditorTableMenu";
import DocumentEditorBubbleMenu from "./TipTap/DocumentEditorBubbleMenu";
import { useDocumentEditorStore } from "@/store/documents/document-editor.store";
import { documentContentToTiptap } from "../actions/helpers";

export default function DocumentEditor() {
    const { containerRef } = useGsapReveal({ container: { opacity: 0, fromY: 16, duration: 0.5, ease: "power3.out" } });
    const { editor } = useDocumentEditor();
    const document = useDocumentEditorStore((s) => s.document);
    const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadedDocumentIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!editor || !document) return;
        if (loadedDocumentIdRef.current === document.id) return;

        const content = document.hasDraft ? document.draftContent : document.content;
        editor.commands.setContent(documentContentToTiptap(content));
        loadedDocumentIdRef.current = document.id;
    }, [editor, document]);

    useEffect(() => {
        if (!scrollEl) return;

        const handleScroll = () => {
            setIsScrolling(true);

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
        };

        scrollEl.addEventListener("scroll", handleScroll);
        return () => {
            scrollEl.removeEventListener("scroll", handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, [scrollEl]);

    useEffect(() => {
        if (!editor) return;

        const dom = editor.view.dom;

        const dragOver = (e: DragEvent) => {
            console.log("dragover");
            e.preventDefault();
        };

        const drop = (e: DragEvent) => {
            console.log("drop");
            e.preventDefault();
        };

        dom.addEventListener("dragover", dragOver);
        dom.addEventListener("drop", drop);

        return () => {
            dom.removeEventListener("dragover", dragOver);
            dom.removeEventListener("drop", drop);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <Flex ref={setScrollEl} flex={1} overflow="auto" justify="center" px={8} py={8} bg="pallete.canvas"
            css={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            <Box ref={containerRef}
                w="100%" p={14} maxW="1050px" minH="1200px" h="max-content"
                bg="pallete.surfaceElevated"
                border="1px solid" borderRadius="xl" borderColor="pallete.borderSubtle"
                transition="box-shadow 0.2s ease"
                boxShadow="sm"
                _hover={{ boxShadow: "xl" }} css={documentEditorStyles}
            >
                <EditorContent editor={editor} />
                <DocumentEditorBubbleMenu editor={editor} />
                {scrollEl && (<DocumentEditorFloatingMenu editor={editor} scrollContainer={scrollEl} isScrolling={isScrolling} />)}
                {editor && scrollEl && <DocumentEditorTableMenu editor={editor} scrollContainer={scrollEl} />}
            </Box>
        </Flex>
    )
}
"use client";

import { useDocumentEditorStore } from "@/store/documents/document-editor.store";
import { useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";

import Gapcursor from "@tiptap/extension-gapcursor";
import Dropcursor from "@tiptap/extension-dropcursor";

import { ResizableImage } from "tiptap-extension-resizable-image";
import FileHandler from "@tiptap/extension-file-handler";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import { useEffect } from "react";
import { pickImage, insertFile } from "../actions/document-image-upload";
import { SlashCommand } from "../config/slashCommand";
import { CustomShortcuts } from "../config/customShortcuts";

interface UseDocumentEditorParams {
    initialContent?: any;
}

export default function useDocumentEditor({ initialContent }: UseDocumentEditorParams = {}) {
    const { setEditor } = useDocumentEditorStore();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight.configure({ multicolor: false }),
            Link.configure({ openOnClick: true, autolink: true, linkOnPaste: true, defaultProtocol: "https" }),

            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === "heading") {
                        return "Heading";
                    }
                    return "Start writing...";
                },
            }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
            CharacterCount,
            Gapcursor,
            Dropcursor,
            ResizableImage.configure({ allowBase64: false, defaultWidth: 500, defaultHeight: 300, withCaption: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            SlashCommand,
            CustomShortcuts,
            FileHandler.configure({
                allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/pdf", "application/xlsx"],

                onDrop(editor, files, pos) {
                    console.log("DROP", files, pos);
                    if (!files.length) return;
                    insertFile(editor, files[0]);
                },

                onPaste(editor, files) {
                    console.log("PASTE", files);
                    if (!files.length) return;
                    insertFile(editor, files[0]);
                },
            }),
        ],
        content: initialContent || "",
        immediatelyRender: false,
    });

    useEffect(() => {
        setEditor(editor);
        return () => setEditor(null);
    }, [editor, setEditor]);

    return { editor };
}
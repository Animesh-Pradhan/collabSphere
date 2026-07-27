import { Editor } from "@tiptap/react";
import {
    LuAlignCenter,
    LuAlignLeft,
    LuAlignRight,
    LuBold,
    LuHeading1,
    LuHeading2,
    LuHeading3,
    LuHeading4,
    LuHeading5,
    LuHeading6,
    LuCode,
    LuHeading,
    LuHighlighter,
    LuImage,
    LuItalic,
    LuLink,
    LuList,
    LuListOrdered,
    LuListTodo,
    LuMinus,
    LuQuote,
    LuRedo2,
    LuStrikethrough,
    LuTable,
    LuUnderline,
    LuUndo2,
    LuEraser,
    LuLink2Off,
    LuPilcrow,
    LuPlus
} from "react-icons/lu";
import { insertFile, pickImage } from "../actions/document-image-upload";

export type ToolbarCommandId =
    | "undo"
    | "redo"
    | "paragraph"
    | "heading1"
    | "heading2"
    | "heading3"
    | "heading4"
    | "heading5"
    | "heading6"
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "code"
    | "highlight"
    | "clearFormat"
    | "alignLeft"
    | "alignCenter"
    | "alignRight"
    | "bulletList"
    | "orderedList"
    | "taskList"
    | "blockquote"
    | "horizontalRule"
    | "codeBlock"
    | "link"
    | "unlink"
    | "image"
    | "insertTable"
    | "addRowBefore"
    | "addRowAfter"
    | "deleteRow"
    | "addColumnBefore"
    | "addColumnAfter"
    | "deleteColumn"
    | "toggleHeaderRow"
    | "toggleHeaderColumn"
    | "deleteTable";

export interface ToolbarItem {
    id: ToolbarCommandId;
    label: string;
    icon: React.ElementType;
    run: (editor: Editor) => void;
    isActive?: (editor: Editor) => boolean;
    canRun?: (editor: Editor) => boolean;
}

export interface ToolbarGroup {
    id: string;
    type?: "buttons" | "dropdown";
    items: ToolbarItem[];
}

function toggleMark(id: ToolbarCommandId, label: string, icon: React.ElementType, mark: string, command: keyof Editor["commands"]): ToolbarItem {
    return { id, label, icon, run: (editor) => (editor.chain().focus() as any)[command]().run(), isActive: (editor) => editor.isActive(mark), canRun: (editor) => (editor.can() as any)[command]() };
}

export const toolbarConfig: ToolbarGroup[] = [
    {
        id: "history",
        items: [
            { id: "undo", label: "Undo", icon: LuUndo2, run: (editor) => editor.chain().focus().undo().run(), canRun: (editor) => editor.can().undo() },
            { id: "redo", label: "Redo", icon: LuRedo2, run: (editor) => editor.chain().focus().redo().run(), canRun: (editor) => editor.can().redo() },
        ],
    },

    {
        id: "headings",
        type: "dropdown",
        items: [
            { id: "paragraph", label: "Paragraph", icon: LuPilcrow, run: editor => editor.chain().focus().setParagraph().run(), isActive: editor => editor.isActive("paragraph"), canRun: editor => editor.can().setParagraph() },
            { id: "heading1", label: "Heading 1", icon: LuHeading1, run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (editor) => editor.isActive("heading", { level: 1 }), canRun: (editor) => editor.can().toggleHeading({ level: 1 }) },
            { id: "heading2", label: "Heading 2", icon: LuHeading2, run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor) => editor.isActive("heading", { level: 2 }), canRun: (editor) => editor.can().toggleHeading({ level: 2 }) },
            { id: "heading3", label: "Heading 3", icon: LuHeading3, run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor) => editor.isActive("heading", { level: 3 }), canRun: (editor) => editor.can().toggleHeading({ level: 3 }) },
            { id: "heading4", label: "Heading 4", icon: LuHeading4, run: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(), isActive: (editor) => editor.isActive("heading", { level: 4 }), canRun: (editor) => editor.can().toggleHeading({ level: 4 }) },
            { id: "heading5", label: "Heading 5", icon: LuHeading5, run: (editor) => editor.chain().focus().toggleHeading({ level: 5 }).run(), isActive: (editor) => editor.isActive("heading", { level: 5 }), canRun: (editor) => editor.can().toggleHeading({ level: 5 }) },
            { id: "heading6", label: "Heading 6", icon: LuHeading6, run: (editor) => editor.chain().focus().toggleHeading({ level: 6 }).run(), isActive: (editor) => editor.isActive("heading", { level: 6 }), canRun: (editor) => editor.can().toggleHeading({ level: 6 }) },
        ],
    },

    {
        id: "formatting",
        items: [
            toggleMark("bold", "Bold", LuBold, "bold", "toggleBold"),
            toggleMark("italic", "Italic", LuItalic, "italic", "toggleItalic"),
            toggleMark("underline", "Underline", LuUnderline, "underline", "toggleUnderline"),
            toggleMark("strike", "Strike", LuStrikethrough, "strike", "toggleStrike"),
            toggleMark("code", "Inline Code", LuCode, "code", "toggleCode"),
            toggleMark("highlight", "Highlight", LuHighlighter, "highlight", "toggleHighlight"),
            { id: "clearFormat", label: "Clear Formatting", icon: LuEraser, run: (editor) => editor.chain().focus().clearNodes().unsetAllMarks().run(), canRun: () => true },
        ],
    },

    {
        id: "alignment",
        type: "dropdown",
        items: [
            {
                id: "alignLeft",
                label: "Align Left",
                icon: LuAlignLeft,
                run: (editor) => editor.chain().focus().setTextAlign("left").run(),
                isActive: (editor) => editor.isActive({ textAlign: "left" }),
                canRun: () => true,
            },
            {
                id: "alignCenter",
                label: "Align Center",
                icon: LuAlignCenter,
                run: (editor) => editor.chain().focus().setTextAlign("center").run(),
                isActive: (editor) => editor.isActive({ textAlign: "center" }),
                canRun: () => true,
            },
            {
                id: "alignRight",
                label: "Align Right",
                icon: LuAlignRight,
                run: (editor) => editor.chain().focus().setTextAlign("right").run(),
                isActive: (editor) => editor.isActive({ textAlign: "right" }),
                canRun: () => true,
            },
        ],
    },

    {
        id: "lists",
        type: "dropdown",
        items: [
            toggleMark("bulletList", "Bullet List", LuList, "bulletList", "toggleBulletList"),
            toggleMark("orderedList", "Ordered List", LuListOrdered, "orderedList", "toggleOrderedList"),
            toggleMark("taskList", "Task List", LuListTodo, "taskList", "toggleTaskList"),
        ],
    },

    {
        id: "blocks",
        items: [
            toggleMark("blockquote", "Block Quote", LuQuote, "blockquote", "toggleBlockquote"),
            { id: "horizontalRule", label: "Horizontal Rule", icon: LuMinus, run: (editor) => editor.chain().focus().setHorizontalRule().run(), canRun: () => true },
            toggleMark("codeBlock", "Code Block", LuCode, "codeBlock", "toggleCodeBlock"),
        ],
    },

    {
        id: "insert",
        items: [
            {
                id: "link", label: "Link", icon: LuLink, isActive: (editor) => editor.isActive("link"), canRun: () => true,
                run: (editor) => {
                    const url = window.prompt("Enter URL");
                    if (url) editor.chain().focus().setLink({ href: url }).run();
                },
            },
            { id: "unlink", label: "Remove Link", icon: LuLink2Off, run: (editor) => editor.chain().focus().unsetLink().run(), canRun: (editor) => editor.isActive("link") },
            {
                id: "image", label: "Image", icon: LuImage,
                run: async (editor) => {
                    const file = await pickImage();
                    if (!file) return;
                    await insertFile(editor, file);
                },
                canRun: (editor) => editor.can().setResizableImage({ src: "" }),
            }
        ],
    },

    {
        id: "table",
        type: "dropdown",
        items: [
            {
                id: "insertTable",
                label: "Insert Table",
                icon: LuTable,
                run: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
                canRun: (editor) => editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
            },
            {
                id: "addRowBefore",
                label: "Add Row Above",
                icon: LuPlus,
                run: (editor) => editor.chain().focus().addRowBefore().run(),
                canRun: (editor) => editor.can().addRowBefore(),
            },
            {
                id: "addRowAfter",
                label: "Add Row Below",
                icon: LuPlus,
                run: (editor) => editor.chain().focus().addRowAfter().run(),
                canRun: (editor) => editor.can().addRowAfter(),
            },
            {
                id: "deleteRow",
                label: "Delete Row",
                icon: LuMinus,
                run: (editor) => editor.chain().focus().deleteRow().run(),
                canRun: (editor) => editor.can().deleteRow(),
            },
            {
                id: "addColumnBefore",
                label: "Add Column Left",
                icon: LuPlus,
                run: (editor) => editor.chain().focus().addColumnBefore().run(),
                canRun: (editor) => editor.can().addColumnBefore(),
            },
            {
                id: "addColumnAfter",
                label: "Add Column Right",
                icon: LuPlus,
                run: (editor) => editor.chain().focus().addColumnAfter().run(),
                canRun: (editor) => editor.can().addColumnAfter(),
            },
            {
                id: "deleteColumn",
                label: "Delete Column",
                icon: LuMinus,
                run: (editor) => editor.chain().focus().deleteColumn().run(),
                canRun: (editor) => editor.can().deleteColumn(),
            },
            {
                id: "toggleHeaderRow",
                label: "Toggle Header Row",
                icon: LuHeading,
                run: (editor) => editor.chain().focus().toggleHeaderRow().run(),
                canRun: (editor) => editor.can().toggleHeaderRow(),
            },
            {
                id: "toggleHeaderColumn",
                label: "Toggle Header Column",
                icon: LuHeading,
                run: (editor) => editor.chain().focus().toggleHeaderColumn().run(),
                canRun: (editor) => editor.can().toggleHeaderColumn(),
            },
            {
                id: "deleteTable",
                label: "Delete Table",
                icon: LuEraser,
                run: (editor) => editor.chain().focus().deleteTable().run(),
                canRun: (editor) => editor.can().deleteTable(),
            },
        ],
    },
];

const toolbarItemMap = new Map<ToolbarCommandId, ToolbarItem>();
toolbarConfig.forEach((group) => group.items.forEach((item) => toolbarItemMap.set(item.id, item)));
export function getToolbarItem(id: ToolbarCommandId): ToolbarItem {
    const item = toolbarItemMap.get(id);
    if (!item) throw new Error(`Toolbar item not found: ${id}`);
    return item;
}
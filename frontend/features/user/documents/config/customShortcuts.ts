// extensions/customShortcuts.ts
import { Extension } from "@tiptap/core";

export const CustomShortcuts = Extension.create({
    name: "customShortcuts",

    addKeyboardShortcuts() {
        return {
            "Mod-Alt-1": () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
            "Mod-Alt-2": () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
            "Mod-Alt-3": () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
            "Mod-Alt-4": () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
            "Mod-Alt-5": () => this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
            "Mod-Alt-6": () => this.editor.chain().focus().toggleHeading({ level: 6 }).run(),
            "Mod-Alt-0": () => this.editor.chain().focus().setParagraph().run(),

            "Mod-Shift-7": () => this.editor.chain().focus().toggleOrderedList().run(),
            "Mod-Shift-8": () => this.editor.chain().focus().toggleBulletList().run(),
            "Mod-Shift-9": () => this.editor.chain().focus().toggleTaskList().run(),

            "Mod-u": () => this.editor.chain().focus().toggleUnderline().run(),
            "Mod-Shift-h": () => this.editor.chain().focus().toggleHighlight().run(),
            "Mod-e": () => this.editor.chain().focus().toggleCode().run(),

            "Mod-Alt-c": () => this.editor.chain().focus().toggleCodeBlock().run(),
            "Mod-Shift-b": () => this.editor.chain().focus().toggleBlockquote().run(),

            "Mod-\\": () => this.editor.chain().focus().clearNodes().unsetAllMarks().run(),
        };
    },
});
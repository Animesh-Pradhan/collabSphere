import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import SlashCommandList from "../components/TipTap/SlashCommandList";
import { toolbarConfig, ToolbarCommandId } from "../config/toolbar.config";

const SLASH_COMMAND_ITEMS: ToolbarCommandId[] = [
    "heading1", "heading2", "heading3",
    "bulletList", "orderedList", "taskList",
    "blockquote", "horizontalRule", "codeBlock",
    "image", "insertTable",
];

const slashItemMap = new Map<ToolbarCommandId, { label: string; icon: React.ElementType; run: any }>();
toolbarConfig.forEach((group) => group.items.forEach((item) => slashItemMap.set(item.id, item)));

export const SlashCommand = Extension.create({
    name: "slashCommand",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                startOfLine: false,
                command: ({ editor, range, props }: any) => {
                    editor.chain().focus().deleteRange(range).run();
                    props.run(editor);
                },
                items: ({ query }: { query: string }) => {
                    return SLASH_COMMAND_ITEMS
                        .map((id) => slashItemMap.get(id))
                        .filter((item): item is NonNullable<typeof item> => !!item)
                        .filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
                },
                render: () => {
                    let component: ReactRenderer;
                    let popupEl: HTMLDivElement;

                    const positionPopup = (clientRect: (() => DOMRect | null) | null | undefined) => {
                        const rect = clientRect?.();
                        if (!rect || !popupEl) return;

                        popupEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
                        popupEl.style.left = `${rect.left + window.scrollX}px`;
                    };

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(SlashCommandList, {
                                props,
                                editor: props.editor,
                            });

                            popupEl = document.createElement("div");
                            popupEl.style.position = "absolute";
                            popupEl.style.zIndex = "1000";
                            popupEl.appendChild(component.element);
                            document.body.appendChild(popupEl);

                            positionPopup(props.clientRect);
                        },
                        onUpdate(props: any) {
                            component.updateProps(props);
                            positionPopup(props.clientRect);
                        },
                        onKeyDown(props: any) {
                            if (props.event.key === "Escape") {
                                popupEl?.remove();
                                return true;
                            }
                            return (component.ref as any)?.onKeyDown(props);
                        },
                        onExit() {
                            popupEl?.remove();
                            component.destroy();
                        },
                    };
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});
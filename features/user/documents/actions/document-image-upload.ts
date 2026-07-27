import { Editor } from "@tiptap/react"

export function pickImage(): Promise<File | null> {
    return new Promise((resolve) => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "*/*";

        input.onchange = () => {
            resolve(input.files?.[0] ?? null);
        };

        input.click();
    });
}

export async function insertFile(editor: Editor, file: File) {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
        editor.chain().focus().setResizableImage({ src: url, alt: file.name, width: 500, "data-keep-ratio": true }).run();
        return;
    }

    editor.chain().focus().insertContent(`
        <p>
            📄
            <a href="${url}" target="_blank">${file.name}</a>
        </p>
    `).run();
}
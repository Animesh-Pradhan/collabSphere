import type { JSONContent } from "@tiptap/core";
import type { DocumentContent, Block, RichText, RichTextMark, ListItem, CheckListItem, TableRow, TableCell } from "@/features/user/documents/types/blockTypes";

// ---------- MARKS ----------
function markToTiptap(mark: RichTextMark) {
    switch (mark.type) {
        case "bold": return { type: "bold" };
        case "italic": return { type: "italic" };
        case "underline": return { type: "underline" };
        case "strike": return { type: "strike" };
        case "code": return { type: "code" };
        case "highlight": return { type: "highlight" };
        case "link": return { type: "link", attrs: { href: mark.href } };
        case "mention": return { type: "mention", attrs: { workspaceMemberId: mark.workspaceMemberId } };
    }
}

function markFromTiptap(mark: any): RichTextMark | null {
    switch (mark.type) {
        case "bold": return { type: "bold" };
        case "italic": return { type: "italic" };
        case "underline": return { type: "underline" };
        case "strike": return { type: "strike" };
        case "code": return { type: "code" };
        case "highlight": return { type: "highlight" };
        case "link": return { type: "link", href: mark.attrs?.href ?? "" };
        case "mention": return { type: "mention", workspaceMemberId: mark.attrs?.workspaceMemberId ?? "" };
        default: return null; // unknown mark, drop silently
    }
}

// ---------- RICH TEXT ----------
function richTextArrayToTiptap(children: RichText[]): JSONContent[] {
    if (!children.length) return [];
    return children.map((rt) => ({
        type: "text",
        text: rt.text,
        marks: rt.marks?.map(markToTiptap),
    }));
}

function tiptapToRichTextArray(content: JSONContent[] = []): RichText[] {
    return content
        .filter((node) => node.type === "text")
        .map((node) => ({
            text: node.text ?? "",
            marks: node.marks?.map(markFromTiptap).filter((m): m is RichTextMark => m !== null),
        }));
}

// ---------- LIST ITEMS ----------
function listItemToTiptap(item: ListItem, listType: "bulletList" | "orderedList"): JSONContent {
    const nested = item.items?.length
        ? [{ type: listType, content: item.items.map((i) => listItemToTiptap(i, listType)) }]
        : [];
    return {
        type: "listItem",
        content: [{ type: "paragraph", content: richTextArrayToTiptap(item.children) }, ...nested],
    };
}

function tiptapToListItem(node: JSONContent): ListItem {
    const paragraph = node.content?.find((c) => c.type === "paragraph");
    const nestedList = node.content?.find((c) => c.type === "bulletList" || c.type === "orderedList");
    return {
        children: tiptapToRichTextArray(paragraph?.content ?? []),
        items: nestedList?.content?.map(tiptapToListItem),
    };
}

function checkListItemToTiptap(item: CheckListItem): JSONContent {
    const nested = item.items?.length
        ? [{ type: "taskList", content: item.items.map(checkListItemToTiptap) }]
        : [];
    return {
        type: "taskItem",
        attrs: { checked: item.checked },
        content: [{ type: "paragraph", content: richTextArrayToTiptap(item.children) }, ...nested],
    };
}

function tiptapToCheckListItem(node: JSONContent): CheckListItem {
    const paragraph = node.content?.find((c) => c.type === "paragraph");
    const nestedList = node.content?.find((c) => c.type === "taskList");
    return {
        checked: !!node.attrs?.checked,
        children: tiptapToRichTextArray(paragraph?.content ?? []),
        items: nestedList?.content?.map(tiptapToCheckListItem),
    };
}

// ---------- TABLE ----------
function tableRowToTiptap(row: TableRow): JSONContent {
    return {
        type: "tableRow",
        content: row.cells.map((cell) => ({
            type: cell.isHeader ? "tableHeader" : "tableCell",
            attrs: { colspan: cell.colSpan ?? 1, rowspan: cell.rowSpan ?? 1 },
            content: [{ type: "paragraph", content: richTextArrayToTiptap(cell.children) }],
        })),
    };
}

function tiptapToTableRow(node: JSONContent): TableRow {
    return {
        cells: (node.content ?? []).map((cellNode): TableCell => {
            const paragraph = cellNode.content?.find((c) => c.type === "paragraph");
            return {
                children: tiptapToRichTextArray(paragraph?.content ?? []),
                isHeader: cellNode.type === "tableHeader",
                colSpan: cellNode.attrs?.colspan,
                rowSpan: cellNode.attrs?.rowspan,
            };
        }),
    };
}

// ---------- BLOCK -> TIPTAP NODE ----------
function blockToTiptap(block: Block): JSONContent {
    switch (block.type) {
        case "paragraph":
            return { type: "paragraph", attrs: { textAlign: block.data.alignment }, content: richTextArrayToTiptap(block.data.children) };
        case "heading":
            return { type: "heading", attrs: { level: block.data.level, textAlign: block.data.alignment }, content: richTextArrayToTiptap(block.data.children) };
        case "quote":
            return { type: "blockquote", content: [{ type: "paragraph", content: richTextArrayToTiptap(block.data.children) }] };
        case "divider":
            return { type: "horizontalRule" };
        case "code":
            return { type: "codeBlock", attrs: { language: block.data.language }, content: [{ type: "text", text: block.data.code }] };
        case "bulletList":
            return { type: "bulletList", content: block.data.items.map((i) => listItemToTiptap(i, "bulletList")) };
        case "numberedList":
            return { type: "orderedList", content: block.data.items.map((i) => listItemToTiptap(i, "orderedList")) };
        case "checkList":
            return { type: "taskList", content: block.data.items.map(checkListItemToTiptap) };
        case "table":
            return { type: "table", content: block.data.rows.map(tableRowToTiptap) };
        case "image":
            return { type: "attachmentImage", attrs: { attachmentId: block.data.attachmentId, alt: block.data.alt, width: block.data.width, height: block.data.height, alignment: block.data.alignment, caption: block.data.caption } };
        case "attachment":
            return { type: "attachment", attrs: { attachmentId: block.data.attachmentId, caption: block.data.caption } };
        case "embed":
            return { type: "embed", attrs: { url: block.data.url, caption: block.data.caption, width: block.data.width, height: block.data.height } };
        case "canvas":
            return { type: "canvas", attrs: { attachmentId: block.data.attachmentId } };
    }
}

// ---------- TIPTAP NODE -> BLOCK ----------
function tiptapToBlock(node: JSONContent): Block | null {
    switch (node.type) {
        case "paragraph":
            return { type: "paragraph", data: { children: tiptapToRichTextArray(node.content), alignment: node.attrs?.textAlign } };
        case "heading":
            return { type: "heading", data: { level: (node.attrs?.level ?? 1) as any, children: tiptapToRichTextArray(node.content), alignment: node.attrs?.textAlign } };
        case "blockquote": {
            const paragraph = node.content?.find((c) => c.type === "paragraph");
            return { type: "quote", data: { children: tiptapToRichTextArray(paragraph?.content ?? []) } };
        }
        case "horizontalRule":
            return { type: "divider", data: {} };
        case "codeBlock":
            return { type: "code", data: { language: node.attrs?.language, code: node.content?.[0]?.text ?? "" } };
        case "bulletList":
            return { type: "bulletList", data: { items: (node.content ?? []).map(tiptapToListItem) } };
        case "orderedList":
            return { type: "numberedList", data: { items: (node.content ?? []).map(tiptapToListItem) } };
        case "taskList":
            return { type: "checkList", data: { items: (node.content ?? []).map(tiptapToCheckListItem) } };
        case "table":
            return { type: "table", data: { rows: (node.content ?? []).map(tiptapToTableRow) } };
        case "attachmentImage":
            return { type: "image", data: { attachmentId: node.attrs?.attachmentId, alt: node.attrs?.alt, width: node.attrs?.width, height: node.attrs?.height, alignment: node.attrs?.alignment, caption: node.attrs?.caption } };
        case "attachment":
            return { type: "attachment", data: { attachmentId: node.attrs?.attachmentId, caption: node.attrs?.caption } };
        case "embed":
            return { type: "embed", data: { url: node.attrs?.url, caption: node.attrs?.caption, width: node.attrs?.width, height: node.attrs?.height } };
        case "canvas":
            return { type: "canvas", data: { attachmentId: node.attrs?.attachmentId } };
        default:
            return null; // unknown node (e.g. gapcursor helper nodes) — drop
    }
}

// ---------- PUBLIC API ----------
export function documentContentToTiptap(content: DocumentContent | null | undefined): JSONContent {
    if (!content || !content.blocks?.length) {
        return { type: "doc", content: [{ type: "paragraph" }] };
    }
    return { type: "doc", content: content.blocks.map(blockToTiptap) };
}

export function tiptapToDocumentContent(doc: JSONContent): DocumentContent {
    const blocks = (doc.content ?? [])
        .map(tiptapToBlock)
        .filter((b): b is Block => b !== null);
    return { version: 1, blocks };
}
export interface DocumentContent {
    version: 1;
    blocks: Block[];
}

export type BlockType =
    | "paragraph"
    | "heading"
    | "quote"
    | "divider"
    | "code"
    | "bulletList"
    | "numberedList"
    | "checkList"
    | "table"
    | "image"
    | "attachment"
    | "embed"
    | "canvas";


export interface BoldMark { type: "bold"; }
export interface ItalicMark { type: "italic"; }
export interface UnderlineMark { type: "underline"; }
export interface StrikeMark { type: "strike"; }
export interface CodeMark { type: "code"; }
export interface HighlightMark { type: "highlight"; }
export interface LinkMark { type: "link"; href: string; }
export interface MentionMark { type: "mention"; workspaceMemberId: string; }

export type RichTextMark = BoldMark | ItalicMark | UnderlineMark | StrikeMark | CodeMark | HighlightMark | LinkMark | MentionMark;

export interface RichText {
    id?: string;
    text: string;
    marks?: RichTextMark[];
}

export interface BaseBlock<T, Type extends BlockType> {
    id?: string;
    type: Type;
    data: T;
}


export type TextAlignment = "left" | "center" | "right" | "justify";
export type ParagraphBlock = BaseBlock<ParagraphBlockData, "paragraph">;
export interface ParagraphBlockData {
    children: RichText[];
    alignment?: TextAlignment;
}

export type HeadingBlock = BaseBlock<HeadingBlockData, "heading">;
export interface HeadingBlockData {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: RichText[];
    alignment?: TextAlignment;
}

export type QuoteBlock = BaseBlock<QuoteBlockData, "quote">;
export interface QuoteBlockData {
    children: RichText[];
    citation?: string;
}

export type DividerBlock = BaseBlock<DividerBlockData, "divider">;
export type DividerBlockData = Record<string, never>;

export type CodeBlock = BaseBlock<CodeBlockData, "code">;
export interface CodeBlockData {
    language?: CodeLanguage;
    code: string;
}
export type CodeLanguage = "typescript" | "javascript" | "python" | "java" | "cpp" | "c" | "go" | "rust" | "sql" | "json" | "yaml" | "html" | "css" | "markdown" | "text";

export interface ListItem {
    id?: string;
    children: RichText[];
    items?: ListItem[];
}
export interface CheckListItem {
    id?: string;
    checked: boolean;
    children: RichText[];
    items?: CheckListItem[];
}
export interface BulletListBlockData { items: ListItem[]; }
export type BulletListBlock = BaseBlock<BulletListBlockData, "bulletList">;

export interface NumberedListBlockData { items: ListItem[]; }
export type NumberedListBlock = BaseBlock<NumberedListBlockData, "numberedList">;

export interface CheckListBlockData { items: CheckListItem[]; }
export type CheckListBlock = BaseBlock<CheckListBlockData, "checkList">;


export type TableBlock = BaseBlock<TableBlockData, "table">;
export interface TableBlockData { rows: TableRow[]; }
export interface TableRow {
    id?: string;
    cells: TableCell[];
}
export interface TableCell {
    id?: string;
    children: RichText[];
    isHeader?: boolean;
    rowSpan?: number;
    colSpan?: number;
    alignment?: TextAlignment;
}

export type ImageBlock = BaseBlock<ImageBlockData, "image">;
export interface ImageBlockData {
    attachmentId: string;
    caption?: string;
    alt?: string;
    width?: number;
    height?: number;
    alignment?: ImageAlignment;
}

export type ImageAlignment = "left" | "center" | "right";


export type AttachmentBlock = BaseBlock<AttachmentBlockData, "attachment">;
export interface AttachmentBlockData {
    attachmentId: string;
    caption?: string;
}

export type EmbedBlock = BaseBlock<EmbedBlockData, "embed">;
export interface EmbedBlockData {
    url: string;
    caption?: string;
    width?: number;
    height?: number;
}
export type EmbedProvider = "youtube" | "loom" | "figma" | "miro" | "github" | "googleMaps" | "other";

export type CanvasBlock = BaseBlock<CanvasBlockData, "canvas">;
export interface CanvasBlockData { attachmentId: string; }


export type Block = ParagraphBlock | HeadingBlock | QuoteBlock | DividerBlock
    | CodeBlock | BulletListBlock | NumberedListBlock | CheckListBlock
    | TableBlock | ImageBlock | AttachmentBlock | EmbedBlock | CanvasBlock;
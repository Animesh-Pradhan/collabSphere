export const documentEditorStyles = {
    "& .ProseMirror": {
        minHeight: "100%",
        outline: "none",
        color: "text.primary",
        fontSize: "17px",
        lineHeight: 1.75,
        fontWeight: 400,
        letterSpacing: "-0.011em",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        caretColor: "brand.500",
    },

    /* Placeholder — shown on empty paragraph via Tiptap Placeholder extension */
    "& .ProseMirror .is-empty::before": {
        content: "attr(data-placeholder)",
        float: "left",
        height: 0,
        pointerEvents: "none",
        color: "text.secondary",
        opacity: 0.6,
    },

    "& .ProseMirror p": {
        marginBottom: "1rem",
    },

    "& .ProseMirror h1": {
        fontSize: "2.25rem",
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "-0.02em",
        margin: "2.25rem 0 1rem",
        color: "text.primary",
    },

    "& .ProseMirror h1:first-of-type": {
        marginTop: 0,
    },

    "& .ProseMirror h2": {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "-0.015em",
        margin: "2rem 0 0.75rem",
        color: "text.primary",
    },

    "& .ProseMirror h3": {
        fontSize: "1.375rem",
        fontWeight: 600,
        lineHeight: 1.4,
        margin: "1.75rem 0 0.6rem",
        color: "text.primary",
    },

    "& .ProseMirror ul, & .ProseMirror ol": {
        paddingLeft: "1.6rem",
        marginBottom: "1rem",
    },

    "& .ProseMirror ul": {
        listStyleType: "disc",
    },

    "& .ProseMirror ol": {
        listStyleType: "decimal",
    },

    "& .ProseMirror li": {
        marginBottom: "0.4rem",
        paddingLeft: "0.25rem",
    },

    "& .ProseMirror li > p": {
        marginBottom: "0.25rem",
    },

    /* Task list (if you add @tiptap/extension-task-list later) */
    "& .ProseMirror ul[data-type='taskList']": {
        listStyle: "none",
        paddingLeft: "0.25rem",
    },

    "& .ProseMirror ul[data-type='taskList'] li": {
        display: "flex",
        alignItems: "flex-start",
        gap: "0.5rem",
    },

    "& .ProseMirror ul[data-type='taskList'] li > label": {
        marginTop: "0.2rem",
        userSelect: "none",
    },

    "& .ProseMirror blockquote": {
        position: "relative",
        borderLeft: "3px solid",
        borderColor: "brand.400",
        paddingLeft: "1.1rem",
        margin: "1.5rem 0",
        color: "text.secondary",
        fontStyle: "italic",
        fontSize: "1.05em",
    },

    "& .ProseMirror code": {
        px: "6px",
        py: "2px",
        borderRadius: "md",
        bg: "pallete.surfaceElevated2",
        color: "brand.600",
        fontSize: "0.88em",
        fontFamily: "mono",
        fontWeight: 500,
        border: "1px solid",
        borderColor: "pallete.borderSubtle",
    },

    "& .ProseMirror pre": {
        bg: "gray.950",
        color: "gray.100",
        p: "1.1rem",
        borderRadius: "lg",
        overflowX: "auto",
        margin: "1.5rem 0",
        fontSize: "0.9em",
        lineHeight: 1.6,
        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    },

    "& .ProseMirror pre code": {
        background: "transparent",
        border: "none",
        padding: 0,
        color: "inherit",
        fontWeight: 400,
    },

    "& .ProseMirror hr": {
        border: 0,
        borderTop: "1px solid",
        borderColor: "pallete.borderSubtle",
        margin: "2.5rem 0",
    },

    "& .ProseMirror img": {
        display: "block",
        maxWidth: "100%",
        height: "auto",
        borderRadius: "lg",
        margin: "1rem 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },

    "& .ProseMirror img.ProseMirror-selectednode": {
        outline: "2px solid",
        outlineColor: "brand.500",
        outlineOffset: "2px",
    },

    /* Links */
    "& .ProseMirror a": {
        color: "brand.600",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        textDecorationColor: "brand.300",
        cursor: "pointer",
        transition: "color 0.15s ease",
    },

    "& .ProseMirror a:hover": {
        color: "brand.700",
        textDecorationColor: "brand.500",
    },

    /* Tables (if you add @tiptap/extension-table later) */
    "& .ProseMirror table": {
        tableLayout: "fixed",
        borderCollapse: "collapse",
        width: "100%",
        margin: "1.5rem 0",
        overflow: "hidden",
        borderRadius: "md",
    },

    "& .ProseMirror th, & .ProseMirror td": {
        position: "relative",
        border: "1px solid",
        borderColor: "pallete.borderSubtle",
        padding: "0.5rem 0.75rem",
        verticalAlign: "top",
        textAlign: "left",
    },

    "& .ProseMirror th": {
        bg: "pallete.surfaceElevated2",
        fontWeight: 600,
        color: "text.primary"
    },

    "& .ProseMirror .selectedCell": {
        bg: "brand.50",
    },

    "& .tableWrapper": {
        overflowX: "auto",
        margin: "1.5rem 0",
    },

    "& .ProseMirror table .column-resize-handle": {
        position: "absolute",
        top: 0,
        right: "-2px",
        bottom: 0,
        width: "4px",
        backgroundColor: "brand.500",
        pointerEvents: "none",
    },


    /* Highlight mark */
    "& .ProseMirror mark": {
        bg: "#fef08a",
        color: "inherit",
        borderRadius: "3px",
        padding: "0 2px",
    },

    /* Selection + cursor */
    "& .ProseMirror ::selection": {
        background: "rgba(99, 102, 241, 0.22)",
    },

    "& .ProseMirror .ProseMirror-gapcursor::after": {
        borderTop: "2px solid",
        borderColor: "brand.500",
    },

    /* Drag handle drop indicator, if using drag-and-drop later */
    "& .ProseMirror-dropcursor": {
        backgroundColor: "brand.500",
        height: "2px",
    },

    "& .ProseMirror em": {
        fontStyle: "italic",
    },

    "& .resize-cursor": {
        cursor: "col-resize",
    },

    "& .ProseMirror ul[data-type='taskList'] input[type='checkbox']": {
        accentColor: "var(--chakra-colors-brand-500)",
        cursor: "pointer",
        marginTop: "0.2rem",
    },

} as const;
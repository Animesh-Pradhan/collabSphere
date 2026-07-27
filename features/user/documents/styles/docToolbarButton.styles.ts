export const toolbarButtonStyle = {
    base: {
        bg: "transparent",
        color: "text.secondary",
        border: "none",
        borderRadius: "md",
        transition: "all 0.15s ease",
        _hover: { bg: "pallete.surfaceElevated2", color: "text.primary" },
        _active: { transform: "scale(0.92)" },
    },
    active: {
        bg: "brand.100",
        color: "brand.600",
        border: "none",
        borderRadius: "md",
        transition: "all 0.15s ease",
        _hover: { bg: "brand.100", color: "brand.600" },
        _active: { transform: "scale(0.92)" },
        boxShadow: "inset 0 0 0 1px var(--chakra-colors-brand-200)",
    },
};
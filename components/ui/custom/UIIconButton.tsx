import { IconButton, type ButtonProps } from '@chakra-ui/react'
import React, { type ReactNode } from 'react'

type ButtonComponentProps = {
    btnType?: string | null;
    onClick?: (() => void) | ((e: React.MouseEvent<HTMLButtonElement>) => void);
    children: ReactNode;
} & ButtonProps;

const UIIconButton = ({ btnType = "none", onClick, children, ...props }: ButtonComponentProps) => {
    if (btnType === "outline") {
        return (<IconButton onClick={onClick} bg={"pallete.surfaceElevated"} color={"text.primary"} size={'xs'}
            border={"1px solid"} borderColor={"pallete.borderSubtle"}
            _hover={{ bg: { base: "gray.100", _dark: "#242424" } }}
            {...props}
        >
            {children || "Save"}
        </IconButton >)
    }

    if (btnType === "delete") {
        return (<IconButton onClick={onClick} colorPalette={'red'} size={'xs'} variant={'outline'}
            {...props}
        >
            {children || "Save"}
        </IconButton >)
    }

    return (
        <IconButton onClick={onClick} size={'xs'}
            bg={btnType === "primary" ? "pallete.secondary" : btnType === "none" ? "" : "#e5e5e5"}
            color={btnType === "primary" ? "#fff" : btnType === "none" ? "#000" : "black"}
            _hover={{ bg: btnType === "primary" ? "pallete.secondary_hover" : btnType === "none" ? "" : "#a5a5a5" }}
            {...props}
        >
            {children || "Save"}
        </IconButton>
    );
};

export default UIIconButton;

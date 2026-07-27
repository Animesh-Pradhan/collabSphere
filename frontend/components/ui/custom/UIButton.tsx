import { Button, type ButtonProps } from '@chakra-ui/react'
import React, { type ReactNode } from 'react'

type ButtonComponentProps = {
    btnType?: "primary" | "outline" | "none";
    onClick?: (() => void) | ((e: React.MouseEvent<HTMLButtonElement>) => void);
    children: ReactNode;
} & ButtonProps;

export default function UIButton({ btnType = "none", onClick, children, ...props }: ButtonComponentProps) {
    if (btnType === "outline") {
        return (<Button onClick={onClick} bg={"pallete.surfaceElevated"} color={"text.primary"} size={'xs'}
            border={"1px solid"} borderColor={"pallete.borderSubtle"}
            _hover={{ bg: { base: "gray.100", _dark: "#242424" } }}
            {...props}
        >
            {children || "Save"}
        </Button >)
    }
    return (
        <Button onClick={onClick} size={'xs'}
            bg={btnType === "primary" ? "pallete.secondary" : btnType === "none" ? "" : "#e5e5e5"}
            color={btnType === "primary" ? "#fff" : btnType === "none" ? "#000" : "black"}
            _hover={{ bg: btnType === "primary" ? "pallete.secondary_hover" : btnType === "none" ? "" : "#a5a5a5" }}
            {...props}
        >
            {children || "Save"}
        </Button >
    );
};

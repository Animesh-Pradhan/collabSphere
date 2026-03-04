"use client";

import { ReactNode } from "react";
import { Popover, Portal, type PopoverRootProps, type PopoverContentProps, type PopoverPositionerProps } from "@chakra-ui/react";

type UIPopoverProps = {
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: "bottom" | "bottom-start" | "bottom-end" | "top";
    rootProps?: Partial<PopoverRootProps>;
    contentProps?: Partial<PopoverContentProps>;
    positionerProps?: Partial<PopoverPositionerProps>;
};

export default function UIPopover({
    trigger,
    children,
    open,
    onOpenChange,
    placement = "bottom",
    rootProps,
    contentProps,
    positionerProps
}: UIPopoverProps) {
    return (
        <Popover.Root positioning={{ placement }} open={open} onOpenChange={(details) => onOpenChange?.(details.open)} {...rootProps}>
            <Popover.Trigger asChild>{trigger}</Popover.Trigger>
            <Portal>
                <Popover.Positioner {...positionerProps}>
                    <Popover.Content boxShadow="lg" {...contentProps}>
                        <Popover.Arrow bg="pallete.primary" />
                        <Popover.Body>{children}</Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
}
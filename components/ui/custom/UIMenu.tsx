"use client";

import { ReactNode } from "react";
import { Menu, Portal, type MenuRootProps, type MenuContentProps, type MenuPositionerProps, MenuItemProps } from "@chakra-ui/react";

type UIMenuProps = {
    trigger: ReactNode;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    rootProps?: Partial<MenuRootProps>;
    contentProps?: Partial<MenuContentProps>;
    positionerProps?: Partial<MenuPositionerProps>;
};

function Root({
    trigger,
    children,
    open,
    onOpenChange,
    rootProps,
    contentProps,
    positionerProps
}: UIMenuProps) {
    return (
        <Menu.Root open={open} onOpenChange={(details) => onOpenChange?.(details.open)} {...rootProps}>
            <Menu.Trigger asChild>{trigger}</Menu.Trigger>

            <Portal>
                <Menu.Positioner {...positionerProps}>
                    <Menu.Content {...contentProps}>
                        {children}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    )
}

function Item(props: MenuItemProps) {
    return <Menu.Item cursor={'pointer'} {...props} />;
}

function Separator() {
    return <Menu.Separator />;
}

const UIMenu = Object.assign(Root, { Item, Separator });

export default UIMenu
"use client"

import { Dialog, Portal, CloseButton } from "@chakra-ui/react"
import { ReactNode } from "react"

export type DialogController = {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
    onOpenChange: (e: { open: boolean }) => void
}

export type DialogSlotProps = {
    content?: Dialog.ContentProps
    header?: Dialog.HeaderProps
    body?: Dialog.BodyProps
    footer?: Dialog.FooterProps
}

type ReusableDialogProps = {
    dialog: DialogController
    title?: ReactNode
    children: ReactNode
    footer?: ReactNode
    trigger?: ReactNode
    onOpen?: () => void
    onClose?: () => void
    slotProps?: DialogSlotProps
} & Omit<Dialog.RootProps, "open" | "onOpenChange">

export default function ReusableDialog({ dialog, trigger, title, children, footer, onOpen, onClose, slotProps, ...rest }: ReusableDialogProps) {
    const handleOpenChange = (e: { open: boolean }) => {
        dialog.onOpenChange(e)
        if (e.open) {
            onOpen?.()
        } else {
            onClose?.()
        }
    }
    return (
        <Dialog.Root lazyMount open={dialog.isOpen} onOpenChange={handleOpenChange} {...rest}>
            {trigger && (<Dialog.Trigger asChild>{trigger}</Dialog.Trigger>)}
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content {...slotProps?.content}>
                        {title && (
                            <Dialog.Header {...slotProps?.header}>
                                <Dialog.Title>{title}</Dialog.Title>
                            </Dialog.Header>
                        )}

                        <Dialog.Body {...slotProps?.body}>{children}</Dialog.Body>
                        {footer && (<Dialog.Footer {...slotProps?.footer}>{footer}</Dialog.Footer>)}

                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>

                    </Dialog.Content>

                </Dialog.Positioner>

            </Portal>

        </Dialog.Root>
    )
}
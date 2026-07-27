"use client"

import { Text } from "@chakra-ui/react"
import { ReactNode, useCallback } from "react"
import ReusableDialog from "./ReusableDialog"
import { DialogController } from "./ReusableDialog"
import UIButton from "../UIButton"

type ConfirmDialogProps = {
    dialog: DialogController
    title?: ReactNode
    description?: ReactNode
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onClose?: () => void
    isLoading?: boolean
}

export default function ConfirmDialog({
    dialog,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm, onClose,
    isLoading = false
}: ConfirmDialogProps) {
    const handleClose = useCallback(() => {
        dialog.close()
        onClose?.()
    }, [dialog, onClose])

    return (
        <ReusableDialog dialog={dialog} title={title} footer={
            <>
                <UIButton btnType="outline" onClick={handleClose}>{cancelText}</UIButton>
                <UIButton btnType="primary" onClick={onConfirm} loading={isLoading}>{confirmText}</UIButton>
            </>
        }
        >

            {description && (
                <Text>
                    {description}
                </Text>
            )}

        </ReusableDialog>
    )
}
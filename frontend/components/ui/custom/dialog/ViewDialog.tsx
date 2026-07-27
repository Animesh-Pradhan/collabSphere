"use client"

import { ReactNode } from "react"
import ReusableDialog from "./ReusableDialog"
import { DialogController } from "./ReusableDialog"
import UIButton from "../UIButton"

type ViewDialogProps = {
    dialog: DialogController
    title?: ReactNode
    children: ReactNode
    closeText?: string
    trigger?: ReactNode
    isLoading?: boolean
    onClose?: () => void
}

export default function ViewDialog({
    dialog,
    title,
    children,
    closeText = "Close",
    trigger,
    isLoading = false,
    onClose
}: ViewDialogProps) {

    return (
        <ReusableDialog dialog={dialog} title={title} trigger={trigger} onClose={onClose} footer={
            <UIButton btnType="outline" onClick={dialog.close} loading={isLoading}>{closeText}</UIButton>
        }>
            {children}
        </ReusableDialog>
    )
}
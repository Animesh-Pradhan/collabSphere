"use client"

import { useForm, DefaultValues, FieldValues, UseFormReturn } from "react-hook-form"
import ReusableDialog, { DialogController, DialogSlotProps } from "./ReusableDialog"
import { ReactNode, useEffect } from "react"
import UIButton from "../UIButton"
import { Dialog } from "@chakra-ui/react"

type FormDialogProps<T extends FieldValues> = {
    dialog: DialogController
    title?: ReactNode
    defaultValues?: DefaultValues<T>
    onSubmit: (data: T) => Promise<void> | void
    children: (form: UseFormReturn<T>) => ReactNode
    submitText?: string
    cancelText?: string
    isLoading?: boolean
    slotProps?: DialogSlotProps
} & Omit<Dialog.RootProps, "open" | "onOpenChange" | "children">

export default function FormDialog<T extends FieldValues>({
    dialog,
    title,
    defaultValues,
    onSubmit,
    children,
    submitText = "Save",
    cancelText = "Cancel",
    isLoading = false,
    slotProps,
    ...rest
}: FormDialogProps<T>) {
    const form = useForm<T>({ defaultValues });
    const handleSubmit = form.handleSubmit(async (data) => {
        await onSubmit(data);
        dialog.close();
        form.reset();
    })


    useEffect(() => {
        if (!dialog.isOpen || (dialog.isOpen && defaultValues)) {
            form.reset(defaultValues)
        }
    }, [dialog.isOpen, form, defaultValues])

    return (
        <ReusableDialog dialog={dialog} title={title} closeOnInteractOutside={false} slotProps={slotProps} {...rest}
            footer={
                <>
                    <UIButton btnType="outline" onClick={() => { dialog.close(); form.reset() }}>{cancelText}</UIButton>
                    <UIButton btnType="primary" onClick={handleSubmit} loading={isLoading}>{submitText}</UIButton>
                </>
            }
        >
            {children(form)}
        </ReusableDialog>
    )
}
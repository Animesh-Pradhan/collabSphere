"use client";

import { useCallback, useState } from "react"
import { useDialog } from "@/hooks"

export default function useDialogAction<T>() {

    const dialog = useDialog()
    const [data, setData] = useState<T | null>(null)

    const open = useCallback((value: T) => {
        dialog.open()
        setData(value)
    }, [dialog])
    const close = useCallback(() => {
        dialog.close()
        setData(null)
    }, [dialog])

    return { data, open, close, dialog }
}
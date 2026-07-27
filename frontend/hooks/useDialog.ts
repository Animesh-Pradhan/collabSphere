import { useCallback, useState } from "react"

type DialogOpenChange = { open: boolean }

export default function useDialog(defaultOpen = false) {

    const [isOpen, setIsOpen] = useState(defaultOpen)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen(prev => !prev), [])
    const onOpenChange = useCallback((e: DialogOpenChange) => setIsOpen(e.open), [])

    return {
        isOpen, open, close,
        toggle, onOpenChange, setIsOpen
    }
}
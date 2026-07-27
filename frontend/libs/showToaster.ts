import { toaster } from "@/components/ui/chakra/toaster"
type ToastType = "success" | "error" | "warning" | "info"

export function showToast(type: ToastType, title: string, description?: string) {
    toaster.create({ type, title, description, duration: 4000, closable: true })
}
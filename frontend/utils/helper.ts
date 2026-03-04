export type DateFormatType = "short" | "medium" | "long" | "full" | "date-only" | "time-only" | "relative"
type FormatOptions = {
    format?: DateFormatType
    locale?: string
    timeZone?: string
}

function formatRelative(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`

    return formatDate(date, { format: "date-only" })
}

export function formatDate(value: string | Date | null | undefined, options: FormatOptions = {}): string {
    if (!value) return "-";
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "-";
    const { format = "medium", locale = "en-IN", timeZone = "Asia/Kolkata" } = options;

    if (format === "relative") return formatRelative(date);

    const formatMap: Record<Exclude<DateFormatType, "relative">, Intl.DateTimeFormatOptions> = {
        short: { dateStyle: "short", timeStyle: "short" },
        medium: { dateStyle: "medium", timeStyle: "short" },
        long: { dateStyle: "long", timeStyle: "medium" },
        full: { dateStyle: "full", timeStyle: "long" },
        "date-only": { year: "numeric", month: "short", day: "2-digit" },
        "time-only": { hour: "2-digit", minute: "2-digit", second: "2-digit" },
    }

    return new Intl.DateTimeFormat(locale, { ...formatMap[format], timeZone }).format(date)
}
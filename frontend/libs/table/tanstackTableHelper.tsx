import { formatDate } from "@/utils/helper"
import { Box } from "@chakra-ui/react"
import { ColumnDef } from "@tanstack/react-table"

export const textColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
})

export const dateColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
    cell: (info) => formatDate(info.getValue() as string, { format: "medium" }),
})

export const statusColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
    cell: (info) => {
        const value = info.getValue() as string
        return (<Box px="2" py="1"
            borderRadius="md"
            bg={value === "ACTIVE"
                ? "green.100"
                : value === "SUSPENDED"
                    ? "yellow.100"
                    : "red.100"
            }
        >
            {value}
        </Box>)
    },
})
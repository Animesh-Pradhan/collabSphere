"use client"

import { useCallback, useMemo, useState } from "react"
import { PaginationState, SortingState, RowSelectionState } from "@tanstack/react-table"

type UseServerTableOptions = {
    meta?: { totalItems: number; totalPages: number; page?: number; limit?: number; } | null
    page: number
    limit: number
    sortBy: string
    order: "asc" | "desc"
    setPagination: (page: number, limit: number) => void
    setSorting: (id: string, order: "asc" | "desc") => void
    defaultSort: { id: string; desc: boolean }
    initialColumnVisibility: Record<string, boolean>
}

export default function useServerDataTable({
    meta, page, limit,
    sortBy, order,
    setPagination,
    setSorting,
    defaultSort, initialColumnVisibility,
}: UseServerTableOptions) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialColumnVisibility)

    const pagination: PaginationState = useMemo(() => ({ pageIndex: page - 1, pageSize: limit }), [page, limit]);
    const sorting: SortingState = useMemo(() => ([{ id: sortBy, desc: order === "desc" }]), [sortBy, order])

    const pageCount = useMemo(() => meta?.totalPages ?? 0, [meta?.totalPages])
    const totalItems = useMemo(() => meta?.totalItems ?? 0, [meta?.totalItems])

    const handlePaginationChange = useCallback((updater: any) => {
        const next = typeof updater === "function" ? updater(pagination) : updater;
        setPagination(next.pageIndex + 1, next.pageSize)
    }, [pagination, setPagination])

    const handleSortingChange = useCallback((updater: any) => {
        const next = typeof updater === "function" ? updater(sorting) : updater
        if (!next.length) {
            setSorting(defaultSort.id, defaultSort.desc ? "desc" : "asc")
            return
        }
        const first = next[0]
        setSorting(first.id, first.desc ? "desc" : "asc")
    }, [sorting, setSorting, defaultSort])

    return {
        rowSelection,
        setRowSelection,
        columnVisibility,
        setColumnVisibility,
        pagination,
        sorting,
        pageCount,
        totalItems,
        handlePaginationChange,
        handleSortingChange,
    }
}
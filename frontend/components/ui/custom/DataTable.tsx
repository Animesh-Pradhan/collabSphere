"use client";

import { Box, Checkbox, Table, Flex, Text, Icon } from "@chakra-ui/react";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef, PaginationState, SortingState, RowSelectionState, OnChangeFn, getPaginationRowModel } from "@tanstack/react-table";
import { BiSortDown, BiSortUp } from "react-icons/bi";
import { IoPersonOutline } from "react-icons/io5";
import UIEmptyBox from "./UIEmptyBox";
import UIPagination from "./UIPagination";

type DataTableProps<T> = {
    data: T[];
    columns: ColumnDef<T, any>[];

    pageCount: number;
    totalItems: number;

    pagination: PaginationState;
    sorting: SortingState;
    rowSelection: RowSelectionState;

    columnVisibility: Record<string, boolean>;
    onColumnVisibilityChange: (updater: any) => void;

    onPaginationChange: OnChangeFn<PaginationState>;
    onSortingChange: OnChangeFn<SortingState>;
    onRowSelectionChange: OnChangeFn<RowSelectionState>;
};

export default function DataTable<T>({
    data,
    columns,
    pageCount,
    totalItems,
    pagination,
    sorting,
    rowSelection,
    columnVisibility,
    onColumnVisibilityChange,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
}: DataTableProps<T>) {
    const table = useReactTable({
        data,
        columns,
        state: { pagination, sorting, rowSelection, columnVisibility },

        pageCount,
        manualPagination: true,
        manualSorting: true,

        enableRowSelection: true,
        enableSortingRemoval: false,

        onPaginationChange,
        onSortingChange,
        onRowSelectionChange,
        onColumnVisibilityChange,

        getRowId: (row: any) => row.id,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <Box boxShadow={'md'} borderRadius="md" overflow="hidden">
            <Table.ScrollArea borderWidth="1px" w={'100%'}>
                <Table.Root size="sm" variant={'outline'} overflow={'auto'}>
                    <Table.Header bg="pallete.surfaceElevated2" h={'40px'} fontVariant={'all-petite-caps'} borderBottom={'2px solid'} borderColor={'pallete.borderSubtle'}>
                        {table.getHeaderGroups().map(headerGroup => (
                            <Table.Row key={headerGroup.id}>
                                <Table.ColumnHeader w="40px">
                                    <Checkbox.Root size="sm"
                                        checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
                                        onCheckedChange={(changes) => table.toggleAllRowsSelected(!!changes.checked)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control _checked={{ bg: "pallete.secondary_hover", color: "#fff" }} />
                                    </Checkbox.Root>
                                </Table.ColumnHeader>

                                {headerGroup.headers.map(header => {
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <Table.ColumnHeader key={header.id} fontSize={'16px'} userSelect="none" fontWeight="medium"
                                            textAlign={header.column.id === "actions" ? "end" : "start"}
                                            cursor={header.column.getCanSort() ? "pointer" : "default"}
                                            onClick={header.column.getToggleSortingHandler()}
                                            _hover={{ bg: header.column.getCanSort() ? { base: "#d9d9d9", _dark: "#2a2a2a" } : undefined }}
                                        >
                                            <Flex align="center" gap="1" justifyContent={header.column.id === "actions" ? "end" : "start"}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {sorted === "asc" && (<Icon mt={1}><BiSortUp /></Icon>)}
                                                {sorted === "desc" && (<Icon mt={1}><BiSortDown /></Icon>)}
                                            </Flex>
                                        </Table.ColumnHeader>
                                    );
                                })}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {table.getRowModel().rows.length === 0 && (
                            <Table.Row>
                                <Table.Cell colSpan={columns.length + 1}>
                                    <UIEmptyBox icon={IoPersonOutline} title="No Members available!" description="Invite members across the world." />
                                </Table.Cell>
                            </Table.Row>
                        )}

                        {table.getRowModel().rows.map(row => (
                            <Table.Row key={row.id}
                                bg={row.getIsSelected() ? { base: "#f5f9fa", _dark: "#242424" } : ""}
                                _hover={{ bg: { base: "#f5f5f5", _dark: "#242424" } }}
                                transition="background 0.2s"
                            >
                                <Table.Cell>
                                    <Checkbox.Root size="sm"
                                        checked={row.getIsSelected()}
                                        onCheckedChange={(changes) => row.toggleSelected(!!changes.checked)}
                                    >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control _checked={{ bg: "pallete.secondary_hover", color: "#fff" }} />
                                    </Checkbox.Root>
                                </Table.Cell>

                                {row.getVisibleCells().map(cell => (
                                    <Table.Cell key={cell.id} fontSize="14px">{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Cell>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Flex justify="space-between" align="center" px="2" py="3" borderTopWidth="1px" borderColor="pallete.borderSubtle">
                <Text fontSize="sm" color={'text.secondary'}>Page {pagination.pageIndex + 1} of {pageCount}</Text>
                <UIPagination
                    totalItems={totalItems}
                    pageSize={pagination.pageSize}
                    page={pagination.pageIndex + 1}
                    onPageChange={(e) => table.setPageIndex(e.page - 1)}
                    canPrevious={table.getCanPreviousPage()}
                    canNext={table.getCanNextPage()}
                />
            </Flex>
        </Box >
    );
}
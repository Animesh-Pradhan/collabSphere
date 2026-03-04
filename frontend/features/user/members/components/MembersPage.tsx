"use client";

import { ActionBar, Badge, Box, Checkbox, CloseButton, Flex, Input, InputGroup, Portal, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { UICombobox, UIButton, UIIconButton, DataTable, UIPopover } from "@/components/ui/custom";
import { OrganisationMember, useMembersStore } from "@/store/members/membes.store";
import { useMembersQuery } from "../hooks/useMembersQuery";

import { LuSearch, LuShare, LuTrash2 } from "react-icons/lu";
import { CiFilter } from "react-icons/ci";
import { RiResetRightFill } from "react-icons/ri";
import { PiTextColumns } from "react-icons/pi";
import { useServerDataTable } from "@/hooks";
import { dateColumn, textColumn } from "@/libs/table/tanstackTableHelper";
import { formatDate } from "@/utils/helper";
import { MdDelete, MdEdit } from "react-icons/md";

const statusColorMap: Record<string, string> = {
    ACTIVE: "green",
    SUSPENDED: "yellow",
    REMOVED: "red",
}

const ROLE_OPTIONS = ["OWNER", "ADMIN", "MEMBER", "MANAGER", "GUEST"] as const;
const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "REMOVED"] as const;
type RoleType = typeof ROLE_OPTIONS[number];
type StatusType = typeof STATUS_OPTIONS[number];

export default function MembersPage() {
    const { loading, isFetching, data, meta } = useMembersQuery();
    const { page, limit, sortBy, order, setPagination, setSorting, setFilters, search, role, status, fromDate, toDate } = useMembersStore();

    const defaultVisible = useMemo(() => (["user.firstName", "user.email", "user.signupSource", "joinedAt", "role"]), [])
    const columns = useMemo<ColumnDef<OrganisationMember>[]>(() => [
        textColumn<OrganisationMember>("user.firstName", "First Name"),
        textColumn<OrganisationMember>("user.lastName", "Last Name"),
        textColumn<OrganisationMember>("user.username", "Username"),
        textColumn<OrganisationMember>("user.email", "Email"),
        textColumn<OrganisationMember>("user.mobileNo", "Mobile No"),
        textColumn<OrganisationMember>("user.signupSource", "Signup Source"),
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            cell: (info) => {
                const value = info.getValue() as string
                return (
                    <Badge colorPalette={statusColorMap[value] ?? "gray"} variant="subtle" borderRadius="full" px="3">{value} </Badge>
                )
            },
        },
        textColumn<OrganisationMember>("role", "Role"),
        dateColumn<OrganisationMember>("joinedAt", "Joined At"),
        dateColumn<OrganisationMember>("user.createdAt", "Created At"),
        {
            id: "user.isEmailVerified",
            accessorKey: "user.isEmailVerified",
            header: "Email Verified",
            cell: (info) => info.getValue() ? <Badge colorScheme="green" variant="subtle">Verified</Badge> : <Badge colorScheme="red" variant="subtle">Not Verified</Badge>
        },
        {
            id: "user.isMobileVerified",
            accessorKey: "user.isMobileVerified",
            header: "Mobile Verified",
            cell: (info) => info.getValue() ? <Badge colorScheme="green" variant="subtle">Verified</Badge> : <Badge colorScheme="red" variant="subtle">Not Verified</Badge>
        },
        {
            id: "user.lastLoginAt",
            accessorKey: "user.lastLoginAt",
            header: "Last Login",
            cell: (info) => info.getValue() ? formatDate(info.getValue() as string, { format: "relative" }) : "-",
        },
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {
                const member = row.original;
                return (
                    <Flex gap={2} justifyContent={'flex-end'}>
                        <UIIconButton btnType="outline" size={'2xs'}><MdEdit /></UIIconButton>
                        <UIIconButton btnType="delete" size={'2xs'}><MdDelete /></UIIconButton>
                    </Flex>
                );
            },
        }
    ], [])
    const initialColumnVisibility = useMemo(() => {
        return columns.reduce((acc, col) => {
            if (!col.id) return acc
            acc[col.id] = defaultVisible.includes(col.id)
            return acc
        }, {} as Record<string, boolean>)
    }, [columns, defaultVisible])
    const { rowSelection, setRowSelection, columnVisibility, setColumnVisibility, pagination, sorting, pageCount, totalItems, handlePaginationChange, handleSortingChange } = useServerDataTable({
        meta, page, limit,
        sortBy, order, setPagination,
        setSorting, defaultSort: { id: "joinedAt", desc: true },
        initialColumnVisibility
    })


    if (loading) return <Flex alignItems={'center'} justifyContent={'center'} h={'-webkit-fill-available'}><Spinner /></Flex>;
    return (<Flex flexDirection="column" gap="4" minW={0} flex={'1'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={4} px={2}>
        <Flex justifyContent={'flex-end'} gap={2}>
            <Flex gap={2} w={'max-content'}>
                <InputGroup startElement={<LuSearch />} w={{ base: "150px", md: "200px", xl: '300px' }}>
                    <Input size={'xs'} placeholder="Search..." value={search} onChange={(e) => setFilters({ search: e.target.value })} />
                </InputGroup>

                <UIPopover trigger={<UIButton btnType="outline"><CiFilter /> Filters</UIButton>}>
                    <Flex direction="column" gap="4">
                        <UICombobox
                            data={[...ROLE_OPTIONS.map(r => ({ label: r, value: r }))]}
                            value={role ?? ""}
                            onChange={(value) => setFilters({ role: value === "" ? null : (value as RoleType) })}
                            placeholder="Filter by Role"
                        />
                        <UICombobox
                            data={[...STATUS_OPTIONS.map(s => ({ label: s, value: s }))]}
                            value={status ?? ""}
                            onChange={(value) => setFilters({ status: value === "" ? null : (value as StatusType) })}
                            placeholder="Filter by Status"
                        />
                        <Flex gap={2}>
                            <Flex gap={0} w={'100%'} flexDir={'column'}>
                                <Text color={'text.secondary'} fontSize={'12px'}>From Date: </Text>
                                <Input size={'xs'} type="date" value={fromDate ?? ""} onChange={(e) => setFilters({ fromDate: e.target.value || null })} />
                            </Flex>
                            <Flex gap={0} w={'100%'} flexDir={'column'}>
                                <Text color={'text.secondary'} fontSize={'12px'}>To Date: </Text>
                                <Input size={'xs'} type="date" value={toDate ?? ""} onChange={(e) => setFilters({ toDate: e.target.value || null })} />
                            </Flex>
                        </Flex>
                    </Flex>
                </UIPopover>

                <UIPopover trigger={<UIIconButton btnType="outline"><PiTextColumns /></UIIconButton>}>
                    <Flex direction="column" gap={2}>
                        {columns.map((col) => {
                            if (!col.id) return null
                            return (
                                <Checkbox.Root key={col.id}
                                    checked={columnVisibility[col.id] ?? true}
                                    onCheckedChange={(e) => setColumnVisibility((prev) => ({ ...prev, [col.id!]: !!e.checked }))}
                                >
                                    <Checkbox.HiddenInput />
                                    <Checkbox.Control />
                                    <Checkbox.Label>{typeof col.header === "string" ? col.header : col.id}</Checkbox.Label>
                                </Checkbox.Root>
                            )
                        })}
                    </Flex>
                </UIPopover>

                <UIIconButton btnType={'outline'} onClick={() => setFilters({ search: "", role: null, status: null, fromDate: null, toDate: null })}>
                    <RiResetRightFill />
                </UIIconButton>
            </Flex>

            <UIButton btnType={'primary'}>Add Member</UIButton>
        </Flex>

        <Box position="relative" w="100%" minW="0" overflow="hidden">
            <Flex
                position="absolute"
                inset="0"
                bg="rgba(0,0,0,0.2)"
                backdropFilter="blur(1px)"
                justify="center"
                align="center"
                zIndex="5"
                borderRadius="md"
                opacity={isFetching ? 1 : 0}
                pointerEvents={isFetching ? "auto" : "none"}
                transition="opacity 0.2s ease"
            >
                <Spinner size="sm" />
            </Flex>

            <DataTable<OrganisationMember>
                data={data}
                columns={columns}
                pageCount={pageCount}
                totalItems={totalItems}
                pagination={pagination}
                sorting={sorting}
                rowSelection={rowSelection}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onPaginationChange={handlePaginationChange}
                onSortingChange={handleSortingChange}
                onRowSelectionChange={setRowSelection}
            />
        </Box>

        <ActionBar.Root open={Object.keys(rowSelection).length > 0} closeOnInteractOutside={false}>
            <Portal>
                <ActionBar.Positioner>
                    <ActionBar.Content>
                        <ActionBar.SelectionTrigger>{Object.keys(rowSelection).length} selected</ActionBar.SelectionTrigger>
                        <ActionBar.Separator />
                        <UIButton btnType="outline" size="sm"><LuTrash2 /> Delete</UIButton>
                        <UIButton variant="outline" size="sm"><LuShare /> Share</UIButton>
                        <ActionBar.CloseTrigger asChild onClick={() => setRowSelection({})}><CloseButton size="sm" /></ActionBar.CloseTrigger>
                    </ActionBar.Content>
                </ActionBar.Positioner>
            </Portal>
        </ActionBar.Root>
    </Flex>)
}
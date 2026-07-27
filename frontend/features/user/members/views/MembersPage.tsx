"use client";

import { ActionBar, Badge, Box, Checkbox, CloseButton, Flex, Input, InputGroup, Portal, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useShallow } from "zustand/shallow";

import { UICombobox, UIButton, UIIconButton, DataTable, UIPopover, ConfirmDialog } from "@/components/ui/custom";
import { MembersState, OrganisationMember, useMembersStore } from "@/store/members/membes.store";
import { useMembersQuery } from "../hooks/useMembersQuery";

import { LuSearch, LuShare, LuTrash2 } from "react-icons/lu";
import { CiFilter } from "react-icons/ci";
import { RiResetRightFill } from "react-icons/ri";
import { PiTextColumns } from "react-icons/pi";
import { useServerDataTable } from "@/hooks";
import { dateColumn, textColumn } from "@/libs/table/tanstackTableHelper";
import { formatDate } from "@/utils/helper";
import { MdDelete, MdEdit } from "react-icons/md";
import { useDialogAction } from "@/components/ui/custom";
import { useDeleteMember } from "../hooks/useDeleteMember";
import EditMemberDialog from "../dialogs/updateMember";
import InviteMemberDialog from "../dialogs/inviteMember";

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
    const { loading, isFetching, data, meta } = useMembersQuery({ all: false });
    const [page, limit, sortBy, order, search, role, status, fromDate, toDate] = useMembersStore(
        useShallow((s: MembersState) => [s.page, s.limit, s.sortBy, s.order, s.search, s.role, s.status, s.fromDate, s.toDate])
    )
    const [setPagination, setSorting, setFilters] = useMembersStore(useShallow((s: MembersState) => [s.setPagination, s.setSorting, s.setFilters]))

    const { deleteMember, loading: deleteLoading } = useDeleteMember();
    const deleteMemberDialog = useDialogAction<OrganisationMember>();
    const editMemberDialog = useDialogAction<OrganisationMember>();
    const inviteMemberDialog = useDialogAction<null>();

    const defaultVisible = useMemo(() => (["user.firstName", "user.email", "user.signupSource", "joinedAt", "role"]), [])
    const openDeleteDialog = deleteMemberDialog.open;
    const openEditDialog = editMemberDialog.open;

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
                return (
                    <Flex gap={2} justifyContent={'flex-end'}>
                        <UIIconButton btnType="outline" size={'2xs'} onClick={() => openEditDialog(row.original)}><MdEdit /></UIIconButton>
                        <UIIconButton loading={deleteLoading} btnType="delete" size={'2xs'} onClick={() => openDeleteDialog(row.original)}><MdDelete /></UIIconButton>
                    </Flex>
                );
            },
        }
    ], [openDeleteDialog, deleteLoading, openEditDialog]);
    const initialColumnVisibility = useMemo(() => {
        return columns.reduce((acc, col) => {
            if (!col.id) return acc
            if (col.id === "actions") {
                acc[col.id] = true
            } else {
                acc[col.id] = defaultVisible.includes(col.id)
            }
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
        <Flex justifyContent={'space-between'} gap={2}>
            <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>Org. Members</Text>
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

            <UIButton btnType={'primary'} onClick={() => inviteMemberDialog.open(null)}>Add Member</UIButton>
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


        <ConfirmDialog
            dialog={deleteMemberDialog.dialog}
            title="Delete Member"
            description={
                deleteMemberDialog.data
                    ? `Are you sure you want to delete ${deleteMemberDialog.data.user.firstName}?`
                    : "Are you sure?"
            }
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={async () => {
                if (!deleteMemberDialog.data) return
                deleteMember({ memberIds: [deleteMemberDialog.data.id] });
                deleteMemberDialog.close()
            }}
            onClose={deleteMemberDialog.close}
        />

        <EditMemberDialog dialog={editMemberDialog} />
        <InviteMemberDialog dialog={inviteMemberDialog} />
    </Flex>)
}
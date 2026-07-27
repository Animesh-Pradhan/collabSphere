"use client";

import { useWorkspaceMembersStore, WorkspaceMember, WorkspaceMembersState } from "@/store/members/workspaceMembers.store"
import { useRemoveWorkspaceMember, useWorkspaceMembersQuery } from "../hooks/useWorkspaceMembers"
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { dateColumn, textColumn } from "@/libs/table/tanstackTableHelper";
import { ActionBar, Badge, Box, Checkbox, CloseButton, Flex, Input, InputGroup, Portal, Spinner, Text } from "@chakra-ui/react";
import { ConfirmDialog, DataTable, UIButton, UICombobox, UIIconButton, UIPopover, useDialogAction } from "@/components/ui/custom";
import { MdDelete, MdEdit } from "react-icons/md";
import { LuSearch, LuShare, LuTrash2 } from "react-icons/lu";
import { CiFilter } from "react-icons/ci";
import { WorkspaceMemberRole, WorkspaceMemberSource, WorkspaceMemberStatus } from "../types/workspaceMembers.type";
import { PiTextColumns } from "react-icons/pi";
import { useServerDataTable } from "@/hooks";
import { RiResetRightFill } from "react-icons/ri";
import AddWorkspaceMemberDialog from "../dialogs/AddWorkspaceMemberDialog";
import UpdateWorkspaceMemberRoleDialog from "../dialogs/UpdateWorkspaceMemberRoleDialog";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { useAuthStore } from "@/store/auth.store";


const STATUS_OPTIONS = [WorkspaceMemberStatus.ACTIVE, WorkspaceMemberStatus.LEFT, WorkspaceMemberStatus.PENDING, WorkspaceMemberStatus.REMOVED, WorkspaceMemberStatus.SUSPENDED] as const
const ROLE_OPTIONS = [WorkspaceMemberRole.COMMENTER, WorkspaceMemberRole.EDITOR, WorkspaceMemberRole.OWNER, WorkspaceMemberRole.VIEWER] as const
const SOURCE_OPTION = [WorkspaceMemberSource.EXTERNAL, WorkspaceMemberSource.INTERNAL]
type StatusType = typeof STATUS_OPTIONS[number]
type RolesType = typeof ROLE_OPTIONS[number]
type SourceType = typeof SOURCE_OPTION[number]

export default function WorkspaceMembersPage() {
    const { loading, isFetching, data, meta } = useWorkspaceMembersQuery()
    const { activeWorkspace } = useWorkspacesStore();
    const { context } = useAuthStore();
    const [page, limit, sortBy, order, search, fromDate, toDate, role, status, source] = useWorkspaceMembersStore(
        useShallow((s: WorkspaceMembersState) => [s.page, s.limit, s.sortBy, s.order, s.search, s.fromDate, s.toDate, s.role, s.status, s.source])
    );

    const [setPagination, setSorting, setFilters] = useWorkspaceMembersStore(useShallow((s: WorkspaceMembersState) => [s.setPagination, s.setSorting, s.setFilters]))

    const myWorkspaceRole = activeWorkspace?.membership?.role;
    const myOrgRole = context?.organisation?.role;

    const canManageWorkspaceMembers = myOrgRole === "OWNER" || myOrgRole === "ADMIN" || myWorkspaceRole === WorkspaceMemberRole.OWNER;

    const addWorkspaceMemberDialog = useDialogAction<null>();
    const updateRoleDialog = useDialogAction<WorkspaceMember>();
    const removeMemberDialog = useDialogAction<WorkspaceMember>();
    const { removeWorkspaceMember, loading: removeLoading } = useRemoveWorkspaceMember();

    const defaultVisible = ["user.firstName", "user.email", "role", "status", "source", "joinedAt"];
    const columns = useMemo<ColumnDef<WorkspaceMember>[]>(() => [
        textColumn<WorkspaceMember>("user.firstName", "First Name"),
        textColumn<WorkspaceMember>("user.lastName", "Last Name"),
        textColumn<WorkspaceMember>("user.username", "Username"),
        textColumn<WorkspaceMember>("user.email", "Email"),
        textColumn<WorkspaceMember>("user.mobileNo", "Mobile No"),
        { id: "role", accessorKey: "role", header: "Role" },
        {
            id: "status", accessorKey: "status", header: "Status",
            cell: (info) => {
                const value = info.getValue() as WorkspaceMember["status"];
                const statusColorMap = { ACTIVE: "green", PENDING: "yellow", SUSPENDED: "orange", REMOVED: "red", LEFT: "gray" };

                return (
                    <Badge colorPalette={statusColorMap[value] ?? "gray"} variant="subtle" borderRadius="full" px="3">
                        {value}
                    </Badge>
                );
            },
        },
        {
            id: "source", accessorKey: "source", header: "Source",
            cell: (info) => {
                const value = info.getValue() as WorkspaceMember["source"];
                return (
                    <Badge colorPalette={value === "internal" ? "blue" : "purple"} variant="subtle" borderRadius="full" px="3">
                        {value}
                    </Badge>
                );
            },
        },
        dateColumn<WorkspaceMember>("joinedAt", "Joined At"),
        dateColumn<WorkspaceMember>("lastActiveAt", "Last Active"),
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => {
                const member = row.original;
                const canEdit = canManageWorkspaceMembers && member.role !== WorkspaceMemberRole.OWNER;

                return (
                    <Flex justifyContent="flex-end" gap={2}>
                        {canEdit && <>
                            <UIIconButton btnType="outline" size="2xs" onClick={() => updateRoleDialog.open(member)}>
                                <MdEdit />
                            </UIIconButton>
                            <UIIconButton btnType="delete" size="2xs" loading={removeLoading} onClick={() => removeMemberDialog.open(member)}>
                                <MdDelete />
                            </UIIconButton>
                        </>}

                    </Flex>
                );
            },
        },
    ], [removeLoading, updateRoleDialog, removeMemberDialog, canManageWorkspaceMembers]);
    const initialColumnVisibility = useMemo(() => {
        return columns.reduce((acc, col) => {
            if (!col.id) return acc;

            if (col.id === "actions") {
                acc[col.id] = true;
            } else {
                acc[col.id] = defaultVisible.includes(col.id);
            }

            return acc;
        }, {} as Record<string, boolean>);
    }, [columns]);

    const { rowSelection, setRowSelection, columnVisibility, setColumnVisibility, pagination, sorting, pageCount, totalItems, handlePaginationChange, handleSortingChange } = useServerDataTable({
        meta, page, limit,
        sortBy, order, setPagination,
        setSorting, defaultSort: { id: "joinedAt", desc: true },
        initialColumnVisibility
    })

    if (loading) return <Flex alignItems={'center'} justifyContent={'center'} w={'100%'} h={'300px'}><Spinner /></Flex>;
    return (
        <Flex flexDirection="column" gap="4" minW={0} flex={'1'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={4} px={2}>

            <Flex justifyContent={'space-between'} gap={2}>
                <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>Workspace Members</Text>
                <Flex gap={2} w={'max-content'}>
                    <InputGroup startElement={<LuSearch />} w={{ base: "150px", md: "200px", xl: '300px' }}>
                        <Input size={'xs'} placeholder="Search..." value={search} onChange={(e) => setFilters({ search: e.target.value })} />
                    </InputGroup>

                    <UIPopover trigger={<UIButton btnType="outline"><CiFilter /> Filters</UIButton>}>
                        <Flex direction="column" gap="4">
                            <UICombobox
                                data={[...ROLE_OPTIONS.map(s => ({ label: s, value: s }))]}
                                value={role ?? ""}
                                onChange={(value) => setFilters({ role: value === "" ? null : (value as RolesType) })}
                                placeholder="Filter by Role"
                            />
                            <UICombobox
                                data={[...STATUS_OPTIONS.map(r => ({ label: r, value: r }))]}
                                value={status ?? ""}
                                onChange={(value) => setFilters({ status: value === "" ? null : (value as StatusType) })}
                                placeholder="Filter by Status"
                            />
                            <UICombobox
                                data={[...SOURCE_OPTION.map(r => ({ label: r, value: r }))]}
                                value={source ?? ""}
                                onChange={(value) => setFilters({ source: value === "" ? null : (value as SourceType) })}
                                placeholder="Filter by Source"
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

                    <UIIconButton btnType={'outline'} onClick={() => setFilters({ search: "", status: null, fromDate: null, toDate: null })}>
                        <RiResetRightFill />
                    </UIIconButton>

                    {/* {canCreateWorkspace && (
                        <UIButton btnType="primary" onClick={() => addWorkspaceDialog.open(null)}>
                            Add Workspace
                        </UIButton>
                    )} */}

                    {canManageWorkspaceMembers && <UIButton btnType="primary" onClick={() => addWorkspaceMemberDialog.open(null)}>
                        Add Member
                    </UIButton>}
                </Flex>
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

                <DataTable<WorkspaceMember>
                    noDataTitle="No workspace members added"
                    noDataDescription="You haven't added any workspaces members yet."
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
                dialog={removeMemberDialog.dialog}
                title="Delete Workspace"
                description={
                    removeMemberDialog.data
                        ? `Are you sure you want to delete "${removeMemberDialog.data.user.firstName} ${removeMemberDialog.data.user.lastName}"?`
                        : "Are you sure?"
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={async () => {
                    if (!activeWorkspace || !removeMemberDialog.data) return;
                    removeWorkspaceMember({ workspaceId: activeWorkspace.id, memberId: removeMemberDialog.data.id });
                    removeMemberDialog.close();
                }}
                onClose={removeMemberDialog.close}
            />
            <AddWorkspaceMemberDialog dialog={addWorkspaceMemberDialog} />
            <UpdateWorkspaceMemberRoleDialog dialog={updateRoleDialog} />
        </Flex>
    )
}

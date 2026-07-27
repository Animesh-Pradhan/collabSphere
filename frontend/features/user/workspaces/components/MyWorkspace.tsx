import React, { useMemo } from 'react'
import { useWorkspacesQuery } from '../hooks/useGetWorkspaces'
import { Workspace, WorkspacesState, useWorkspacesStore } from '@/store/workspaces/workspaces.store';
import { useShallow } from 'zustand/shallow';
import { ColumnDef } from '@tanstack/react-table';
import { dateColumn, textColumn } from '@/libs/table/tanstackTableHelper';
import { ActionBar, Badge, Box, Checkbox, CloseButton, Flex, Input, InputGroup, Portal, Spinner, Text } from '@chakra-ui/react';
import { ConfirmDialog, DataTable, UIButton, UICombobox, UIIconButton, UIPopover, useDialogAction } from '@/components/ui/custom';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useServerDataTable } from '@/hooks';
import { LuSearch, LuShare, LuTrash2 } from 'react-icons/lu';
import { CiFilter } from 'react-icons/ci';
import { WorkspaceStatus, WorkspaceType } from '../types/types';
import { PiTextColumns } from 'react-icons/pi';
import { RiResetRightFill } from 'react-icons/ri';
import { useAuthStore } from '@/store/auth.store';
import { useDeleteWorkspace } from '../hooks/useWorkspace';
import AddWorkspaceDialog from '../dialogs/AddWorkspaceDialog';
import UpdateWorkspaceDialog from '../dialogs/UpdateWorkspaceDialog';

const STATUS_OPTIONS = [WorkspaceStatus.ACTIVE, WorkspaceStatus.ARCHIVED, WorkspaceStatus.LOCKED] as const
const TYPE_OPTIONS = [WorkspaceType.ORGANISATION, WorkspaceType.PERSONAL] as const
type StatusType = typeof STATUS_OPTIONS[number]
type TypeType = typeof TYPE_OPTIONS[number]

export default function MyWorkspace() {
    const { context, user } = useAuthStore();
    const { loading, isFetching, data, meta } = useWorkspacesQuery("MY");
    const [page, limit, sortBy, order, search, type, status, fromDate, toDate] = useWorkspacesStore(
        useShallow((s: WorkspacesState) => [s.page, s.limit, s.sortBy, s.order, s.search, s.type, s.status, s.fromDate, s.toDate])
    )
    const [setPagination, setSorting, setFilters] = useWorkspacesStore(useShallow((s: WorkspacesState) => [s.setPagination, s.setSorting, s.setFilters]))

    const addWorkspaceDialog = useDialogAction<null>();
    const updateWorkspaceDialog = useDialogAction<Workspace>();
    const deleteWorkspaceDialog = useDialogAction<Workspace>();

    const canCreateWorkspace = context?.mode === "PERSONAL" || ["OWNER", "ADMIN"].includes(context?.organisation?.role ?? "");

    const { deleteMember: deleteWorkspace, loading: deleteLoading } = useDeleteWorkspace();

    const defaultVisible = ["name", "type", "organisation", "owner", "membership.role", "status", "createdAt"];
    const columns = useMemo<ColumnDef<Workspace>[]>(() => [
        textColumn<Workspace>("name", "Workspace"),
        textColumn<Workspace>("type", "Type"),
        textColumn<Workspace>("organisation.name", "Organisation"),
        {
            id: "owner",
            accessorKey: "owner.firstName",
            header: "Owner",
            cell: ({ row }) => {
                const owner = row.original.owner;
                const name = `${owner.firstName} ${owner.lastName}`;
                return name;
            }
        },
        textColumn<Workspace>("membership.role", "My Role"),
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            cell: (info) => {
                const value = info.getValue() as Workspace["status"];

                const statusColorMap = {
                    active: "green",
                    archived: "yellow",
                    locked: "red"
                };

                return (
                    <Badge colorPalette={statusColorMap[value] ?? "gray"} variant="subtle" borderRadius="full" px="3">{value}</Badge>
                );
            }
        },
        textColumn<Workspace>("counts.members", "Members"),
        textColumn<Workspace>("counts.tasks", "Tasks"),
        textColumn<Workspace>("counts.documents", "Documents"),
        dateColumn<Workspace>("createdAt", "Created At"),
        {
            id: "actions", header: "Actions", enableSorting: false,
            cell: ({ row }) => {
                const workspace = row.original;
                const isOwner = workspace.owner.id === user?.id;

                return (<Flex justifyContent={'flex-end'} gap={2}>

                    {isOwner && <>
                        <UIIconButton btnType="outline" size="2xs" onClick={() => updateWorkspaceDialog.open(workspace)}>
                            <MdEdit />
                        </UIIconButton>

                        <UIIconButton btnType="delete" size="2xs" loading={deleteLoading} onClick={() => deleteWorkspaceDialog.open(workspace)}>
                            <MdDelete />
                        </UIIconButton>
                    </>}

                </Flex>)
            },
        }
    ], [user?.id, deleteLoading, updateWorkspaceDialog, deleteWorkspaceDialog])

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

    if (loading) return <Flex alignItems={'center'} justifyContent={'center'} h={'200px'}><Spinner /></Flex>;
    return (
        <Flex flexDirection="column" gap="4" minW={0} flex={'1'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={4} px={2}>
            <Flex justifyContent={'space-between'} gap={2}>
                <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>Workspaces</Text>
                <Flex gap={2} w={'max-content'}>
                    <InputGroup startElement={<LuSearch />} w={{ base: "150px", md: "200px", xl: '300px' }}>
                        <Input size={'xs'} placeholder="Search..." value={search} onChange={(e) => setFilters({ search: e.target.value })} />
                    </InputGroup>

                    <UIPopover trigger={<UIButton btnType="outline"><CiFilter /> Filters</UIButton>}>
                        <Flex direction="column" gap="4">
                            <UICombobox
                                data={[...TYPE_OPTIONS.map(r => ({ label: r, value: r }))]}
                                value={type ?? ""}
                                onChange={(value) => setFilters({ type: value === "" ? null : (value as TypeType) })}
                                placeholder="Filter by Type"
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

                    <UIIconButton btnType={'outline'} onClick={() => setFilters({ search: "", status: null, fromDate: null, toDate: null })}>
                        <RiResetRightFill />
                    </UIIconButton>

                    {canCreateWorkspace && (
                        <UIButton btnType="primary" onClick={() => addWorkspaceDialog.open(null)}>
                            Add Workspace
                        </UIButton>
                    )}
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

                <DataTable<Workspace>
                    noDataTitle="No workspaces found"
                    noDataDescription="You're not a member of any workspace yet. Join an existing workspace or create a new one to get started."
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
                dialog={deleteWorkspaceDialog.dialog}
                title="Delete Workspace"
                description={
                    deleteWorkspaceDialog.data
                        ? `Are you sure you want to delete "${deleteWorkspaceDialog.data.name}"?`
                        : "Are you sure?"
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={async () => {
                    if (!deleteWorkspaceDialog.data) return;

                    deleteWorkspace({
                        workspaceId: deleteWorkspaceDialog.data.id,
                    });

                    deleteWorkspaceDialog.close();
                }}
                onClose={deleteWorkspaceDialog.close}
            />
            <AddWorkspaceDialog dialog={addWorkspaceDialog} />
            <UpdateWorkspaceDialog dialog={updateWorkspaceDialog} />

        </Flex>
    )
}

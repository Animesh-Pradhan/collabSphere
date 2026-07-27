"use client"

import { InvitationsState, useInvitationsStore } from "@/store/members/invitation.store";
import { useInvitationMember } from "../hooks/useInvitationMember";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { InviteStatus, OrganisationInvitation } from "../types/invitation.type";
import { dateColumn, textColumn } from "@/libs/table/tanstackTableHelper";
import { ActionBar, Avatar, Badge, Box, Checkbox, CloseButton, Flex, Input, InputGroup, Portal, Spinner, Text } from "@chakra-ui/react";
import { DataTable, UIButton, UICombobox, UIIconButton, UIPopover, UIMenu, useDialogAction, ConfirmDialog } from "@/components/ui/custom";
import { MdContentCopy, MdDelete, MdEdit, MdOutlineCancel } from "react-icons/md";
import { LuSearch, LuShare, LuTrash2 } from "react-icons/lu";
import { CiFilter } from "react-icons/ci";
import { PiTextColumns } from "react-icons/pi";
import { useServerDataTable } from "@/hooks";
import { RiResetRightFill } from "react-icons/ri";

import { IoSettingsOutline } from "react-icons/io5";
import { FiRotateCw } from "react-icons/fi";
import { useInvitationActions } from "../hooks/useInvitationActions";

const statusColorMap: Record<InviteStatus, string> = {
    [InviteStatus.PENDING]: "yellow",
    [InviteStatus.ACCEPTED]: "green",
    [InviteStatus.EXPIRED]: "gray",
    [InviteStatus.CANCELLED]: "red"
}
const STATUS_OPTIONS = [InviteStatus.PENDING, InviteStatus.ACCEPTED, InviteStatus.EXPIRED, InviteStatus.CANCELLED] as const
type StatusType = typeof STATUS_OPTIONS[number]

export default function InvitationsPage() {
    const { loading, isFetching, data, meta } = useInvitationMember();
    const [page, limit, sortBy, order, search, role, fromDate, toDate] = useInvitationsStore(
        useShallow((s: InvitationsState) => [s.page, s.limit, s.sortBy, s.order, s.search, s.status, s.fromDate, s.toDate])
    )
    const [setPagination, setSorting, setFilters] = useInvitationsStore(useShallow((s: InvitationsState) => [s.setPagination, s.setSorting, s.setFilters]))

    const cancelInvitationDialog = useDialogAction<OrganisationInvitation>();
    const resendInvitationDialog = useDialogAction<OrganisationInvitation>();
    const openCancelInvitationDialog = cancelInvitationDialog.open;
    const openResendInvitationDialog = resendInvitationDialog.open;
    const { resendInvite, cancelInvite, loadingResend, loadingCancel } = useInvitationActions();

    const defaultVisible = useMemo(() => (["invitedBy", "invitedUser.firstName", "invitedUser.email", "email", "role", "status", "invitedAt"]), [])
    const columns = useMemo<ColumnDef<OrganisationInvitation>[]>(() => [
        {
            id: "invitedBy",
            accessorKey: "invitedUser.firstName",
            header: "Invited By",
            cell: ({ row }) => {
                const user = row.original.invitedUser
                if (!user) return "-"

                const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`
                return (
                    <Flex alignItems="center" gap={1}>
                        <Avatar.Root shape="full" size="2xs">
                            <Avatar.Fallback name={`${user?.firstName} ${user?.lastName}`} />
                            {user.avatar && <Avatar.Image src={user?.avatar} />}
                        </Avatar.Root>
                        <Text fontSize="sm">{name}</Text>
                    </Flex>
                )
            }
        },
        textColumn<OrganisationInvitation>("email", "Invitation Email"),
        textColumn<OrganisationInvitation>("organisation.name", "Organisation"),
        { id: "role", accessorKey: "role", header: "Role" },
        {
            id: "status", accessorKey: "status", header: "Status",
            cell: (info) => {
                const value = info.getValue() as InviteStatus
                return (<Badge colorPalette={statusColorMap[value] ?? "gray"} variant="subtle" borderRadius="full" px="3"> {value}</Badge>)
            }
        },
        dateColumn<OrganisationInvitation>("invitedAt", "Invited At"),
        dateColumn<OrganisationInvitation>("acceptedAt", "Accepted At"),
        dateColumn<OrganisationInvitation>("expiresAt", "Expires At"),
        {
            id: "actions", header: "Actions", enableSorting: false,
            cell: ({ row }) => {
                const invite = row.original;

                return (<Flex justifyContent={'flex-end'}>
                    {invite.status === InviteStatus.PENDING ? <UIMenu trigger={<UIIconButton btnType="outline" size={'2xs'}><IoSettingsOutline /></UIIconButton>}>
                        <UIMenu.Item value="resend" onClick={() => openResendInvitationDialog(row.original)}>
                            <FiRotateCw />
                            Resend Invite
                        </UIMenu.Item>
                        <UIMenu.Item value="copy">
                            <MdContentCopy />
                            Copy Invite Link
                        </UIMenu.Item>
                        <UIMenu.Separator />
                        <UIMenu.Item value="cancel" color="fg.error" onClick={() => openCancelInvitationDialog(row.original)}>
                            <MdOutlineCancel />
                            Cancel Invite
                        </UIMenu.Item>
                    </UIMenu> : <Text color="text.muted" pe={4}>-</Text>}
                </Flex>)
            },
        }

    ], [openResendInvitationDialog, openCancelInvitationDialog])
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
        setSorting, defaultSort: { id: "invitedAt", desc: true },
        initialColumnVisibility
    })

    if (loading) return <Flex alignItems={'center'} justifyContent={'center'} h={'-webkit-fill-available'}><Spinner /></Flex>;
    return (
        <Flex flexDirection="column" gap="4" minW={0} flex={'1'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={4} px={2}>
            <Flex justifyContent={'space-between'} gap={2}>
                <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>All Invitations</Text>
                <Flex gap={2} w={'max-content'}>
                    <InputGroup startElement={<LuSearch />} w={{ base: "150px", md: "200px", xl: '300px' }}>
                        <Input size={'xs'} placeholder="Search..." value={search} onChange={(e) => setFilters({ search: e.target.value })} />
                    </InputGroup>

                    <UIPopover trigger={<UIButton btnType="outline"><CiFilter /> Filters</UIButton>}>
                        <Flex direction="column" gap="4">
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
                                    <Checkbox.Root key={col.id} checked={columnVisibility[col.id] ?? true} onCheckedChange={(e) => setColumnVisibility((prev) => ({ ...prev, [col.id!]: !!e.checked }))}>
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
                </Flex>
            </Flex>

            <Box position="relative" w="100%" minW="0" overflow="hidden">
                <Flex position="absolute" inset="0"
                    bg="rgba(0,0,0,0.2)" backdropFilter="blur(1px)" opacity={isFetching ? 1 : 0}
                    pointerEvents={isFetching ? "auto" : "none"}
                    justify="center" align="center" zIndex="5" borderRadius="md"
                    transition="opacity 0.2s ease"
                >
                    <Spinner size="sm" />
                </Flex>

                <DataTable<OrganisationInvitation>
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

            <ConfirmDialog dialog={resendInvitationDialog.dialog} title="Resend Invitation"
                description={resendInvitationDialog.data ? `Resend invitation to ${resendInvitationDialog.data.email}?` : "Resend invitation?"}
                confirmText="Resend"
                isLoading={loadingResend}
                onConfirm={async () => {
                    if (!resendInvitationDialog.data) return;

                    await resendInvite({ invitationId: resendInvitationDialog.data.id });
                    resendInvitationDialog.close();
                }}
                onClose={resendInvitationDialog.close}
            />

            <ConfirmDialog dialog={cancelInvitationDialog.dialog} confirmText="Cancel Invite" isLoading={loadingCancel}
                title="Cancel Invitation"
                description={
                    cancelInvitationDialog.data
                        ? `Cancel invitation for ${cancelInvitationDialog.data.email}?`
                        : "Cancel invitation?"
                }
                onConfirm={async () => {
                    if (!cancelInvitationDialog.data) return;

                    await cancelInvite({ invitationId: cancelInvitationDialog.data.id });
                    cancelInvitationDialog.close();
                }}
                onClose={cancelInvitationDialog.close}
            />

        </Flex>
    )
}

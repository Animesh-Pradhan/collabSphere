"use client"

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useShallow } from "zustand/shallow";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useRef, useState } from "react";
import { Badge, Box, Checkbox, Flex, Input, InputGroup, SegmentGroup, Spinner, Text } from "@chakra-ui/react";
import { ConfirmDialog, DataTable, UIButton, UICombobox, UIIconButton, UIMenu, UIPopover, useDialogAction } from "@/components/ui/custom";

import { MdArchive, MdDelete, MdEdit, MdHistory, MdListAlt, MdLock, MdLockOpen, MdOpenInNew, MdOutlineStarBorder, MdPublish, MdRestore, MdStar } from "react-icons/md";
import { CiFilter } from "react-icons/ci";
import { LuSearch } from "react-icons/lu";
import { PiTextColumns } from "react-icons/pi";
import { RiResetRightFill } from "react-icons/ri";
import { IoDocuments, IoSettingsOutline } from "react-icons/io5";

import { dateColumn, textColumn, userColumn } from "@/libs/table/tanstackTableHelper";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { DocumentsState, DocumentView, useDocumentsStore } from "@/store/documents/documents.store";
import { useServerDataTable } from "@/hooks";
import RecentDocumentActivities from "../components/RecentDocumentActivities";
import { WorkspaceMemberRole } from "../../members/types/workspaceMembers.type";
import { useDocumentsQuery, useUpdateDocument, useArchiveDocument, useDeleteDocument, useDuplicateDocument, useLockDocument, useRestoreDocument, usePublishDocument, useUnlockDocument, useFavoriteDocument, useUnfavoriteDocument } from "../hooks/useDocument";
import { Documents, DocumentStatus } from "../types/types";
import DocumentPageDialogs from "../components/DocumentPageDialogs";
import UpdateDocumentDialog from "../dialogs/UpdateDocumentDialog";
import FavoriteStar from "../components/FavoriteStar";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [DocumentStatus.ARCHIVED, DocumentStatus.DRAFT, DocumentStatus.PUBLISHED] as const
type StatusType = typeof STATUS_OPTIONS[number]

export default function DocumentsPage() {
    const activityRef = useRef<HTMLDivElement | null>(null);
    const [activityOpen, setActivityOpen] = useState(true);
    const router = useRouter();

    const { loading, isFetching, data, meta } = useDocumentsQuery();
    const { activeWorkspace } = useWorkspacesStore();
    const [page, limit, sortBy, order, search, fromDate, toDate, status, locked, view] = useDocumentsStore(
        useShallow((s: DocumentsState) => [s.page, s.limit, s.sortBy, s.order, s.search, s.fromDate, s.toDate, s.status, s.locked, s.view])
    );
    const [setPagination, setSorting, setFilters, setView] = useDocumentsStore(useShallow((s: DocumentsState) => [s.setPagination, s.setSorting, s.setFilters, s.setView]));

    const myWorkspaceRole = activeWorkspace?.membership?.role;
    const canManageWorkspaceMembers = myWorkspaceRole === WorkspaceMemberRole.OWNER || myWorkspaceRole === WorkspaceMemberRole.EDITOR;
    const isActiveFilter = (filterStatus: DocumentStatus | null | undefined, filterLocked: boolean | null) => (status ?? null) === filterStatus && (locked ?? null) === filterLocked;

    const updateDocumentDialog = useDialogAction<Documents>();
    const deleteDocumentDialog = useDialogAction<Documents>();
    const archiveDocumentDialog = useDialogAction<Documents>();
    const restoreDocumentDialog = useDialogAction<Documents>();
    const publishDocumentDialog = useDialogAction<Documents>();
    const lockDocumentDialog = useDialogAction<Documents>();
    const unlockDocumentDialog = useDialogAction<Documents>();
    const duplicateDocumentDialog = useDialogAction<Documents>();

    const { deleteWorkspaceDocument, loading: deleteLoading } = useDeleteDocument();
    const { archiveWorkspaceDocument, loading: archiveLoading } = useArchiveDocument();
    const { restoreWorkspaceDocument, loading: restoreLoading } = useRestoreDocument();
    const { publishWorkspaceDocument, loading: publishLoading } = usePublishDocument();
    const { lockWorkspaceDocument, loading: lockLoading } = useLockDocument();
    const { unlockWorkspaceDocument, loading: unlockLoading } = useUnlockDocument();
    const { duplicateWorkspaceDocument, loading: duplicateLoading } = useDuplicateDocument();
    const { favoriteWorkspaceDocument, loading: favoriteLoading } = useFavoriteDocument();
    const { unfavoriteWorkspaceDocument, loading: unfavoriteLoading } = useUnfavoriteDocument();

    const handleToggleFavorite = (document: Documents) => {
        const workspaceId = activeWorkspace?.id;
        if (!workspaceId) return;

        if (document.isFavorite) {
            unfavoriteWorkspaceDocument({ workspaceId, documentId: document.id });
        } else {
            favoriteWorkspaceDocument({ workspaceId, documentId: document.id });
        }
    };

    const defaultVisible = ["favorite", "title", "status", "currentVersion", "Created By", "updatedAt", "lockedBy", "documentVersions"];
    const columns = useMemo<ColumnDef<Documents>[]>(() => [
        {
            id: "favorite", header: "", enableSorting: false, size: 40,
            cell: ({ row }) => (
                <FavoriteStar
                    isFavorite={row.original.isFavorite}
                    loading={favoriteLoading || unfavoriteLoading}
                    onToggle={() => handleToggleFavorite(row.original)}
                />
            ),
        },
        textColumn<Documents>("title", "Title"),
        {
            id: "status", accessorKey: "status", header: "Status",
            cell: (info) => {
                const value = info.getValue() as DocumentStatus;
                const statusColorMap = { DRAFT: "yellow", PUBLISHED: "green", ARCHIVED: "gray" };

                return (
                    <Badge colorPalette={statusColorMap[value]} variant="subtle" borderRadius="full" px="3">
                        {value}
                    </Badge>
                );
            },
        },
        { id: "currentVersion", accessorKey: "currentVersion", header: "Version" },
        userColumn<Documents>("Created By",
            (row) => ({ id: row.createdMember.user.id, firstName: row.createdMember.user.firstName, lastName: row.createdMember.user.lastName, email: row.createdMember.user.email, avatar: row.createdMember.user.avatar }),
            false
        ),
        textColumn<Documents>("createdMember.user.email", "Email"),
        {
            id: "lockedBy", accessorKey: "lockedBy", header: "Locked", cell: ({ row }) =>
                row.original.lockedBy ? (
                    <Badge colorPalette="red" variant="subtle">Locked</Badge>
                ) : (
                    <Badge colorPalette="green" variant="subtle">Unlocked</Badge>
                ),
        },
        { id: "documentComments", accessorFn: (row) => row._count.documentComments, header: "Comments" },
        { id: "documentVersions", accessorFn: (row) => row._count.documentVersions, header: "Versions" },
        dateColumn<Documents>("publishedAt", "Published"),
        dateColumn<Documents>("updatedAt", "Updated"),
        {
            id: "actions", header: "Actions", enableSorting: false,
            cell: ({ row }) => {
                const document = row.original;
                const isLocked = !!document.lockedBy;
                const isPublished = document.status === DocumentStatus.PUBLISHED;
                const isArchived = document.status === DocumentStatus.ARCHIVED;

                return (<Flex justifyContent={'flex-end'}>
                    {canManageWorkspaceMembers && <UIMenu trigger={<UIIconButton btnType="outline" size={'2xs'}><IoSettingsOutline /></UIIconButton>}>
                        <UIMenu.Item value="resend"
                        // onClick={() => openResendInvitationDialog(row.original)}
                        ><MdOpenInNew /> Open Document</UIMenu.Item>
                        <UIMenu.Item value="edit" onClick={() => updateDocumentDialog.open(document)}>
                            <MdEdit /> Edit Details
                        </UIMenu.Item>
                        <UIMenu.Separator />

                        <UIMenu.Item value="favorite" onClick={() => handleToggleFavorite(document)}>
                            {document.isFavorite ? (
                                <><MdStar color="#eab308" /> Remove from Favorites</>
                            ) : (
                                <><MdOutlineStarBorder /> Add to Favorites</>
                            )}
                            {(favoriteLoading || unfavoriteLoading) && <Spinner size="xs" />}
                        </UIMenu.Item>

                        {isLocked ? (
                            <UIMenu.Item value="unlock" onClick={() => unlockDocumentDialog.open(document)}>
                                <MdLockOpen /> Unlock Document {unlockLoading && <Spinner />}
                            </UIMenu.Item>
                        ) : (
                            <UIMenu.Item value="lock" onClick={() => lockDocumentDialog.open(document)}>
                                <MdLock /> Lock Document {lockLoading && <Spinner />}
                            </UIMenu.Item>
                        )}

                        {!isPublished && !isArchived && (
                            <UIMenu.Item value="publish" onClick={() => publishDocumentDialog.open(document)}>
                                <MdPublish /> Publish Document {publishLoading && <Spinner />}
                            </UIMenu.Item>
                        )}

                        {!isArchived ? (
                            <UIMenu.Item value="archive" onClick={() => archiveDocumentDialog.open(document)}>
                                <MdArchive /> Archive Document {archiveLoading && <Spinner />}
                            </UIMenu.Item>
                        ) : (
                            <UIMenu.Item value="restore" onClick={() => restoreDocumentDialog.open(document)}>
                                <MdRestore /> Restore Document {restoreLoading && <Spinner />}
                            </UIMenu.Item>
                        )}

                        <UIMenu.Separator />

                        <UIMenu.Item value="delete" color="fg.error" onClick={() => deleteDocumentDialog.open(document)}>
                            <MdDelete /> Delete Document {deleteLoading && <Spinner />}
                        </UIMenu.Item>
                    </UIMenu>}
                </Flex>);
            },
        },
    ], [activeWorkspace, updateDocumentDialog,
        unlockDocumentDialog, unlockLoading,
        lockDocumentDialog, lockLoading,
        deleteDocumentDialog, deleteLoading,
        publishDocumentDialog, publishLoading,
        restoreDocumentDialog, restoreLoading,
        archiveDocumentDialog, archiveLoading,
        canManageWorkspaceMembers, handleToggleFavorite, favoriteLoading, unfavoriteLoading
    ]);
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
        setSorting, defaultSort: { id: "updatedAt", desc: true },
        initialColumnVisibility,
    });
    const emptyStateCopy: Record<DocumentView, { title: string; description: string }> = {
        all: { title: "No documents yet", description: "Create your first document to get started." },
        recent: { title: "No recent activity", description: "Documents you view or edit will show up here." },
        favorite: { title: "No favorites yet", description: "Star a document to pin it here for quick access." },
    };

    useGSAP(() => {
        if (!activityRef.current) return;
        gsap.to(activityRef.current, { width: activityOpen ? 300 : 0, duration: 0.65, ease: "power3.out" });
        gsap.to(activityRef.current.children, { opacity: activityOpen ? 1 : 0, duration: 0.2, pointerEvents: activityOpen ? "auto" : "none" });
    }, { dependencies: [activityOpen] });

    return (
        <Flex flexDir={'column'} h={'100%'} w={'100%'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={2} px={2}>
            <Flex justify="space-between" align="start">
                <Flex flexDir="column">
                    <Text fontSize={{ base: '14px', md: '16px', lg: '18px' }} fontWeight={'medium'}>Documents</Text>
                    <Text fontSize="sm" color="text.secondary">Manage all documents in this workspace.</Text>
                </Flex>

                <Flex gap={2} align="center">
                    <UIButton btnType="primary"
                    // onClick={() => addWorkspaceMemberDialog.open(null)}
                    >
                        <IoDocuments /> Add Document
                    </UIButton>
                    <UIIconButton btnType="outline" display={{ base: 'none', md: 'flex' }} onClick={() => setActivityOpen((prev) => !prev)}>
                        <PiTextColumns />
                    </UIIconButton>
                </Flex>
            </Flex>

            <Flex mt={2} flex={1} gap={4} w={'100%'} h={'100%'} minH={0} direction={{ base: "column", lg: "row" }}>
                {loading
                    ? <Flex alignItems={'center'} justifyContent={'center'} w={'100%'} h={'300px'}><Spinner /></Flex>
                    : <Flex flexDirection="column" gap="4" minW={0} minH={0} flex={'1'} h={'100%'} overflow={'auto'}>
                        <SegmentGroup.Root value={view} onValueChange={(e) => setView(e.value as DocumentView)}
                            borderRadius="full" borderWidth="1px" borderColor="border.subtle"
                            bg="pallete.surfaceElevated"
                            size="sm" w="max-content" p="1"
                        >
                            <SegmentGroup.Indicator borderRadius="full" bg="pallete.secondary" boxShadow="sm" />
                            {[
                                { value: "all", icon: <MdListAlt size={15} />, label: "All" },
                                { value: "recent", icon: <MdHistory size={15} />, label: "Recent" },
                                { value: "favorite", icon: <MdOutlineStarBorder size={15} />, label: "Favorites" },
                            ].map((item) => (
                                <SegmentGroup.Item key={item.value} value={item.value} borderRadius="full">
                                    <SegmentGroup.ItemText cursor={'pointer'}>
                                        <Flex align="center" gap={1.5} px={1} py={0.5}
                                            color={view === item.value ? "white" : "text.primary"}
                                            fontWeight={view === item.value ? "medium" : "normal"}
                                            transition="color 0.2s ease"
                                        >
                                            {item.icon} {item.label}
                                        </Flex>
                                    </SegmentGroup.ItemText>
                                    <SegmentGroup.ItemHiddenInput />
                                </SegmentGroup.Item>
                            ))}
                        </SegmentGroup.Root>

                        <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={2} flexDir={{ base: "column", md: "row" }}>
                            <Flex gap={2} w={'max-content'}>
                                <InputGroup startElement={<LuSearch />} w={{ base: "150px", md: "200px", xl: '300px' }}>
                                    <Input size={'xs'} placeholder="Search..." value={search} onChange={(e) => setFilters({ search: e.target.value })} />
                                </InputGroup>

                                <UIPopover trigger={<UIButton btnType="outline"><CiFilter /> Filters</UIButton>}>
                                    <Flex direction="column" gap="4">
                                        <UICombobox
                                            data={[...STATUS_OPTIONS.map(r => ({ label: r, value: r }))]}
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
                            </Flex>

                            {view === "all" && (
                                <Flex gap={2} wrap="wrap">
                                    <UIButton size={{ base: '2xs', sm: 'xs' }} btnType={isActiveFilter(null, null) ? "primary" : "outline"} onClick={() => setFilters({ status: null, locked: null })}>All (126)</UIButton>
                                    <UIButton size={{ base: '2xs', sm: 'xs' }} btnType={isActiveFilter(DocumentStatus.DRAFT, null) ? "primary" : "outline"} onClick={() => setFilters({ status: DocumentStatus.DRAFT, locked: null })}>Draft (18)</UIButton>
                                    <UIButton size={{ base: '2xs', sm: 'xs' }} btnType={isActiveFilter(DocumentStatus.PUBLISHED, null) ? "primary" : "outline"} onClick={() => setFilters({ status: DocumentStatus.PUBLISHED, locked: null })}>Published (92)</UIButton>
                                    <UIButton size={{ base: '2xs', sm: 'xs' }} btnType={isActiveFilter(null, true) ? "primary" : "outline"} onClick={() => setFilters({ status: null, locked: true })}>Locked (5)</UIButton>
                                    <UIButton size={{ base: '2xs', sm: 'xs' }} btnType={isActiveFilter(DocumentStatus.ARCHIVED, null) ? "primary" : "outline"} onClick={() => setFilters({ status: DocumentStatus.ARCHIVED, locked: null })}>Archived (11)</UIButton>
                                </Flex>
                            )}
                        </Flex>

                        <Flex h={'100%'} overflow={'auto'} minW={0} minH={0}>
                            <Box position="relative" w="100%" minW="0" overflow="hidden">
                                <Flex position="absolute" inset="0" zIndex="5"
                                    bg="rgba(0,0,0,0.2)" backdropFilter="blur(1px)" opacity={isFetching ? 1 : 0}
                                    justify="center" align="center" borderRadius="md"
                                    pointerEvents={isFetching ? "auto" : "none"}
                                    transition="opacity 0.2s ease"
                                >
                                    <Spinner size="sm" />
                                </Flex>

                                <DataTable<Documents>
                                    noDataTitle={emptyStateCopy[view].title}
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
                                    onRowClick={(document) => router.push(`/workspaces/${activeWorkspace?.slug}/document/${document.id}`)}
                                />
                            </Box>
                        </Flex>
                    </Flex>
                }

                <Flex ref={activityRef}
                    display={{ base: "none", lg: "flex" }}
                    h="100%" w="300px" py={4} px={2} minH={0}
                    boxShadow="sm" borderRadius="md"
                    flexShrink={0} overflow="hidden"
                >
                    <RecentDocumentActivities />
                </Flex>

                <DocumentPageDialogs
                    deleteDocumentDialog={deleteDocumentDialog} deleteWorkspaceDocument={deleteWorkspaceDocument} deleteLoading={deleteLoading}
                    archiveDocumentDialog={archiveDocumentDialog} archiveWorkspaceDocument={archiveWorkspaceDocument} archiveLoading={archiveLoading}
                    restoreDocumentDialog={restoreDocumentDialog} restoreWorkspaceDocument={restoreWorkspaceDocument} restoreLoading={restoreLoading}
                    publishDocumentDialog={publishDocumentDialog} publishWorkspaceDocument={publishWorkspaceDocument} publishLoading={publishLoading}
                    duplicateDocumentDialog={duplicateDocumentDialog} duplicateWorkspaceDocument={duplicateWorkspaceDocument} duplicateLoading={duplicateLoading}
                    lockDocumentDialog={lockDocumentDialog} lockWorkspaceDocument={lockWorkspaceDocument} lockLoading={lockLoading}
                    unlockDocumentDialog={unlockDocumentDialog} unlockWorkspaceDocument={unlockWorkspaceDocument} unlockLoading={unlockLoading}
                />
                <UpdateDocumentDialog dialog={updateDocumentDialog} />
            </Flex>
        </Flex>
    )
}

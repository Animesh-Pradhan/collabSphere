import { ConfirmDialog, useDialogAction } from "@/components/ui/custom";
import { Documents } from "../types/types";

interface DocumentPageDialogsProps {
    deleteDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    archiveDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    restoreDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    publishDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    duplicateDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    lockDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;
    unlockDocumentDialog: ReturnType<typeof useDialogAction<Documents>>;

    deleteLoading: boolean;
    archiveLoading: boolean;
    restoreLoading: boolean;
    publishLoading: boolean;
    duplicateLoading: boolean;
    lockLoading: boolean;
    unlockLoading: boolean;

    deleteWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    archiveWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    restoreWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    publishWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    duplicateWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    lockWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
    unlockWorkspaceDocument: (payload: { workspaceId: string; documentId: string; }) => Promise<{ data: any; message: string; }>;
}

export default function DocumentPageDialogs({
    deleteDocumentDialog, deleteWorkspaceDocument, deleteLoading,
    archiveDocumentDialog, archiveWorkspaceDocument, archiveLoading,
    restoreDocumentDialog, restoreWorkspaceDocument, restoreLoading,
    publishDocumentDialog, publishWorkspaceDocument, publishLoading,
    duplicateDocumentDialog, duplicateWorkspaceDocument, duplicateLoading,
    lockDocumentDialog, lockWorkspaceDocument, lockLoading,
    unlockDocumentDialog, unlockWorkspaceDocument, unlockLoading
}: DocumentPageDialogsProps) {
    return (
        <>
            <ConfirmDialog dialog={deleteDocumentDialog.dialog}
                title="Delete Document"
                description={
                    deleteDocumentDialog.data
                        ? `Are you sure you want to delete "${deleteDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={deleteLoading}
                onConfirm={async () => {
                    if (!deleteDocumentDialog.data) return;
                    deleteWorkspaceDocument({
                        documentId: deleteDocumentDialog.data.id,
                        workspaceId: deleteDocumentDialog.data.workspaceId,
                    });
                    deleteDocumentDialog.close();
                }}
                onClose={deleteDocumentDialog.close}
            />


            <ConfirmDialog dialog={archiveDocumentDialog.dialog}
                title="Archive Document"
                description={
                    archiveDocumentDialog.data
                        ? `Are you sure you want to Archive "${archiveDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Archive"
                cancelText="Cancel"
                isLoading={archiveLoading}
                onConfirm={async () => {
                    if (!archiveDocumentDialog.data) return;
                    archiveWorkspaceDocument({
                        documentId: archiveDocumentDialog.data.id,
                        workspaceId: archiveDocumentDialog.data.workspaceId,
                    });
                    archiveDocumentDialog.close();
                }}
                onClose={archiveDocumentDialog.close}
            />

            <ConfirmDialog dialog={restoreDocumentDialog.dialog}
                title="Restore Document"
                description={
                    restoreDocumentDialog.data
                        ? `Are you sure you want to Restore "${restoreDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Restore"
                cancelText="Cancel"
                isLoading={restoreLoading}
                onConfirm={async () => {
                    if (!restoreDocumentDialog.data) return;
                    restoreWorkspaceDocument({
                        documentId: restoreDocumentDialog.data.id,
                        workspaceId: restoreDocumentDialog.data.workspaceId,
                    });
                    restoreDocumentDialog.close();
                }}
                onClose={restoreDocumentDialog.close}
            />

            <ConfirmDialog dialog={publishDocumentDialog.dialog}
                title="Publish Document"
                description={
                    publishDocumentDialog.data
                        ? `Are you sure you want to Publish "${publishDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Publish"
                cancelText="Cancel"
                isLoading={publishLoading}
                onConfirm={async () => {
                    if (!publishDocumentDialog.data) return;
                    publishWorkspaceDocument({
                        documentId: publishDocumentDialog.data.id,
                        workspaceId: publishDocumentDialog.data.workspaceId,
                    });
                    publishDocumentDialog.close();
                }}
                onClose={publishDocumentDialog.close}
            />

            <ConfirmDialog dialog={duplicateDocumentDialog.dialog}
                title="Duplicate Document"
                description={
                    duplicateDocumentDialog.data
                        ? `Are you sure you want to Duplicate "${duplicateDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Duplicate"
                cancelText="Cancel"
                isLoading={duplicateLoading}
                onConfirm={async () => {
                    if (!duplicateDocumentDialog.data) return;
                    duplicateWorkspaceDocument({
                        documentId: duplicateDocumentDialog.data.id,
                        workspaceId: duplicateDocumentDialog.data.workspaceId,
                    });
                    duplicateDocumentDialog.close();
                }}
                onClose={duplicateDocumentDialog.close}
            />

            <ConfirmDialog dialog={lockDocumentDialog.dialog}
                title="Lock Document"
                description={
                    lockDocumentDialog.data
                        ? `Are you sure you want to Lock "${lockDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Lock"
                cancelText="Cancel"
                isLoading={lockLoading}
                onConfirm={async () => {
                    if (!lockDocumentDialog.data) return;
                    lockWorkspaceDocument({
                        documentId: lockDocumentDialog.data.id,
                        workspaceId: lockDocumentDialog.data.workspaceId,
                    });
                    lockDocumentDialog.close();
                }}
                onClose={lockDocumentDialog.close}
            />

            <ConfirmDialog dialog={unlockDocumentDialog.dialog}
                title="Unlock Document"
                description={
                    unlockDocumentDialog.data
                        ? `Are you sure you want to Unlock "${unlockDocumentDialog.data.title}" ?`
                        : "Are you sure?"
                }
                confirmText="Unlock"
                cancelText="Cancel"
                isLoading={unlockLoading}
                onConfirm={async () => {
                    if (!unlockDocumentDialog.data) return;
                    unlockWorkspaceDocument({
                        documentId: unlockDocumentDialog.data.id,
                        workspaceId: unlockDocumentDialog.data.workspaceId,
                    });
                    unlockDocumentDialog.close();
                }}
                onClose={unlockDocumentDialog.close}
            />
        </>
    )
}

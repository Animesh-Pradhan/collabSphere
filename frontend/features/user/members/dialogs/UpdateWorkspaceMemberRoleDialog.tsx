"use client";

import { Stack } from "@chakra-ui/react";

import {
    FormDialog,
    RHFCombobox,
    useDialogAction,
} from "@/components/ui/custom";

import { useUpdateWorkspaceMemberRole } from "../hooks/useWorkspaceMembers";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { WorkspaceMemberRole } from "../types/workspaceMembers.type";
import { WorkspaceMember } from "@/store/members/workspaceMembers.store";

type FormValues = {
    role: WorkspaceMemberRole;
};

type Props = {
    dialog: ReturnType<typeof useDialogAction<WorkspaceMember>>;
};

const roleOptions = [
    { label: "Owner", value: WorkspaceMemberRole.OWNER },
    { label: "Editor", value: WorkspaceMemberRole.EDITOR },
    { label: "Commenter", value: WorkspaceMemberRole.COMMENTER },
    { label: "Viewer", value: WorkspaceMemberRole.VIEWER },
];

export default function UpdateWorkspaceMemberRoleDialog({ dialog }: Props) {
    const { activeWorkspace } = useWorkspacesStore();
    const { updateWorkspaceMemberRole, loading } = useUpdateWorkspaceMemberRole();

    return (
        <FormDialog<FormValues>
            dialog={dialog.dialog}
            title="Update Member Role"
            defaultValues={{
                role: dialog.data?.role ?? WorkspaceMemberRole.VIEWER,
            }}
            submitText="Update Role"
            isLoading={loading}
            onSubmit={async (data) => {
                if (!activeWorkspace || !dialog.data) return;

                await updateWorkspaceMemberRole({
                    workspaceId: activeWorkspace.id,
                    memberId: dialog.data.user.id,
                    role: data.role,
                });

                dialog.close();
            }}
            size="sm"
        >
            {(form) => (
                <Stack gap="4">
                    <RHFCombobox
                        label="Role"
                        name="role"
                        control={form.control}
                        data={roleOptions}
                        required
                        placeholder="Select Role"
                    />
                </Stack>
            )}
        </FormDialog>
    );
}
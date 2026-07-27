"use client";

import { FormDialog, RHFInputField, useDialogAction } from "@/components/ui/custom";
import { useUpdateDocument } from "../hooks/useDocument";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { Documents } from "../types/types";
import { Stack } from "@chakra-ui/react";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi";

type FormValues = { title: string; description: string; };
type Props = { dialog: ReturnType<typeof useDialogAction<Documents>> };

const titleRules = { required: "Title  is required" };
const descriptionRules = { required: "Description is required" };

export default function UpdateDocumentDialog({ dialog }: Props) {
    const { activeWorkspace } = useWorkspacesStore();
    const { updateWorkspaceDocument, loading } = useUpdateDocument();

    return (
        <FormDialog<FormValues>
            dialog={dialog.dialog}
            title="Update Document"
            submitText="Update"
            size="sm"
            isLoading={loading}
            defaultValues={{
                title: dialog.data?.title ?? "",
                description: dialog.data?.description ?? "",
            }}
            onSubmit={async (data) => {
                if (!activeWorkspace || !dialog.data) return;
                await updateWorkspaceDocument({
                    workspaceId: activeWorkspace.id, documentId: dialog.data.id,
                    document: { title: data.title, description: data.description },
                });
                dialog.close();
            }}
        >
            {(form) => {
                const { errors } = form.formState;

                return (
                    <Stack gap="4">
                        <RHFInputField label="Workspace Name" name="title" placeholder="eg: Product Requirements Document"
                            register={form.register} error={errors.title} rules={titleRules}
                            inputGroupProps={{ startElement: <MdOutlineDriveFileRenameOutline /> }}
                        />

                        <RHFInputField label="Description" name="description" placeholder="Enter workspace description"
                            register={form.register} error={errors.description} rules={descriptionRules}
                            inputGroupProps={{ startElement: <HiOutlineDocumentText /> }}
                        />
                    </Stack>
                );
            }}
        </FormDialog>
    );
}
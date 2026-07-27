"use client"

import { Stack } from "@chakra-ui/react";
import { FormDialog, RHFInputField, useDialogAction } from "@/components/ui/custom";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { HiOutlineDocumentText } from "react-icons/hi2";

import { useAddWokspace } from "../hooks/useWorkspace";

type FormValues = {
    name: string;
    description: string;
}

type Props = {
    dialog: ReturnType<typeof useDialogAction<any>>;
}

const nameRules = {
    required: "Workspace name is required",
};

const descriptionRules = {
    required: "Workspace description is required",
};

export default function AddWorkspaceDialog({ dialog }: Props) {
    const { inviteMember, loading } = useAddWokspace();

    return (
        <FormDialog<FormValues>
            dialog={dialog.dialog}
            title="Create Workspace"
            defaultValues={{ name: "", description: "", }}
            submitText="Create Workspace"
            isLoading={loading}
            onSubmit={async (data) => {
                await inviteMember(data);
                dialog.close();
            }}
            size="sm"
        >
            {(form) => {
                const { errors } = form.formState;

                return (
                    <Stack gap="4">
                        <RHFInputField label="Workspace Name" name="name" placeholder="eg: Marketing Workspace"
                            register={form.register} error={errors.name} rules={nameRules}
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
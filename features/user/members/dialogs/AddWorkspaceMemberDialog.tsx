"use client";

import { Field, HStack, RadioGroup, Stack, TagsInput } from "@chakra-ui/react";
import { FormDialog, RHFCombobox, useDialogAction } from "@/components/ui/custom";

import { useAddWorkspaceMembers } from "../hooks/useWorkspaceMembers";
import { useWorkspacesStore } from "@/store/workspaces/workspaces.store";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useMembersQuery } from "../hooks/useMembersQuery";

type FormValues = {
    source: "internal" | "external";
    userIds: string[];
    emails: string[];
};

const items = [
    { label: "Organisation Members", value: "internal" },
    { label: "External Members", value: "external" },
];

type Props = {
    dialog: ReturnType<typeof useDialogAction<null>>;
};

export default function AddWorkspaceMemberDialog({ dialog }: Props) {
    const { activeWorkspace } = useWorkspacesStore();
    const { data: members } = useMembersQuery({ all: true });
    const { addWorkspaceMembers, loading } = useAddWorkspaceMembers();

    const memberOptions = useMemo(() => {
        return members.map((member) => ({
            label: `${member.user.firstName} ${member.user.lastName} (${member.user.email})`,
            value: member.user.id,
        }));
    }, [members]);

    return (
        <FormDialog<FormValues>
            dialog={dialog.dialog}
            title="Add Workspace Members"
            defaultValues={{ source: "internal", emails: [], userIds: [] }}
            submitText="Add Members"
            isLoading={loading}
            onSubmit={async (data) => {
                if (!activeWorkspace) return;

                await addWorkspaceMembers({
                    workspaceId: activeWorkspace.id,
                    source: data.source,
                    userIds: data.source === "internal" ? data.userIds : undefined,
                    emails: data.source === "external" ? data.emails : undefined
                });

                dialog.close();
            }}
            size="sm"
        >
            {(form) => {
                const { errors } = form.formState;

                return (
                    <Stack gap="4">

                        <RadioGroup.Root
                            value={form.watch("source")}
                            onValueChange={(e) => form.setValue("source", e.value as "internal" | "external")}
                        >
                            <HStack gap="6">
                                {items.map((item) => (
                                    <RadioGroup.Item key={item.value} value={item.value} _checked={{}}>
                                        <RadioGroup.ItemHiddenInput />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>{item.label}</RadioGroup.ItemText>
                                    </RadioGroup.Item>
                                ))}
                            </HStack>
                        </RadioGroup.Root>

                        {form.watch("source") === "internal" ? (
                            <RHFCombobox label="Members" name="userIds" control={form.control} data={memberOptions} required multiple={true} placeholder="Select Members" />
                        ) : (
                            <Controller
                                control={form.control}
                                name="emails"
                                rules={{ validate: (v) => v.length > 0 || "Please enter at least one email" }}
                                render={({ field, fieldState }) => (
                                    <Field.Root invalid={!!fieldState.error}>
                                        <Field.Label>Email Addresses</Field.Label>

                                        <TagsInput.Root
                                            value={field.value ?? []}
                                            onValueChange={(details) => field.onChange(details.value)}
                                        >
                                            <TagsInput.HiddenInput />
                                            <TagsInput.Control>
                                                <TagsInput.Items />
                                                <TagsInput.Input placeholder="Enter email and press Enter" />
                                            </TagsInput.Control>
                                        </TagsInput.Root>

                                        <Field.ErrorText>
                                            {fieldState.error?.message}
                                        </Field.ErrorText>
                                    </Field.Root>
                                )}
                            />
                        )}
                    </Stack>
                );
            }}
        </FormDialog>
    );
}
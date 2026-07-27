"use client"

import { Stack } from "@chakra-ui/react"
import { FormDialog, RHFCombobox, RHFInputField, useDialogAction } from "@/components/ui/custom"
import { useInviteMember } from "@/features/user/members/hooks/useInviteMember"
import { orgRoleOptions } from "@/utils/variables"
import { IoMailOutline } from "react-icons/io5"

type FormValues = {
    email: string
    role?: string
}

type Props = {
    dialog: ReturnType<typeof useDialogAction<any>>
}

const emailRules = {
    required: "Email is required",
    pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Invalid email address",
    },
}

export default function InviteMemberDialog({ dialog }: Props) {
    const { inviteMember, loading } = useInviteMember()

    return (
        <FormDialog<FormValues>
            dialog={dialog.dialog}
            title="Invite Member"
            defaultValues={{ email: "", role: undefined }}
            submitText="Send Invite" isLoading={loading}
            onSubmit={async (data) => {
                await inviteMember({ email: data.email, role: data.role });
                dialog.close();
            }}

            size={'sm'}
        >
            {(form) => {
                const { errors } = form.formState;
                return (
                    <Stack gap="4">
                        <RHFInputField label="Email" name="email" placeholder="eg: (some@gmail.com)"
                            register={form.register} error={errors.email}
                            rules={emailRules}
                            inputGroupProps={{ startElement: < IoMailOutline /> }}
                        />

                        <RHFCombobox label="Role" name="role" control={form.control}
                            data={orgRoleOptions} placeholder="Select role (optional)" />
                    </Stack>
                )
            }}
        </FormDialog>
    )
}
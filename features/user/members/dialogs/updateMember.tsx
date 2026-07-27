"use client"

import { Stack } from "@chakra-ui/react"
import { FormDialog, RHFCombobox, useDialogAction } from "@/components/ui/custom"
import { useUpdateMember } from "@/features/user/members/hooks/useUpdateMember"
import { OrganisationMember } from "@/store/members/membes.store"
import { orgRoleOptions, orgStatusOptions } from "@/utils/variables"

type FormValues = {
    role: string
    status: string
}

type Props = {
    dialog: ReturnType<typeof useDialogAction<OrganisationMember>>
}

export default function EditMemberDialog({ dialog }: Props) {
    const member = dialog.data
    const { updateMember, loading } = useUpdateMember()

    if (!member) return null

    return (
        <FormDialog<FormValues> key={member.id} dialog={dialog.dialog} title="Edit Member" size={'sm'}
            defaultValues={{ role: member.role, status: member.status }}
            isLoading={loading}
            onSubmit={(data) => {
                updateMember({ memberId: member.id, role: data.role, status: data.status })
                dialog.close()
            }}
        >
            {(form) => (
                <Stack gap="4">
                    <RHFCombobox label="Role" name="role" control={form.control} data={orgRoleOptions} placeholder="Select role" />
                    <RHFCombobox label="Status" name="status" control={form.control} data={orgStatusOptions} placeholder="Select status" />
                </Stack>
            )}
        </FormDialog>
    )
}
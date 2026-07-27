import Invite from '@/features/auth/components/Invite';
import React from 'react'

interface Props {
    searchParams: Promise<{ token?: string; }>;
}

export default async function InvitePage({ searchParams }: Props) {
    const { token } = await searchParams;
    if (!token) return;
    return (<Invite token={token} />)
}

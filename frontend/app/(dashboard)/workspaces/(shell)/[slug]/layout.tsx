"use client"

import WorkspaceTopNav from "@/features/user/workspaces/components/WorkspaceTopNav"
import { useUIStore } from "@/store/ui.store"
import { useWorkspacesStore, WorkspacesState } from "@/store/workspaces/workspaces.store"
import { Flex, Spinner, Text } from "@chakra-ui/react"
import { useParams } from "next/navigation"
import { ReactNode, useEffect } from "react"
import { useShallow } from "zustand/shallow"

export default function WorkspaceLayout({ children }: { children: ReactNode }) {

    const { slug } = useParams<{ slug: string }>()
    const { sidebarCollapsed } = useUIStore();

    const [activeWorkspace, workspaces, setActiveWorkspace] = useWorkspacesStore(useShallow((s: WorkspacesState) => ([s.activeWorkspace, s.workspaces, s.setActiveWorkspace])));

    useEffect(() => {
        if (!activeWorkspace && workspaces.length) {
            const workspace = workspaces.find(w => w.slug === slug)
            if (workspace) setActiveWorkspace(workspace)
        }
    }, [slug, activeWorkspace, workspaces, setActiveWorkspace])

    if (!activeWorkspace) return <Flex justifyContent={'center'} h={'100%'} gap={2} alignItems={'center'}>
        <Spinner />
        <Text>Loading Workspace...</Text>
    </Flex>

    return (
        <Flex direction="column" h="100%">
            {sidebarCollapsed && <WorkspaceTopNav />}
            <Flex flex={1} overflow="auto">
                {children}
            </Flex>
        </Flex>
    )
}
// features/user/workspaces/hooks/useResolveActiveWorkspace.ts
import { useWorkspacesStore, WorkspacesState } from "@/store/workspaces/workspaces.store"
import { useWorkspacesQuery } from "./useGetWorkspaces"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useShallow } from "zustand/shallow"

export function useResolveActiveWorkspace() {
    const { slug } = useParams<{ slug: string }>()

    const [activeWorkspace, workspaces, setActiveWorkspace] = useWorkspacesStore(
        useShallow((s: WorkspacesState) => ([s.activeWorkspace, s.workspaces, s.setActiveWorkspace]))
    );

    const { loading: workspacesLoading } = useWorkspacesQuery("MY");

    useEffect(() => {
        if (!activeWorkspace && workspaces.length) {
            const workspace = workspaces.find(w => w.slug === slug)
            if (workspace) setActiveWorkspace(workspace)
        }
    }, [slug, activeWorkspace, workspaces, setActiveWorkspace])

    return { activeWorkspace, loading: workspacesLoading };
}
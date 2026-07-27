"use client"

import { Flex, Icon, mergeRefs, Skeleton, Text, VStack } from "@chakra-ui/react"
import { useWorkspacesQuery } from "../hooks/useGetWorkspaces"
import { usePathname, useRouter } from "next/navigation";
import { UIButton } from "@/components/ui/custom";
import { MdAdd, MdAddTask, MdGroups } from "react-icons/md";
import { LuBuilding, LuLayoutDashboard } from "react-icons/lu";
import { useGsapPressAnimation, useGsapReveal } from "@/hooks";
import { BsPersonWorkspace } from "react-icons/bs";
import { Tooltip } from "@/components/ui/chakra/tooltip";
import { useWorkspacesStore, Workspace } from "@/store/workspaces/workspaces.store";
import { IoChatbubblesSharp, IoSettingsOutline } from "react-icons/io5";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IconType } from "react-icons";

export const WORKSPACE_NAVBAR = [
    { label: "Overview", path: "overview", icon: LuLayoutDashboard },
    { label: "Chats", path: "chats", icon: IoChatbubblesSharp },
    { label: "Tasks", path: "tasks", icon: MdAddTask },
    { label: "Members", path: "members", icon: MdGroups },
    { label: "Documents", path: "documents", icon: HiOutlineDocumentText },
    { label: "Settings", path: "settings", icon: IoSettingsOutline }
]

export default function WorkspaceSidebarSection({ sidebarCollapsed }: {
    sidebarCollapsed: boolean
}) {
    const router = useRouter();
    const { ref: itemContainerRef, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = useGsapPressAnimation();
    const { data: workspaces, loading, meta, isFetching } = useWorkspacesQuery("MY");

    return (<Flex flexDir={'column'} align='start' gap={1} w={'100%'}>
        <Tooltip content={"Workspaces"} disabled={!sidebarCollapsed}>
            <Flex flexDir={'column'} align={!sidebarCollapsed ? "start" : "center"} gap={1} px={2} py={2} w='100%' rounded="md" cursor="pointer"
                ref={itemContainerRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                justifyContent={sidebarCollapsed ? 'center' : 'start'}
                transition="background 0.2s ease"
                onClick={() => router.push('/workspaces')}
            >
                <Flex gap={3}>
                    <Icon as={BsPersonWorkspace} boxSize={5} color={"text.secondary"} />
                    {!sidebarCollapsed && <Text fontSize="sm" fontWeight="600" textTransform="uppercase" whiteSpace="nowrap" color={"text.secondary"}>Workspaces</Text>}
                </Flex>
            </Flex>
        </Tooltip>

        {(loading || isFetching) ? [1, 2, 3].map(a => <Skeleton key={a} w={'100%'} h="40px" />) : workspaces.map((workspace) => <WorkspaceItem key={workspace.id} sidebarCollapsed={sidebarCollapsed} workspace={workspace} />)}
        {!sidebarCollapsed && <UIButton w={'stretch'} btnType="outline" onClick={() => router.push("/workspaces")}><MdAdd /> Create Workspace</UIButton>}
    </Flex>)
}


function WorkspaceChildItems({ workspace, childItem, sidebarCollapsed }: {
    workspace: Workspace,
    childItem: { label: string, path: string, icon: IconType },
    sidebarCollapsed: boolean
}) {
    const { ref, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = useGsapPressAnimation();
    const pathname = usePathname();
    const router = useRouter();

    const itemPath = `/workspaces/${workspace.slug}/${childItem.path}`
    const isChildItemActive = pathname.startsWith(itemPath)
    return (
        <Flex gap={3} px={2} py={2} w='100%' rounded="md" cursor="pointer"
            ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
            bg={isChildItemActive ? "button.primary" : "transparent"}
            color={isChildItemActive ? "#fff" : "text.primary"}
            justifyContent={sidebarCollapsed ? 'center' : 'start'}
            _hover={{ bg: isChildItemActive ? "button.primary" : "pallete.surfaceElevated2" }}
            onClick={(e) => router.push(itemPath)}
        >
            <Icon as={childItem.icon} boxSize={5} />
            <Text fontSize="13px" fontWeight="500" whiteSpace="nowrap">{childItem.label}</Text>
        </Flex>
    )
}

function WorkspaceItem({ sidebarCollapsed, workspace }: {
    sidebarCollapsed: boolean
    workspace: Workspace
}) {
    const setActiveWorkspace = useWorkspacesStore((s) => s.setActiveWorkspace)
    const { ref, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = useGsapPressAnimation();
    const pathname = usePathname();
    const router = useRouter();

    const isActive = pathname === `/workspaces/${workspace.slug}` || pathname.startsWith(`/workspaces/${workspace.slug}/`)
    return (
        <Flex direction="column" w="100%">
            <Flex gap={3} px={2} py={2} w='100%' rounded="md" cursor="pointer"
                ref={ref} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                align={!sidebarCollapsed ? "start" : "center"}
                justifyContent={sidebarCollapsed ? 'center' : 'start'}
                transition="background 0.2s ease"
                color={"text.primary"}
                bg={isActive ? "pallete.surfaceElevated2" : "transparent"}
                _hover={{ bg: "pallete.surfaceElevated2" }}
                borderLeft={isActive ? "3px solid" : "3px solid transparent"}
                borderColor={isActive ? "button.primary" : "transparent"}
                onClick={() => { setActiveWorkspace(workspace); router.push(`/workspaces/${workspace.slug}`) }}
            >
                <Icon as={LuBuilding} boxSize={5} />
                {!sidebarCollapsed && <Text fontSize="sm" fontWeight="600" textTransform="uppercase" whiteSpace="nowrap">{workspace.name}</Text>}
            </Flex>

            {isActive && !sidebarCollapsed && (
                <Flex mt={2} direction="column" flexDir={'column'} w={'100%'} pl={2}
                    alignItems={sidebarCollapsed ? 'center' : 'start'}
                    gap={1} overflow="hidden"
                >
                    {WORKSPACE_NAVBAR.map((item) => <WorkspaceChildItems key={item.path} childItem={item} workspace={workspace} sidebarCollapsed={sidebarCollapsed} />)}
                </Flex>
            )}
        </Flex>
    )
}
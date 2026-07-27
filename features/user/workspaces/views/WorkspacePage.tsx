"use client"

import { useAuthStore } from "@/store/auth.store";
import { Box, Flex, GridItem, Icon, SimpleGrid, Spinner, Tabs, Text, VStack } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { FaNetworkWired } from "react-icons/fa";
import { IoLayers, IoArchive } from "react-icons/io5";
import { PiUserSquareDuotone } from "react-icons/pi";

const MyWorkspace = dynamic(() => import("../components/MyWorkspace"), { loading: () => (<LoaderComponent />) })
const AllWorkspace = dynamic(() => import("../components/AllWorkspace"), { loading: () => (<LoaderComponent />) })
const StarredWorkspace = dynamic(() => import("../components/StarredWorkspace"), { loading: () => (<LoaderComponent />) })
const RecentWorkspace = dynamic(() => import("../components/RecentWorkspace"), { loading: () => (<LoaderComponent />) })

export default function WorkspacesPage() {
    const { context } = useAuthStore();
    const [activeTab, setActiveTab] = useState("my-workspace")
    const [counts, setCounts] = useState({ activeWorkspaces: 12, archivedWorkspaces: 3, myWorkspaces: 6, workspaceMembers: 84 })

    const TABS = useMemo(() => {
        const tabs = [
            { label: "My Workspace", value: "my-workspace", content: <MyWorkspace /> },
            ...(context?.mode === "ORG" ? [{ label: "All Workspace", value: "all-workspace", content: <AllWorkspace /> }] : []),
            { label: "Recent Workspace", value: "recent-workspace", content: <RecentWorkspace /> },
            { label: "Starred Workspace", value: "starred-workspace", content: <StarredWorkspace /> }
        ];

        return tabs;
    }, [context?.mode]);

    const COUNTS = useMemo(() => ([
        { title: "Active Workspaces", icon: IoLayers, value: counts?.activeWorkspaces ?? 0 },
        { title: "Archived Workspaces", icon: IoArchive, value: counts?.archivedWorkspaces ?? 0 },
        { title: "My Workspaces", icon: PiUserSquareDuotone, value: counts?.myWorkspaces ?? 0 },
        { title: "Workspace Members", icon: FaNetworkWired, value: counts?.workspaceMembers ?? 0 }
    ]), [counts]);

    return (
        <Box>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                {COUNTS.map((item, index) => <GridItem key={index} bg={'pallete.surfaceElevated'} borderRadius={'md'} boxShadow={'xs'} px={4} py={2}>
                    <Flex justifyContent={'space-between'} alignItems={'start'} gap={6}>
                        <VStack align={'start'} gap={0}>
                            <Text fontSize={'14px'}>{item.title}</Text>
                            <Text fontWeight={600} fontSize={'34px'}>{item.value}</Text>
                        </VStack>
                        <Icon alignSelf={'center'} as={item.icon} boxSize={10} />
                        {/* <Box w={'8px'} h={'8px'} bg={'green'} borderRadius={'full'}></Box> */}
                    </Flex>
                </GridItem>)}
            </SimpleGrid>

            <Tabs.Root mt={4} lazyMount value={activeTab} onValueChange={(e) => setActiveTab(e.value)} variant={'enclosed'}>
                <Tabs.List w={'100%'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'}>
                    {TABS.map(item => <Tabs.Trigger key={item.value} _selected={{ bg: "pallete.secondary", color: "#fff" }} value={item.value}>{item.label}</Tabs.Trigger>)}
                </Tabs.List>

                {TABS.map((item) => (
                    <Tabs.Content key={item.value} value={item.value}>
                        <Flex flexDir={'column'} bg={'pallete.surfaceElevated'} boxShadow={'lg'} borderRadius={'md'} py={4} px={2} minH={'200px'}>
                            {item.content}
                        </Flex>
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </Box>
    )
}


const LoaderComponent = () => {
    return (<Flex minH={'200px'} w={'100%'} alignItems={'center'} justifyContent={'center'}>
        <Spinner />
    </Flex>)
}
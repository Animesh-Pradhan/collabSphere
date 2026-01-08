import { useUIStore } from "@/store/ui.store";
import { Box, Text, VStack } from "@chakra-ui/react";

export default function Sidebar() {
    const { sidebarCollapsed } = useUIStore();

    return (<Box w={'240px'} bg={"bg.primary"} p={4} borderRight="1px solid" borderColor="text.secondary">
        <Text>Collab Sphere</Text>
        <VStack>
            <Text>Dashboard</Text>
            <Text>Projects</Text>
            <Text>Users</Text>
            <Text>Settings</Text>
        </VStack>
    </Box>)
}
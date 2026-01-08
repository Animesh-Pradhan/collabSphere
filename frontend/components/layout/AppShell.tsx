import { Box, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

export default function AppShell({ sidebar, navbar, children }: {
    sidebar: ReactNode, navbar: ReactNode, children: ReactNode
}) {
    return <Flex h={'100vh'} w={'100%'} bg={'bg.primary'}>
        {sidebar}
        <Flex flex={'1'} flexDir={'column'}>
            {navbar}
            <Box flex={'1'} p={4} bg={"bg.tertiary"}>{children}</Box>
        </Flex>
    </Flex>
}
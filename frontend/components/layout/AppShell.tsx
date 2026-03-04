"use client";

import { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";

import { useGsapReveal } from "@/hooks";
import { useSelectedLayoutSegments } from "next/navigation";

export default function AppShell({ sidebar, navbar, children }: {
    sidebar: ReactNode, navbar: ReactNode, children: ReactNode
}) {
    const segments = useSelectedLayoutSegments();
    const rootSegment = segments[0];

    const { containerRef } = useGsapReveal({
        container: { opacity: 0, fromScale: 0.96, duration: 0.55, ease: "power3.out" },
    }, [rootSegment]);

    return <Flex h={'100vh'} w="100%" bg={'pallete.primary'} overflow={'hidden'}>
        {sidebar}
        <Flex flexDir={'column'} flex="1" minH="0" minW="0" overflow={'hidden'}>
            {navbar}
            <Box ref={containerRef} key={rootSegment} flex={'1'} minH="0" minW="0" p={2} bg={"pallete.tertiary"} overflowX={'auto'} overflowY={'scroll'}>{children}</Box>
        </Flex>
    </Flex>
}
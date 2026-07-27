"use client";

import { useGsapReveal } from '@/hooks';
import { useResolveActiveWorkspace } from '@/features/user/workspaces/hooks/useResolveActiveWorkspace';
import { Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import SpecialLoader from '@/features/user/documents/components/SpecialLoader';

export default function EditorPageLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { containerRef } = useGsapReveal({ container: { opacity: 0, fromY: 8, duration: 0.22, ease: "power3.out" } }, [pathname]);
    const { activeWorkspace, loading } = useResolveActiveWorkspace();

    if (!activeWorkspace) {
        return <SpecialLoader label={loading ? "Entering workspace" : "Workspace not found"} />;
    }

    return (
        <Flex direction="column" h="100%" overflow="hidden">
            <Box
                ref={containerRef}
                key={pathname}
                flex="1"
                overflow="hidden"
                bg="pallete.background"
            >
                {children}
            </Box>
        </Flex>
    );
}
"use client";

import { MEMBERS_ROUTE } from "@/config/userPanel.routes";
import { useGsapReveal } from "@/hooks";
import { Box, Flex, GridItem, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const { containerRef } = useGsapReveal({
        container: { opacity: 0, fromY: 8, duration: 0.22, ease: "power3.out" },
    }, [pathname]);

    return (
        <Flex direction="column" h="100%" gap={4}>
            <SimpleGrid columns={{ base: 2, md: 4 }} gapX={4}>
                <GridItem bg={'pallete.surfaceElevated'} borderRadius={'md'} boxShadow={'xs'} px={4} py={2}>
                    <Flex alignItems={'center'} gap={2}>
                        <Box w={'8px'} h={'8px'} bg={'green'} borderRadius={'full'}></Box>
                        <Text fontSize={'14px'}>Total Members</Text>
                    </Flex>
                    <Text fontWeight={600} fontSize={'20px'}>24</Text>
                </GridItem>

                <GridItem bg={'pallete.surfaceElevated'} borderRadius={'md'} boxShadow={'xs'} px={4} py={2}>
                    <Flex alignItems={'center'} gap={2}>
                        <Box w={'8px'} h={'8px'} bg={'green'} borderRadius={'full'}></Box>
                        <Text fontSize={'14px'}>Total Members</Text>
                    </Flex>
                    <Text fontWeight={600} fontSize={'20px'}>24</Text>
                </GridItem>

                <GridItem bg={'pallete.surfaceElevated'} borderRadius={'md'} boxShadow={'xs'} px={4} py={2}>
                    <Flex alignItems={'center'} gap={2}>
                        <Box w={'8px'} h={'8px'} bg={'green'} borderRadius={'full'}></Box>
                        <Text fontSize={'14px'}>Total Members</Text>
                    </Flex>
                    <Text fontWeight={600} fontSize={'20px'}>24</Text>
                </GridItem>

                <GridItem bg={'pallete.surfaceElevated'} borderRadius={'md'} boxShadow={'xs'} px={4} py={2}>
                    <Flex alignItems={'center'} gap={2}>
                        <Box w={'8px'} h={'8px'} bg={'green'} borderRadius={'full'}></Box>
                        <Text fontSize={'14px'}>Total Members</Text>
                    </Flex>
                    <Text fontWeight={600} fontSize={'20px'}>24</Text>
                </GridItem>
            </SimpleGrid>

            <Flex position="relative" borderBottom="1px solid" borderColor="text.secondary" gap={2}>
                {MEMBERS_ROUTE.map((item) => {
                    const isActive = pathname === item.path || (item.path !== "/members" && pathname.startsWith(item.path));

                    return (
                        <Flex key={item.path} alignItems={'center'} gap={2}
                            px={4} py={2} fontSize="sm"
                            cursor="pointer" position="relative"
                            fontWeight={isActive ? "semibold" : "normal"}
                            onClick={() => router.push(item.path)}
                            color={isActive ? "text.primary" : "text.secondary"}
                            _hover={{ color: "text.primary" }}
                        >
                            <Icon as={item.icon} boxSize={4} />
                            {item.label}
                            {isActive && (<Flex position="absolute" bottom="-1px" left={0} right={0} height="3px" bg="text.primary" borderRadius="full" />)}
                        </Flex>
                    );
                })}
            </Flex>

            <Box ref={containerRef} key={pathname} flex="1" overflow={'auto'}>{children}</Box>
        </Flex>
    );
}

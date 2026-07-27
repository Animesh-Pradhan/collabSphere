"use client"

import { Flex, Icon, Text } from "@chakra-ui/react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { WORKSPACE_NAVBAR } from "./workspaceSidebarItems";

export default function WorkspaceTopNav() {
    const { slug } = useParams<{ slug: string }>()
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Flex position="relative" mb={2} borderBottom="1px solid" borderColor="text.secondary" gap={2}>
            {WORKSPACE_NAVBAR.map((item) => {
                const path = `/workspaces/${slug}/${item.path}`
                const isActive = pathname.startsWith(path)

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
                )
            })}

        </Flex>
    )
}
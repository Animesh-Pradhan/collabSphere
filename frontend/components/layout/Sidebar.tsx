"use client";

import { useUIStore } from "@/store/ui.store";
import { Box, Flex, Heading, Icon, IconButton, Text, VStack } from "@chakra-ui/react";

// import light_logo from "@/public/logo/light_logo.png";
import { SIDEBAR_ROUTES } from "@/config/sidebar.routes";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Tooltip } from "../ui/tooltip";

const MotionBox = motion.div

export default function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const pathname = usePathname();
    const router = useRouter();



    return (<MotionBox layout initial={false}
        animate={{
            width: sidebarCollapsed ? 60 : 240,
            paddingLeft: sidebarCollapsed ? 8 : 16,
            paddingRight: sidebarCollapsed ? 8 : 16,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ borderRight: "1px solid var(--chakra-colors-text-secondary)", boxSizing: "border-box" }}
    >
        <Box py={4} display="flex" flexDirection="column" bg={"bg.primary"} borderColor="text.secondary">

            <Flex align="center" justify={sidebarCollapsed ? "center" : "space-between"}>
                {!sidebarCollapsed && <Heading>{sidebarCollapsed ? "CS" : "CollabSphere"}</Heading>}
                <IconButton size="sm" variant="ghost" onClick={toggleSidebar}>{sidebarCollapsed ? <LuChevronRight /> : <LuChevronLeft />}</IconButton>
            </Flex>

            <VStack align={'start'} gap={4} mt={6}>
                {SIDEBAR_ROUTES.map((route) => {
                    const isActive = pathname === route.path || pathname.startsWith(`${route.path}/`);

                    return (<Tooltip key={route.path} positioning={{ placement: "right-end" }} content={route.label} disabled={!sidebarCollapsed}>
                        <MotionBox layout style={{ width: "100%" }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <Flex align="center" justifyContent={sidebarCollapsed ? 'center' : 'start'} gap={3} px={2} py={2} rounded="md" cursor="pointer"
                                display={'flex'} gapX={4}
                                color={isActive ? "#fff" : "text.primary"}
                                bg={isActive ? "button.primary" : "transparent"}
                                onClick={() => router.push(route.path)}
                            >
                                <Icon as={route.icon} size={'md'} />

                                {!sidebarCollapsed && (
                                    <Text fontSize="sm" fontWeight="medium"> {route.label}</Text>
                                )}
                            </Flex>
                        </MotionBox>
                    </Tooltip>);
                })}
            </VStack>

        </Box>
    </MotionBox>)
}
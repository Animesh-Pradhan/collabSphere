"use client";

import { useUIStore } from "@/store/ui.store";
import { Box, Flex, Heading, Icon, IconButton, Text, VStack } from "@chakra-ui/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SIDEBAR_ROUTES } from "@/config/userPanel.routes";
import { usePathname, useRouter } from "next/navigation";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Tooltip } from "../ui/chakra/tooltip";
import { useRef, useState } from "react";

export default function Sidebar() {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(240);

    const { sidebarCollapsed, toggleSidebar } = useUIStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sidebarRef.current) return;
        const mouseX = e.clientX;

        if (!sidebarCollapsed && mouseX < 155) {
            toggleSidebar();
            return;
        }
        if (sidebarCollapsed && mouseX > 155) {
            toggleSidebar();
            return;
        }
        if (!sidebarCollapsed) {
            const newWidth = Math.min(Math.max(mouseX, 155), 400);
            gsap.set(sidebarRef.current, { width: newWidth });
        }
    };

    const stopDragging = () => {
        if (!isDragging) return;
        if (sidebarRef.current && !sidebarCollapsed) {
            const finalWidth = Math.max(sidebarRef.current.offsetWidth, 155);
            setSidebarWidth(finalWidth);
        }
        setIsDragging(false);
    };

    useGSAP(() => {
        gsap.to(sidebarRef.current, {
            width: sidebarCollapsed ? 60 : sidebarWidth,
            paddingLeft: sidebarCollapsed ? 8 : 16,
            paddingRight: sidebarCollapsed ? 8 : 16,
            duration: 0.5,
            ease: "elastic.out(1,0.7)",
        });
    }, { dependencies: [sidebarCollapsed] });

    return (
        <Box position="relative" py={4}
            ref={sidebarRef}
            display="flex" flexDirection="column"
            bg="bg.primary" borderRight="1px solid" borderColor="pallete.borderSubtle"
            overflowY="auto" overflowX={'hidden'}
            width={sidebarCollapsed ? "60px" : `${sidebarWidth}px`}
        >
            <Flex align="center" justify={sidebarCollapsed ? "center" : "space-between"}>
                {!sidebarCollapsed && <Heading size="md">CollabSphere</Heading>}
                <IconButton size="sm" variant="ghost" onClick={toggleSidebar}>
                    {sidebarCollapsed ? <LuChevronRight /> : <LuChevronLeft />}
                </IconButton>
            </Flex>

            <VStack align='start' gap={4} mt={6}>
                {SIDEBAR_ROUTES.map((route) => {
                    const isActive = pathname === route.path || pathname.startsWith(`${route.path}/`);
                    return (
                        <Tooltip key={route.path} content={route.label} disabled={!sidebarCollapsed}>
                            <Flex
                                align="center" gap={3} px={2} py={2} w='100%' rounded="md" cursor="pointer"
                                color={isActive ? "#fff" : "text.primary"}
                                justifyContent={sidebarCollapsed ? 'center' : 'start'}
                                bg={isActive ? "button.primary" : "transparent"}
                                onClick={() => router.push(route.path)}
                            >
                                <Icon as={route.icon} boxSize={5} />
                                {!sidebarCollapsed && <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">{route.label}</Text>}
                            </Flex>
                        </Tooltip>
                    );
                })}
            </VStack>


            <Box w="5px" h="100%" cursor="col-resize" position="absolute" top={0} right="-2px" bg={isDragging ? "blue.500" : "transparent"} zIndex={20} onMouseDown={() => setIsDragging(true)} _hover={{ bg: "blue.500" }} />
            {isDragging && <Box position="fixed" inset={0} zIndex={9999} cursor="col-resize" onMouseMove={handleMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging} />}
        </Box>
    );
}
"use client";

import { useUIStore } from "@/store/ui.store";
import { Box, Flex, Heading, Icon, IconButton, Separator, Text, VStack } from "@chakra-ui/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { SIDEBAR_ROUTES, SidebarRoute } from "@/config/userPanel.routes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuChevronDown, LuChevronLeft, LuChevronRight, LuChevronUp } from "react-icons/lu";
import { Tooltip } from "../ui/chakra/tooltip";
import { startTransition, useEffect, useRef, useState } from "react";
import { useGsapPressAnimation, useGsapReveal } from "@/hooks";
import WorkspaceSidebarSection from "@/features/user/workspaces/components/workspaceSidebarItems";

export default function Sidebar() {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [openItem, setOpenItem] = useState<string | null>(null);

    const { sidebarCollapsed, toggleSidebar } = useUIStore();

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

            <VStack align='start' gap={2} mt={6}>
                {SIDEBAR_ROUTES.map((route) => {
                    return (<SidebarItems key={route.label} route={route} openItem={openItem} setOpenItem={setOpenItem} sidebarCollapsed={sidebarCollapsed} />);
                })}

                <Separator borderWidth={'1px'} w={'calc(100% + 2rem)'} ml={'-1rem'} borderColor={'pallete.borderSubtle'} />
                <WorkspaceSidebarSection sidebarCollapsed={sidebarCollapsed} />
            </VStack>


            <Box w="5px" h="100%" cursor="col-resize" position="absolute" top={0} right="-2px" bg={isDragging ? "blue.500" : "transparent"} zIndex={20} onMouseDown={() => setIsDragging(true)} _hover={{ bg: "blue.500" }} />
            {isDragging && <Box position="fixed" inset={0} zIndex={9999} cursor="col-resize" onMouseMove={handleMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging} />}
        </Box>
    );
}

interface SidebarItemsProps {
    route: SidebarRoute;
    sidebarCollapsed: boolean;
    openItem: string | null;
    setOpenItem: React.Dispatch<React.SetStateAction<string | null>>;
}
function SidebarItems({ route, sidebarCollapsed, openItem, setOpenItem }: SidebarItemsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentParams = Object.fromEntries(searchParams.entries());

    const { ref: itemContainerRef, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = useGsapPressAnimation();

    const isActive = !!route.path && (pathname === route.path || pathname.startsWith(`${route.path}/`)) && !route.children;
    const isChildActive = route.children?.some((child) => pathname === child.path || pathname.startsWith(`${child.path}/`)) ?? false;
    const isOpen = route.children ? isChildActive || openItem === route.label : false;

    const { containerRef, itemRef } = useGsapReveal({ items: { opacity: 0, fromX: -8, stagger: 0.05, duration: 0.25 } },
        [isOpen]
    );

    const toggleItem = () => setOpenItem((prev) => (prev === route.label ? null : route.label));

    useEffect(() => {
        const isParentActive = route.path && (pathname === route.path || pathname.startsWith(route.path + "/"));
        if (!isChildActive && !isParentActive && openItem === route.label) {
            setOpenItem(null);
        }
    }, [pathname]);

    useEffect(() => {
        if (route.path) router.prefetch(route.path);
        route.children?.forEach(c => {
            if (c.path) router.prefetch(c.path);
        });
    }, []);

    return (
        <Tooltip key={route.path} content={route.label} disabled={!sidebarCollapsed}>
            <Flex
                flexDir={'column'} align="center" gap={isOpen ? 3 : 0} px={2} py={2} w='100%' rounded="md" cursor="pointer"
                color={isActive ? "#fff" : "text.primary"}
                bg={isActive ? "button.primary" : "transparent"}
                justifyContent={sidebarCollapsed ? 'center' : 'start'}
                _hover={!route.children ? { bg: isActive ? "button.primary" : "pallete.surfaceElevated2" } : {}}
                transition="background 0.2s ease"
                onClick={() => {
                    if (route.children) {
                        const target = route.path ?? route.children?.[0]?.path;
                        if (target) router.push(target);
                        requestAnimationFrame(() => toggleItem());
                    } else if (route.path) {
                        router.push(route.path);
                    }
                }}
            >
                <Flex
                    ref={itemContainerRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                    gap={3} w={'100%'} align="center" justifyContent={sidebarCollapsed ? 'center' : 'space-between'}>
                    <Flex gap={3}>
                        <Icon as={route.icon} boxSize={5} />
                        {!sidebarCollapsed && <Text fontSize="sm" fontWeight="medium" whiteSpace="nowrap">{route.label}</Text>}
                    </Flex>
                    {!sidebarCollapsed && route.children && (
                        <Icon as={LuChevronDown} boxSize={4} justifySelf={'end'}
                            cursor="pointer"
                            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                            transition="transform 0.3s ease"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleItem();
                            }}
                        />
                    )}
                </Flex>

                {!sidebarCollapsed && route.children &&
                    <Flex ref={containerRef} flexDir={'column'} w={'100%'} pl={1} alignItems={sidebarCollapsed ? 'center' : 'start'}
                        gap={isOpen ? 1 : 0} overflow="hidden"
                        height={isOpen ? "auto" : "0px"}
                    >
                        {route.children.map((child) => {
                            let isChildItemActive;
                            if (!child.path) {
                                isChildItemActive = false;
                            } else {
                                const [basePath, queryString] = child.path.split("?");
                                const childParams = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
                                const isPathMatch = pathname === basePath || (pathname.startsWith(basePath + "/") && basePath !== "/members");
                                const isQueryMatch = Object.keys(childParams).length === 0 || Object.entries(childParams).every(([key, value]) => currentParams[key] === value);
                                isChildItemActive = isPathMatch && isQueryMatch;
                            }

                            return (
                                <Flex ref={itemRef}
                                    key={child.path} gap={3}
                                    px={2} py={2} w='100%' rounded="md" cursor="pointer"
                                    bg={isChildItemActive ? "button.primary" : "transparent"}
                                    color={isChildItemActive ? "#fff" : "text.primary"}
                                    justifyContent={sidebarCollapsed ? 'center' : 'start'}
                                    _hover={{ bg: isChildItemActive ? "button.primary" : "pallete.surfaceElevated2" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (child?.path) router.push(child.path);
                                    }}
                                >
                                    <Icon as={child.icon} boxSize={5} />
                                    {!sidebarCollapsed && <Text fontSize="13px" fontWeight="500" whiteSpace="nowrap">{child.label}</Text>}
                                </Flex>
                            )
                        })}
                    </Flex>
                }
            </Flex>
        </Tooltip>
    )

}
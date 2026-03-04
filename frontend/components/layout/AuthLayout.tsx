"use client";

import { ReactNode, useRef } from "react";
import { useGsapReveal } from "@/hooks";
import { Box, Flex, Heading, IconButton, List, SimpleGrid, Text } from "@chakra-ui/react";;
import { LuCircleCheck, LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "../ui/chakra/color-mode";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function AuthShell({ children }: { children: ReactNode }) {
    const { colorMode, toggleColorMode } = useColorMode();
    const { containerRef, itemRef } = useGsapReveal({
        container: {
            opacity: 0,
            fromX: -60,   // left
            fromY: 40,    // bottom
            duration: 0.8,
            ease: "power3.out",
        },
        items: {
            opacity: 0,
            fromX: -24,   // 👈 LEFT (THIS WAS MISSING)
            fromY: 24,    // 👈 BOTTOM
            duration: 0.6,
            stagger: 0.25,
            ease: "power3.out",
            delay: 0.15,
        },
    });

    const themeToggleRef = useRef<HTMLButtonElement | null>(null);
    useGSAP(() => {
        if (!themeToggleRef.current) return;
        const icon = themeToggleRef.current.querySelector("svg");
        if (!icon) return;

        gsap.set(icon, { transformOrigin: "50% 50%", transformPerspective: 500 });
        const tl = gsap.timeline();

        tl.fromTo(icon,
            { rotate: colorMode === "dark" ? -360 : 360, scale: 1, opacity: 0 },
            { rotate: 0, scale: 1.1, opacity: 1, duration: 1, ease: "power4.out" }
        ).to(icon, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });

    }, { dependencies: [colorMode] });

    return <SimpleGrid position={'relative'} columns={{ base: 1, md: 2 }} h={'100vh'} w={'100%'} bg={'bg.primary'}>
        <Flex ref={containerRef} w={'80%'} mx={'auto'} justifyContent={'center'} alignItems={'center'} flexDir={'column'} display={{ base: 'none', md: "flex" }} p={4} gap={6}>

            <Flex ref={itemRef} direction="column" align="center" gap={2}>
                <Heading textAlign={'center'} fontSize="32px" fontWeight="700" letterSpacing="-0.5px">CollabSphere</Heading>
                <Text fontSize="16px" color="gray.500" textAlign="center">
                    One workspace. Real-time collaboration. AI-powered.
                </Text>
            </Flex>

            <Text ref={itemRef} mt={2} color="text.secondary" textAlign={'center'} fontSize={'14px'} maxW="500px" lineHeight="1.6">
                CollabSphere helps modern teams collaborate in real time with chat, tasks, documents, calls, and built-in AI — all inside one secure, organization-centric workspace.
            </Text>

            <List.Root gap="2" variant="plain" align="start" maxW="500px">
                <List.Item ref={itemRef}>
                    <List.Indicator asChild color="green.500">
                        <LuCircleCheck />
                    </List.Indicator>
                    Real-time chat, calls, docs & tasks in one place
                </List.Item>
                <List.Item ref={itemRef}>
                    <List.Indicator asChild color="green.500">
                        <LuCircleCheck />
                    </List.Indicator>
                    AI-powered summaries, notes & task generation
                </List.Item>
                <List.Item ref={itemRef}>
                    <List.Indicator asChild color="green.500">
                        <LuCircleCheck />
                    </List.Indicator>
                    Multi-organization support with role-based access
                </List.Item>
            </List.Root>

        </Flex>
        <Flex bg={"bg.tertiary"} minH={'100vh'} w={'100%'} overflow={'auto'}>
            <Box p={4} w={'100%'}>{children}</Box>
        </Flex>

        <IconButton position={'absolute'} top={'10px'} right={'10px'} ref={themeToggleRef} aria-label="Toggle theme" onClick={toggleColorMode} borderColor={'text.secondary'} variant="ghost" size="sm" rounded="full" color="text" _hover={{ bg: "text.secondary" }}>
            {colorMode === "dark" ? <LuMoon size={16} /> : <LuSun size={16} />}
        </IconButton>
    </SimpleGrid>
}
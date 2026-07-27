"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface WorkstationLoaderProps {
    label?: string;
}

export default function SpecialLoader({ label = "Entering workspace" }: WorkstationLoaderProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const scanRef = useRef<HTMLDivElement | null>(null);
    const dotsRef = useRef<HTMLDivElement | null>(null);
    const labelRef = useRef<HTMLParagraphElement | null>(null);

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from(containerRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" })
            .from(labelRef.current, { opacity: 0, y: 8, duration: 0.4, ease: "power3.out" }, "-=0.1");

        // Scanning line sweeping down, like a boot/init sequence
        gsap.to(scanRef.current, {
            y: "100%",
            duration: 1.4,
            repeat: -1,
            ease: "power1.inOut",
        });

        // Pulsing dots on the label, e.g. "Entering workspace..."
        if (dotsRef.current) {
            const dots = dotsRef.current.children;
            gsap.to(dots, {
                opacity: 1,
                duration: 0.3,
                stagger: { each: 0.2, repeat: -1, yoyo: true },
            });
        }
    }, []);

    return (
        <Flex
            ref={containerRef}
            direction="column"
            align="center"
            justify="center"
            h="100%"
            w="100%"
            gap={4}
            bg="pallete.background"
        >
            <Box
                position="relative"
                w="72px"
                h="72px"
                borderRadius="lg"
                border="1px solid"
                borderColor="pallete.borderSubtle"
                bg="pallete.surfaceElevated"
                overflow="hidden"
                boxShadow="md"
            >
                {/* corner brackets, terminal/workstation feel */}
                <Box position="absolute" top="6px" left="6px" w="10px" h="10px" borderTop="2px solid" borderLeft="2px solid" borderColor="button.primary" />
                <Box position="absolute" top="6px" right="6px" w="10px" h="10px" borderTop="2px solid" borderRight="2px solid" borderColor="button.primary" />
                <Box position="absolute" bottom="6px" left="6px" w="10px" h="10px" borderBottom="2px solid" borderLeft="2px solid" borderColor="button.primary" />
                <Box position="absolute" bottom="6px" right="6px" w="10px" h="10px" borderBottom="2px solid" borderRight="2px solid" borderColor="button.primary" />

                {/* scanning line */}
                <Box
                    ref={scanRef}
                    position="absolute"
                    top="-20%"
                    left="0"
                    w="100%"
                    h="20%"
                    bgGradient="linear(to-b, transparent, button.primary, transparent)"
                    opacity={0.6}
                />
            </Box>

            <Flex align="baseline" gap={0.5}>
                <Text ref={labelRef} fontSize="sm" color="text.secondary" fontWeight="medium">
                    {label}
                </Text>
                <Flex ref={dotsRef} gap={0.5}>
                    <Text fontSize="sm" color="text.secondary" opacity={0}>.</Text>
                    <Text fontSize="sm" color="text.secondary" opacity={0}>.</Text>
                    <Text fontSize="sm" color="text.secondary" opacity={0}>.</Text>
                </Flex>
            </Flex>
        </Flex>
    );
}
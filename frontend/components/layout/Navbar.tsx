"use client";

import { Flex, Text, IconButton } from "@chakra-ui/react";
import { useColorMode } from "../ui/color-mode";
import { motion, AnimatePresence } from "framer-motion";
import { LuMoon, LuSun } from "react-icons/lu";

const MotionIcon = motion.span;

export default function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex h="56px" align="center" justify="space-between" px={6} borderBottom="1px solid" borderColor="text.secondary" boxShadow="0 1px 0 rgba(0,0,0,0.08)">
            <Text fontWeight="semibold">Dashboard</Text>

            <Flex>
                <IconButton
                    aria-label="Toggle theme"
                    onClick={toggleColorMode}
                    variant="ghost"
                    size="sm"
                    rounded="full"
                    color="text"
                    _hover={{ bg: "surface" }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {colorMode === "dark" ? (
                            <MotionIcon
                                key="moon"
                                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <LuMoon size={16} />
                            </MotionIcon>
                        ) : (
                            <MotionIcon
                                key="sun"
                                initial={{ rotate: 90, scale: 0.6, opacity: 0 }}
                                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                exit={{ rotate: -90, scale: 0.6, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <LuSun size={16} />
                            </MotionIcon>
                        )}
                    </AnimatePresence>
                </IconButton>
            </Flex>
        </Flex>
    );
}

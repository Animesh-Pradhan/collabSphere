"use client"

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

interface SlashCommandListProps {
    items: { label: string; icon: React.ElementType; run: any }[];
    command: (item: any) => void;
}

const SlashCommandList = forwardRef((props: SlashCommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) props.command(item);
    };

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % props.items.length);
                return true;
            }
            if (event.key === "Enter") {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    if (props.items.length === 0) {
        return (
            <Box bg="pallete.surfaceElevated" border="1px solid" borderColor="pallete.borderSubtle"
                borderRadius="lg" boxShadow="0 4px 16px rgba(0,0,0,0.12)" px={3} py={2}
            >
                <Text fontSize="sm" color="text.secondary">No results</Text>
            </Box>
        );
    }

    return (
        <Box bg="pallete.surfaceElevated" border="1px solid" borderColor="pallete.borderSubtle"
            borderRadius="lg" boxShadow="0 4px 16px rgba(0,0,0,0.12)" p={1}
            minW="220px" maxH="300px" overflowY="auto"
        >
            {props.items.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Flex key={item.label} align="center" gap={2} px={2} py={1.5} borderRadius="md"
                        cursor="pointer" fontSize="sm"
                        bg={index === selectedIndex ? "pallete.surfaceElevated2" : "transparent"}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => selectItem(index)}
                    >
                        <Icon size={16} /> {item.label}
                    </Flex>
                );
            })}
        </Box>
    );
});

SlashCommandList.displayName = "SlashCommandList";
export default SlashCommandList;
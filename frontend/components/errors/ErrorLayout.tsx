"use client";

import { Alert, Box, Heading, Text, VStack } from "@chakra-ui/react";
import { UIButton } from "../ui/custom";

type ErrorLayoutProps = {
    code?: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
};

export default function ErrorLayout({ code, title, description, action, }: ErrorLayoutProps) {
    return (
        <VStack h="100%" justify="center" px={6} gap={6}>
            {code && (<Text fontSize="sm" color="text.secondary">{code}</Text>)}
            <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="semibold" letterSpacing="-0.5px">{title}</Heading>
            <Text maxW="500px" color="text.secondary" fontSize="lg">{description}</Text>

            {action && (<UIButton size="lg" borderRadius="full" px={8} btnType="primary" onClick={action.onClick}>{action.label}</UIButton>)}


            <Box maxW="520px" w="100%" mt={6}>
                <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Error Details</Alert.Title>
                        <Alert.Description>
                            If the issue persists, please contact support.
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            </Box>

        </VStack>
    );
}
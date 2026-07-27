"use client";

import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            h="100%"
            gap={4}
            textAlign="center"
            px={6}
        >
            <Heading size="lg">
                Document not found
            </Heading>

            <Text color="text.secondary" maxW="420px">
                This document doesn&apos;t exist, has been removed, or you no longer have permission to access it.
            </Text>

            <Button onClick={() => router.back()}>
                Go Back
            </Button>
        </Flex>
    );
}
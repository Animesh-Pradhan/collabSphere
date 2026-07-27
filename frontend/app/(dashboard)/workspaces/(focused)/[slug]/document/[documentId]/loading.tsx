import { Flex, Skeleton, SkeletonText } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Flex direction="column" h="100%" gap={4} p={6}>
            <Skeleton height="40px" width="40%" borderRadius="md" />

            <Skeleton height="48px" borderRadius="md" />

            <Flex flex={1} justify="center">
                <Flex direction="column" w="100%" maxW="850px" gap={6}>
                    <Skeleton height="32px" width="60%" />
                    <SkeletonText noOfLines={18} gap="5" lineHeight="4" />
                </Flex>
            </Flex>
        </Flex>
    );
}
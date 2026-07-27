import { Flex, Spinner } from "@chakra-ui/react";

export default function loading() {
    return (
        <Flex gap={2} p={4} h={'100%'} w={'100%'} alignItems={'center'} justifyContent={'center'}>
            <Spinner color="pallete.secondary" animationDuration="0.8s" />
            <p>Loading...</p>
        </Flex>
    );
}

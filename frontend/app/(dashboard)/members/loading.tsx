import { Flex, Spinner } from "@chakra-ui/react";

export default function loading() {
    return (
        <Flex p={4} h={'100%'} w={'100%'} alignItems={'center'} justifyContent={'center'} width={'100%'} overflow={'hidden'}>
            <Spinner />
        </Flex>
    );
}

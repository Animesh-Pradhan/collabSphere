import { Flex } from "@chakra-ui/react";
import { Loader } from "@/components/ui/custom";

export default function Loading() {
    return (
        <Flex p={4} h={'100vh'} w={'100%'} alignItems={'center'} justifyContent={'center'} width={'100%'} overflow={'hidden'}>
            <Loader />
        </Flex>
    );
}

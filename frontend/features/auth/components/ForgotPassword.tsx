"use client";

import { UIIconButton } from "@/components/ui/custom";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";

export default function ForgotPassword() {
    const router = useRouter();

    return <Flex h={'100%'} w={'100%'} pos={'relative'} alignItems={'start'} justifyContent={{ base: 'flex-start', md: 'center' }} flexDir={'column'} py={{ base: 4, md: 6 }} px={{ base: 4, md: 10, lg: 12, xl: 14 }}>

        <UIIconButton pos={'absolute'} top={'0px'} borderRadius={'full'} left={'5px'} btnType={'outline'} onClick={() => router.back()}><IoIosArrowBack /></UIIconButton>

        <Heading mt={{ base: "20px", md: "0" }} lineHeight={'1.1'} fontSize={{ base: '24px', md: '42px' }} fontWeight={'medium'} letterSpacing="-0.5px">Forgot Password?</Heading>
        <Text mt={4}>We can help you recover your account. Just give your email.</Text>

        <Flex as={'form'} flexDir={'column'} w={'100%'} mt={10} gap={'20px'} width={'100%'}>

        </Flex>
    </Flex>
}
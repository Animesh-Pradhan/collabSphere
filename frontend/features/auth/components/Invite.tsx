"use client";

import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState } from 'react'
import { useInvite } from '../hooks/useInvite';
import { useRouter } from 'next/navigation';
import { Flex, Heading, Span, Spinner, Text, VStack } from '@chakra-ui/react';
import { FcAcceptDatabase } from 'react-icons/fc';
import { UIButton } from '@/components/ui/custom';

export default function Invite({ token }: { token: string }) {
    const router = useRouter();
    const { isAuthenticated, user, isInitialized, clearAuth } = useAuthStore();
    const { previewLoading, previewData, previewError, acceptInvite, acceptLoading } = useInvite(token);

    const shouldRedirect = !previewLoading && !isAuthenticated;
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!shouldRedirect) return;
        if (countdown === 0) {
            const fallbackUrl = `/auth/invite?token=${token}`;
            router.replace(`/auth/register?redirect=${encodeURIComponent(fallbackUrl)}`);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [shouldRedirect, countdown, router, token]);

    if (!isInitialized) {
        return <Spinner />;
    }
    if (previewLoading) {
        return <Flex h={'100%'} w={'100%'} alignItems={'center'} justifyContent={'center'} flexDir={'column'}>
            <Spinner color="blue.500" />
            <Heading size="md">Verifying Invitation</Heading>
            <Text color="text.secondary">Please wait while we validate your invite...</Text>
        </Flex>;
    }
    if (previewError || !previewData) {
        return <Flex h={'100%'} w={'100%'} alignItems={'center'} justifyContent={'center'} flexDir={'column'}>
            <Heading size="md">Invitation Invalid</Heading>
            <Text color="text.secondary">This invitation link is either expired or invalid.</Text>
        </Flex>;
    }

    if (user?.email && isAuthenticated) {
        if (user?.email !== previewData.email) {
            return (<Flex h={'100%'} w={'100%'} alignItems={'center'} justifyContent={'center'} flexDir={'column'}>
                <Heading size="md">Email Mismatch</Heading>

                <Text color="text.secondary">This invitation was sent to: <Span>{previewData.email}</Span></Text>
                <Text color="text.secondary">But you are currently logged in as: <Span>{user?.email}</Span></Text>
                <Text color="text.secondary">Please login with the correct account to accept this invitation.</Text>

                <UIButton mt={6} btnType={'primary'} loading={acceptLoading} loadingText={"Accepting..."} onClick={() => {
                    const fallbackUrl = `/auth/invite?token=${token}`;
                    clearAuth();
                    router.replace(`/auth/login?redirect=${encodeURIComponent(fallbackUrl)}`)
                }}>Login Again</UIButton>
            </Flex>);
        }
    }

    return (
        <Flex h={'100%'} w={'100%'} alignItems={'center'} justifyContent={{ base: 'flex-start', md: 'center' }} flexDir={'column'} py={{ base: 4, md: 6 }} px={{ base: 4, md: 10, lg: 12, xl: 14 }}>

            <VStack>
                <Text fontSize={{ base: '24px', md: '42px' }}><FcAcceptDatabase /></Text>
                <Heading fontSize={{ base: '20px', md: '38px' }} fontWeight={'medium'} letterSpacing="-0.5px">You are invited!</Heading>
            </VStack>

            <Flex mt={6} textAlign={'center'} flexDir={'column'} alignItems={'center'}>
                <Text>Welcome, <Span fontWeight="bold">{previewData.email}</Span> 🎉</Text>
                <Text color="text.secondary">You are invited to join the organisation <Span fontWeight="semibold">{previewData.organisationName}</Span></Text>
                <Text color="text.secondary">Role: <Span fontWeight="medium">{previewData.role}</Span></Text>
            </Flex>

            {shouldRedirect ?
                <VStack mt={6} p={4} bg="pallete.primary" boxShadow={'md'} rounded="lg" textAlign="center">
                    <Text fontWeight="medium">Please Login / Sign Up before accepting invite</Text>

                    <Text mt={2} fontSize="sm" color="text.secondary">
                        Redirecting to register page...
                    </Text>

                    <Flex alignItems={'center'} justifyContent={'center'} w={'40px'} h={'40px'} mt={3} bg={'pallete.secondary'} borderRadius={'full'}>
                        <Heading fontSize={'18px'} color="bg.secondary">{countdown}</Heading>
                    </Flex>
                </VStack>
                : <UIButton mt={6} btnType={'primary'} onClick={acceptInvite} loading={acceptLoading} loadingText={"Accepting..."}>Accept Invitation</UIButton>
            }
        </Flex>
    )
}

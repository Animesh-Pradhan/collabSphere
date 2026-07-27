import { EmptyState, Icon, VStack } from '@chakra-ui/react'
import React from 'react'
import { IconType } from 'react-icons'

export default function UIEmptyBox({ icon, title, description }: {
    icon: IconType,
    title: string,
    description?: string
}) {
    return (
        <EmptyState.Root>
            <EmptyState.Content gap={4}>
                <EmptyState.Indicator><Icon as={icon} /></EmptyState.Indicator>
                <VStack textAlign="center" gap={0}>
                    <EmptyState.Title>{title}</EmptyState.Title>
                    {description && <EmptyState.Description>{description}</EmptyState.Description>}
                </VStack>
            </EmptyState.Content>
        </EmptyState.Root>
    )
}

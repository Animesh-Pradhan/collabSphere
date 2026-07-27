import { ButtonGroup, Pagination } from '@chakra-ui/react'
import React from 'react'
import UIIconButton from './UIIconButton'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

interface UIPaginationProps {
    totalItems: number
    pageSize: number
    page: number
    onPageChange: (details: { page: number }) => void
    canPrevious: boolean
    canNext: boolean
}

export default function UIPagination({ totalItems, pageSize, page, onPageChange, canPrevious, canNext }: UIPaginationProps) {
    return (
        <Pagination.Root
            count={totalItems}
            pageSize={pageSize}
            page={page}
            onPageChange={onPageChange}
        >
            <ButtonGroup size="sm" gap="2">
                <Pagination.PrevTrigger asChild>
                    <UIIconButton borderRadius="full" btnType={'outline'} disabled={!canPrevious}>
                        <HiChevronLeft />
                    </UIIconButton>
                </Pagination.PrevTrigger>

                <Pagination.Items render={(page) => (
                    <Pagination.Item key={page.value} type={page.type} value={page.value} asChild>
                        <UIIconButton btnType={'outline'} borderRadius={'full'}
                            _selected={{ bg: "pallete.secondary", color: "white" }}
                            _hover={{ bg: "pallete.secondary", color: "white" }}
                        >
                            {page.value}
                        </UIIconButton>
                    </Pagination.Item>
                )} />

                <Pagination.NextTrigger asChild>
                    <UIIconButton borderRadius="full" btnType={'outline'} disabled={!canNext}>
                        <HiChevronRight />
                    </UIIconButton>
                </Pagination.NextTrigger>

            </ButtonGroup>
        </Pagination.Root>
    )
}

import { formatDate } from "@/utils/helper"
import { Avatar, Box, Flex, Text } from "@chakra-ui/react"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation";

export const textColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
    cell: (info) => {
        const value = info.getValue();
        return value ?? "N/A";
    },
})

export const dateColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
    cell: (info) => formatDate(info.getValue() as string, { format: "medium" }),
})

export const statusColumn = <T,>(key: string, label?: string): ColumnDef<T> => ({
    id: key,
    accessorKey: key,
    header: label ?? key,
    cell: (info) => {
        const value = info.getValue() as string
        return (<Box px="2" py="1"
            borderRadius="md"
            bg={value === "ACTIVE"
                ? "green.100"
                : value === "SUSPENDED"
                    ? "yellow.100"
                    : "red.100"
            }
        >
            {value}
        </Box>)
    },
})

export const userColumn = <T,>(label: string, accessor: (row: T) => TableUser | null | undefined, clickable = false): ColumnDef<T> => ({
    id: label, header: label, cell: ({ row }) => {
        const user = accessor(row.original);
        if (!user) return "N/A";

        return (
            <UserCell id={user.id} firstName={user.firstName} lastName={user.lastName} avatar={user.avatar} clickable={clickable} />
        );
    },
});

interface UserCellProps {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    email?: string;
    clickable?: boolean;
}
export interface TableUser {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string;
    avatar?: string | null;
}
export default function UserCell({ id, firstName, lastName, avatar, clickable = false }: UserCellProps) {
    const router = useRouter();

    return (
        <Flex gap={1} align="center" cursor={clickable ? "pointer" : "default"} onClick={() => {
            if (clickable && id) router.push(`/members/${id}`);
        }}>
            <Avatar.Root size={'xs'}>
                <Avatar.Fallback name={`Animesh Pradhan`} />
                <Avatar.Image src={avatar ?? undefined} />
            </Avatar.Root>
            <Text fontWeight="medium" fontSize={'13px'}>{firstName} {lastName}</Text>
        </Flex>
    );
}
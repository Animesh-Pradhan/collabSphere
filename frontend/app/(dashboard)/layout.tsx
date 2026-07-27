"use client"

import UnauthorizedPage from "@/components/errors/UnAuthorizedPage";
import { useAuthStore } from "@/store/auth.store";
import { Flex, Spinner } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const AppShell = dynamic(() => import('@/components/layout/AppShell'))
const Sidebar = dynamic(() => import('@/components/layout/Sidebar'))
const Navbar = dynamic(() => import('@/components/layout/Navbar'))

export default function DashboardLayout({ children }: {
    children: React.ReactNode;
}) {
    const { isInitialized, isAuthenticated } = useAuthStore();

    if (isInitialized) <Flex h={'100vh'} w={'100%'} alignItems={'center'} justifyContent={'center'}><Spinner /></Flex>;
    return (
        <AppShell sidebar={<Sidebar />} navbar={<Navbar />} isAuthenticated={isInitialized && isAuthenticated}>
            {children}
        </AppShell>
    );
}

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { queryClient } from "@/libs/queryClient";
const UserInitializer = dynamic(() => import('@/features/auth/actions/authInitializer'))
const Provider = dynamic(() => import('@/components/ui/chakra/provider').then((mod) => mod.Provider))

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider defaultTheme="light">
                <UserInitializer />
                {children}
            </Provider>
        </QueryClientProvider>
    );
}

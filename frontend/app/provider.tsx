"use client";

import "tiptap-extension-resizable-image/styles.css";
import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { queryClient } from "@/libs/queryClient";
import { Toaster } from "@/components/ui/chakra/toaster";
import { useAuthStore } from "@/store/auth.store";
const UserInitializer = dynamic(() => import('@/features/auth/actions/authInitializer'))
const Provider = dynamic(() => import('@/components/ui/chakra/provider').then((mod) => mod.Provider))

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider defaultTheme="light">
                <Toaster />
                <UserInitializer />
                {children}
            </Provider>
        </QueryClientProvider>
    );
}

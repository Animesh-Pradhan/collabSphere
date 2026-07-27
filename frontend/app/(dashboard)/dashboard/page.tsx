"use client";

import { useAuthStore } from "@/store/auth.store";
import { Box } from "@chakra-ui/react";

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    return (
        <Box position={'relative'} style={{ padding: 24 }}>
            <h1>CollabSphere Dashboard</h1>
            <p>Application started successfully ✅: {user?.email} {isAuthenticated}</p>
        </Box>
    );
}

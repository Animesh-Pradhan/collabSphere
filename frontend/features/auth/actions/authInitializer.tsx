"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { fetchUser } from "@/services/auth.service";

export default function UserInitializer() {
    const { user, setUser, clearAuth, isInitialized } = useAuthStore();

    useEffect(() => {
        const initialize = async () => {
            console.log(`isInitialized: ${isInitialized}`);


            // if (!gateToken || isInitialized) return;


            try {
                const fullUser = await fetchUser();
                setUser(fullUser.data);
            } catch {
                clearAuth();
            }
        };

        if (!isInitialized) {
            initialize();
        }
    }, [user, isInitialized, clearAuth, setUser]);

    return null;
}

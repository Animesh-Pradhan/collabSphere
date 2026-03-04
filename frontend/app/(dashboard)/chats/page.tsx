"use client";

import { useAuthStore } from "@/store/auth.store";

export default function ChatPage() {
    const { user, isAuthenticated } = useAuthStore();

    return (
        <div style={{ padding: 24 }}>
            <h1>CollabSphere</h1>
            <p>Chat:  {user?.email} {isAuthenticated}</p>
        </div>
    );
}

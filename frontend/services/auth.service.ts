import { apiFetch } from "@/libs/apiFetch";
import { UserProfile } from "@/store/auth.store";

export type RegisterPayload = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    mobileNo: string;
    password: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export interface AuthData {
    gateToken: string;
    user: {
        id: string;
        email: string;
    };
}

export function registerUser(payload: RegisterPayload) {
    return apiFetch<AuthData>("/auth/user/register-and-login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export function loginUser(payload: LoginPayload) {
    return apiFetch<AuthData>("/auth/user/login", { method: "POST", body: JSON.stringify(payload) }, false);
}

export async function refreshGateToken(): Promise<AuthData | null> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) return null;
    const json = await res.json();

    if (!json?.success) return null;
    return json.data;
}

export function fetchUser() {
    return apiFetch<UserProfile>("/user/detail", { method: "GET" });
}

export async function previewOrgInvite(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organisation/invite/preview?token=${token}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) return null;
    const json = await res.json();

    if (!json?.success) return null;
    return json;
}

export function acceptOrgInvite(payload: { token: string }) {
    return apiFetch(`/organisation/invite/accept`, { method: "POST", body: JSON.stringify(payload) }, false);
}

export function logoutUser() {
    return apiFetch("/auth/user/logout", { method: "POST" }, true);
}
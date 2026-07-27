// lib/server/refreshGateToken.ts
import { cookies } from "next/headers";

export async function serverRefreshGateToken(): Promise<boolean> {
    const cookieStore = await cookies();
    const vaultToken = cookieStore.get(process.env.VAULT_COOKIE_NAME || "vaultToken")?.value;

    if (!vaultToken) return false;

    const res = await fetch(`${process.env.API_URL}/auth/user/refresh`, {
        method: "POST",
        headers: {
            cookie: cookieStore.toString(),
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    return res.ok;
}

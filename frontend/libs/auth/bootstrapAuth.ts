import { cookies } from "next/headers";

export async function bootstrapAuth() {
    const cookieStore = await cookies();
    const vaultCookieName = process.env.VAULT_COOKIE_NAME!;
    const vaultToken = cookieStore.get(vaultCookieName)?.value;

    if (!vaultToken) return null;

    const res = await fetch(`${process.env.BACKEND_URL}/auth/user/refresh`, {
        method: "POST",
        headers: {
            "Cookie": `${vaultCookieName}=${vaultToken}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();

    if (!json?.success) return null;
    return {
        user: json.data.user,
        gateToken: json.data.gateToken,
    };
}

// lib/server/serverFetch.ts
import { cookies } from "next/headers";
import { ApiError } from "@/types/api";
import { serverRefreshGateToken } from "@/features/auth/actions/refreshGateToken";

export async function serverFetch<T>(url: string, options?: RequestInit, retry: boolean = true): Promise<{ data: T; message: string }> {
    const cookieStore = await cookies();

    const res = await fetch(`${process.env.BACKEND_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
            cookie: cookieStore.toString()
        },
        cache: "no-store",
    });

    if (res.status === 401 && retry) {
        const refreshed = await serverRefreshGateToken();
        if (!refreshed) {
            throw new Error("Unauthorized");
        }
        return serverFetch<T>(url, options, false);
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
        const err: ApiError = Object.assign(
            new Error(json?.message || "Unauthorized"),
            {
                statusCode: res.status,
                errorCode: json?.errorCode,
                errors: json?.errors,
                path: json?.path,
            }
        );
        throw err;
    }

    return {
        data: json.data,
        message: json.message,
    };
}

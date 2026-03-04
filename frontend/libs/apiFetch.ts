import { refreshGateToken } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ApiError, ApiErrorResponse, ApiSuccess } from "@/types/api";

export async function apiFetch<T>(url: string, options?: RequestInit, retry = true): Promise<{ data: T; message: string }> {
    const gateToken = useAuthStore.getState().gateToken;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(gateToken && { Authorization: `Bearer ${gateToken}` }),
            ...options?.headers,
        },
        ...options,
    });

    if (res.status === 401 && retry) {
        const refreshed = await refreshGateToken();

        if (!refreshed) {
            useAuthStore.getState().clearAuth();
            const json = (await res.json().catch(() => null)) as ApiErrorResponse | null;
            const err: ApiError = Object.assign(new Error(json?.message || "Unauthorized"), { statusCode: res.status, errorCode: json?.errorCode, errors: json?.errors, path: json?.path, });
            throw err;
        }

        useAuthStore.getState().setAuth({ gateToken: refreshed.gateToken });
        return apiFetch<T>(url, options, false);
    }

    const json = (await res.json().catch(() => null)) as | ApiSuccess<T> | ApiErrorResponse | null;

    if (!json) {
        const err: ApiError = Object.assign(new Error("Invalid server response"), { statusCode: res.status });
        throw err;
    }

    if (!json.success) {
        const err: ApiError = Object.assign(new Error(json.message), {
            statusCode: json.statusCode,
            errorCode: json.errorCode,
            errors: json.errors,
            path: json.path,
        });
        throw err;
    }

    return { data: json.data, message: json.message };
}

export function isAuthenticatedForRefresh(gateToken: string | null): boolean {
    return !!gateToken;
}

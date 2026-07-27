import { refreshGateToken } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ApiError, ApiErrorResponse, ApiSuccess } from "@/types/api";

export async function apiFetch<T>(url: string, options?: RequestInit, retry = true): Promise<{ data: T; message: string }> {
    const gateToken = useAuthStore.getState().gateToken;
    const method = options?.method ?? "GET";
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

    if (!res.ok) throw normalizeError(json, res.status, method);
    if (!json) throw normalizeError(json, res.status, method);

    if (!json.success) {
        const err: ApiError = Object.assign(new Error(json.message), {
            statusCode: json.statusCode,
            errorCode: json.errorCode,
            errors: json.errors,
            path: json.path,
            uiType: method === "GET" ? "PAGE" : resolveErrorUI(json.statusCode),
        });
        throw err;
    }

    return { data: json.data, message: json.message };
}

export function isAuthenticatedForRefresh(gateToken: string | null): boolean {
    return !!gateToken;
}

function resolveErrorUI(status?: number): ApiError["uiType"] {
    if (!status) return "TOAST";

    if (status >= 500) return "PAGE";
    if (status === 404) return "PAGE";
    if (status === 401) return "PAGE";

    if (status === 400 || status === 422) return "FORM";

    return "TOAST";
}

function normalizeError(json: any, status: number, method: string): ApiError {
    let message = "Something went wrong";

    if (typeof json?.message === "string") {
        message = json.message;
    }

    if (Array.isArray(json?.message)) {
        message = json.message[0];
    }

    const finalStatus = json?.statusCode || status;

    const err: ApiError = Object.assign(new Error(message), {
        name: "ApiError",
        statusCode: json?.statusCode || status,
        errorCode: json?.error || "UNKNOWN_ERROR",
        errors: json?.message,
        path: json?.path,
        uiType: finalStatus === 429 ? "TOAST" : method === "GET" ? "PAGE" : resolveErrorUI(finalStatus),
    });
    console.log(err);

    return err;
}

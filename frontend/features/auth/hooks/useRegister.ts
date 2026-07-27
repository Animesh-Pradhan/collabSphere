import { useRouter } from "next/navigation";
import { AuthData, RegisterPayload, registerUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useAppMutation } from "@/hooks";
import { ApiError } from "@/types/api";
import { setCookie } from "@/libs/cookie";
import { fetchUser } from "@/services/user.service";

export function useRegister() {
    const router = useRouter();
    const { setAuth, clearAuth } = useAuthStore();

    const mutation = useAppMutation<{ data: AuthData; message: string }, RegisterPayload, ApiError>(registerUser, {
        onSuccess: async ({ data }) => {
            setCookie("gateToken", data.gateToken, {
                maxAge: 15 * 60,
                sameSite: "lax",
                secure: true,
            });

            try {
                const res = await fetchUser();
                setAuth({ user: res.data, gateToken: data.gateToken });
            } catch (error) {
                console.log(error);
                clearAuth();
                return;
            }

            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get("redirect");

            requestAnimationFrame(() => {
                if (redirect && redirect.startsWith("/")) {
                    router.replace(redirect);
                } else {
                    router.replace("/");
                }
            });
        }
    });

    return {
        register: (payload: RegisterPayload) => mutation.mutate(payload),
        loading: mutation.isPending,
        error: mutation.error?.message ?? null,
        resetError: mutation.reset,
    };
}

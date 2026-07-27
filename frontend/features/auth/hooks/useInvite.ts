import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useAppQuery } from "@/hooks";
import { useAppMutation } from "@/hooks";
import { previewOrgInvite, acceptOrgInvite } from "@/services/auth.service";
import { setCookie } from "@/libs/cookie";
import { ApiError } from "@/types/api";

export function useInvite(token: string | null) {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const previewQuery = useAppQuery(["invite-preview", token], () => previewOrgInvite(token as string), { enabled: !!token });

    const acceptMutation = useAppMutation<any, { token: string }, ApiError>(acceptOrgInvite, {
        onSuccess: ({ data }) => {
            setAuth({ user: data.user, gateToken: data.gateToken });

            setCookie("gateToken", data.gateToken, {
                maxAge: 15 * 60,
                sameSite: "lax",
                secure: true,
            });

            requestAnimationFrame(() => {
                router.replace("/");
            });
        }
    });

    return {
        previewLoading: previewQuery.isLoading,
        previewData: previewQuery.data?.data ?? null,
        previewError: previewQuery.error?.message ?? null,
        acceptInvite: () => {
            if (!token) return;
            acceptMutation.mutate({ token });
        },
        acceptLoading: acceptMutation.isPending,
        acceptError: acceptMutation.error?.message ?? null,
    };
}   
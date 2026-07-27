import { useAuthStore } from "@/store/auth.store";
import { deleteCookie } from "@/libs/cookie";
import { logoutUser } from "@/services/auth.service";

export function useLogout() {
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.log(error);
        }
        deleteCookie("gateToken");
        clearAuth();
    };

    return { logout };
}
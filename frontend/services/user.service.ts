import { apiFetch } from "@/libs/apiFetch";
import { UserProfile } from "@/store/auth.store";

export function fetchUser() {
    return apiFetch<UserProfile>("/user/detail", { method: "GET" });
}

// export function fetch
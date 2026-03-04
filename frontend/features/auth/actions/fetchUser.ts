import { serverFetch } from "@/libs/serverFetch";
import { UserProfile } from "@/store/auth.store";

export async function serverFetchUser(): Promise<UserProfile | null> {
    try {
        const res = await serverFetch<UserProfile>("/user/detail", {
            method: "GET",
        });
        console.log(res, "res");

        return res.data;
    } catch {
        return null;
    }
}
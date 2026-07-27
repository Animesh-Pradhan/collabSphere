import type { RegisterOptions } from "react-hook-form";
import type { LoginPayload } from "@/services/auth.service";

export const loginRules: { [K in keyof LoginPayload]?: RegisterOptions<LoginPayload, K> } = {
    email: {
        required: "Email is required",
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
        },
    },

    password: {
        required: "Password is required",
        minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
        },
    },
};

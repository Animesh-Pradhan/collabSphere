import type { RegisterOptions } from "react-hook-form";
import type { RegisterPayload } from "@/services/auth.service";

export const registrationRules: { [K in keyof RegisterPayload]?: RegisterOptions<RegisterPayload, K> } = {
    firstName: {
        required: "First name is required",
        minLength: {
            value: 3,
            message: "First name must be at least 3 characters",
        },
    },

    lastName: {
        required: "Last name is required",
        minLength: {
            value: 2,
            message: "Last name must be at least 2 characters",
        },
    },

    username: {
        required: "Username is required",
        minLength: {
            value: 3,
            message: "Username must be at least 3 characters",
        },
    },

    email: {
        required: "Email is required",
        pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email address",
        },
    },

    mobileNo: {
        required: "Mobile number is required",
        pattern: {
            value: /^[6-9]\d{9}$/,
            message: "Enter a valid 10-digit mobile number",
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

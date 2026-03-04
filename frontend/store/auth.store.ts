import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type UserProfile = {
    id: string;

    firstName: string;
    lastName: string;
    username: string;

    email: string;
    mobileNo: string;

    avatar: string | null;

    isEmailVerified: boolean;
    isMobileVerified: boolean;

    twoFactorAuthentication: boolean;

    isOnboarded: boolean;
    onBoardingStep: number;

    signupSource: "email" | "google" | "github" | "apple";

    lastLoginAt: string | null;

    createdAt: string;
    updatedAt: string;
};

type AuthState = {
    user: UserProfile | null;
    gateToken: string | null;
    context: SessionContext | null,
    isAuthenticated: boolean;
    isInitialized: boolean;
    setUser: (user: UserProfile) => void;
    setAuth: (payload: { gateToken: string, user?: UserProfile, context?: SessionContext }) => void;
    switchOrganisationContext: (payload: { context: SessionContext, gateToken: string }) => void;
    clearAuth: () => void;
    setInitialized: (value: boolean) => void;
};

export type OrganisationContext = {
    id: string;
    name: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST";
};

export type SessionContext = {
    mode: "ORG" | "PERSONAL";
    organisation: OrganisationContext | null;
};

const maskState = (state: AuthState) => ({
    ...state,
    gateToken: state.gateToken ? "••••••••" : null,
});

const isDev = process.env.NODE_ENV === "development";

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                gateToken: null,
                context: null,

                isAuthenticated: false,
                isInitialized: false,


                setUser: (user: UserProfile) => set({ user, isInitialized: true }),
                setAuth: ({ user, gateToken, context }) => set({ user, gateToken, isAuthenticated: true, context }),
                switchOrganisationContext: ({ context, gateToken }) => set({ context, gateToken }),
                clearAuth: () => set({ user: null, gateToken: null, isAuthenticated: false }),
                setInitialized: (value: boolean) => set({ isInitialized: value }),
            }),
            {
                name: "auth-store",
                storage: createJSONStorage(() => sessionStorage),
                partialize: (state) => ({
                    gateToken: state.gateToken,
                    isAuthenticated: state.isAuthenticated,
                    user: state.user,
                    context: state.context,
                }),
            }
        ),
        {
            name: "AuthStore",
            enabled: isDev,
            serialize: {
                replacer: (_key: string, value: unknown) => {
                    if (!isDev) return undefined;
                    if (typeof value === "string" && value.length > 20) {
                        return "••••••••";
                    }
                    return value;
                },
            },
            stateSanitizer: isDev ? maskState : undefined,
        }
    )
);
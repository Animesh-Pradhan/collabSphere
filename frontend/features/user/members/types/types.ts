import { BaseQueryParams } from "@/types/api";

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST";
export type MemberStatus = "ACTIVE" | "SUSPENDED" | "REMOVED" | "INACTIVE";

export type MemberUser = {
    id: string;

    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;

    avatar: string | null;
    username: string;

    isEmailVerified: boolean;
    isMobileVerified: boolean;

    lastLoginAt: string | null;
    signupSource: "email" | "google" | "github" | "apple";

    twoFactorAuthentication: boolean;

    isOnboarded: boolean;
    onBoardingStep: number;

    createdAt: string;
    updatedAt: string;
};

export type OrganisationMember = {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST";
    status: "ACTIVE" | "SUSPENDED" | "REMOVED";
    joinedAt: string;

    user: MemberUser;
};

export type OrgMembersPayload = {
    members: OrganisationMember[];
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export type GetOrgMembersParams = BaseQueryParams & {
    role?: MemberRole | null;
    status?: MemberStatus | null;
};

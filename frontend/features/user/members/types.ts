export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST";
export type MemberStatus = "ACTIVE" | "SUSPENDED" | "REMOVED" | "INACTIVE";

export type OrganisationMember = {
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

export type OrgMembersPayload = {
    members: OrganisationMember[];
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};


export type GetOrgMembersParams = {
    page: number;
    limit: number;
    search?: string;
    role?: MemberRole | null;
    status?: MemberStatus | null;
    fromDate?: string | null;
    toDate?: string | null;
    sortBy?: string;
    order?: "asc" | "desc";
};

import { BaseQueryParams } from "@/types/api";

export enum InviteStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export type GetOrgInvitationsParams = BaseQueryParams & {
    status?: InviteStatus | null;
};


export type InvitationUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
};

export type InvitationOrganisation = {
    id: string;
    name: string;
};

export type OrganisationInvitation = {
    id: string;
    organisationId: string;

    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "MANAGER" | "GUEST";

    tokenHash: string;

    status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

    expiresAt: string;
    invitedBy: string;

    invitedAt: string;
    acceptedAt: string | null;

    organisation: InvitationOrganisation;
    invitedUser: InvitationUser;
};

export type OrgInvitationsPayload = {
    invitations: OrganisationInvitation[];
    meta: {
        totalItems: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};
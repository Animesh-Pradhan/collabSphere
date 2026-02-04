import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WorkspaceMemberBridgeService {
    constructor(private readonly prisma: PrismaService) { }

    async activatePendingWorkspaceInvites(userId: string, email: string) {
        const pendingInvitations = await this.prisma.workspaceMember.findMany({
            where: { externalId: email, status: "PENDING", removedAt: null }
        });

        if (pendingInvitations.length === 0) return;

        await this.prisma.workspaceMember.updateMany({
            where: { externalId: email, status: "PENDING" },
            data: { userId, externalId: null, status: "ACTIVE", joinedAt: new Date(), lastActiveAt: new Date() }
        })
    }

}
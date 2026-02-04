import type { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const user = request.user;
        if (!user) return false;

        if (user.role === 'SUPER_ADMIN') {
            return true;
        }

        const workspaceId = request.params.id;
        if (!workspaceId) return false;

        const isOwner = await this.prisma.workspace.findFirst({
            where: { id: workspaceId, ownerId: user.sub, deletedAt: null },
            select: { id: true }
        });
        if (isOwner) return true;

        const isMember = await this.prisma.workspaceMember.findFirst({
            where: { workspaceId, userId: user.sub, status: 'ACTIVE', removedAt: null },
            select: { id: true },
        });
        return !!isMember;
    }
}
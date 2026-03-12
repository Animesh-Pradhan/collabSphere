import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";

export async function validateWorkspaceMember(tx: Prisma.TransactionClient, workspaceId: string, workspaceMemberId: string) {
    const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
    });
    if (!member) throw new ForbiddenException("You are not an active member of this workspace");
    return member;
}
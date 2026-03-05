import { Injectable } from "@nestjs/common";
import { Prisma, DocumentActivity } from "generated/prisma/client";
import { DocumentActivityType } from "generated/prisma/enums";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class DocumentActivityService {
    constructor(private readonly prisma: PrismaService) { }

    async log(tx: Prisma.TransactionClient, data: {
        workspaceId: string;
        documentId: string;
        workspaceMemberId: string;
        type: DocumentActivityType;
        documentVersionId?: string;
        commentId?: string;
        metadata?: any;
    }): Promise<DocumentActivity> {
        const activity = await tx.documentActivity.create({
            data: {
                workspaceId: data.workspaceId,
                documentId: data.documentId,
                workspaceMemberId: data.workspaceMemberId,
                type: data.type,
                documentVersionId: data.documentVersionId ?? null,
                commentId: data.commentId ?? null,
                metadata: data.metadata ?? null
            }
        });
        return activity;
    }

    async getActivities(workspaceId: string, workspaceMemberId: string, documentId: string, page: number = 1, limit: number = 20) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, workspaceId, deletedAt: null },
            select: { id: true }
        });
        if (!document) throw new Error("Document not found");

        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            this.prisma.documentActivity.findMany({
                where: { workspaceId, documentId },
                include: {
                    workspaceMember: {
                        select: {
                            id: true, role: true, user: {
                                select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),

            this.prisma.documentActivity.count({
                where: { workspaceId, documentId }
            })
        ]);

        return { activities, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
}
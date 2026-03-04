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
}
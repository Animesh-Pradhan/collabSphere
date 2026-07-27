import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { DocumentActivityService } from "../document-activity.service";

@Injectable()
export class DocumentFavoriteService {
    constructor(private readonly prisma: PrismaService, private readonly documentActivity: DocumentActivityService) { }

    async addFavorite(workspaceId: string, workspaceMemberId: string, documentId: string) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, workspaceId, deletedAt: null },
            select: { id: true, currentVersion: true, status: true, workspace: { select: { organisationId: true, ownerId: true } } },
        });
        if (!document) throw new NotFoundException("Document not found");

        const favorite = await this.prisma.documentFavorite.upsert({
            where: {
                documentId_workspaceMemberId: { documentId, workspaceMemberId }
            },
            update: {},
            create: { documentId, workspaceMemberId }
        })

        await this.documentActivity.log(this.prisma, { workspaceId, documentId, workspaceMemberId, type: "FAVORITED", metadata: { favorite: true } })
        return favorite;
    }

    async removeFavorite(workspaceId: string, workspaceMemberId: string, documentId: string) {
        const favorite = await this.prisma.documentFavorite.findUnique({
            where: { documentId_workspaceMemberId: { documentId, workspaceMemberId } }
        })
        if (!favorite) throw new NotFoundException("Favorite not found.");

        await this.prisma.documentFavorite.delete({ where: { id: favorite.id } });
        await this.documentActivity.log(this.prisma, { workspaceId, documentId, workspaceMemberId, type: "UNFAVORITED", metadata: { favorite: false } });
        return true;
    }
}
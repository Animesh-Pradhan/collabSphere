import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentActivityService } from '../document-activity.service';
import { validateWorkspaceMember } from 'src/common/validators/workspace-member.validator';
import { StorageService } from 'src/storage/storage.service';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { StoragePathHelper } from 'src/storage/storage-path.helper';

@Injectable()
export class DocumentAttachmentService {
    constructor(private readonly prisma: PrismaService, private readonly documentActivity: DocumentActivityService, private readonly storage: StorageService, private readonly logger: MyLoggerService) { }

    async uploadAttachment(workspaceId: string, workspaceMemberId: string, documentId: string, file: Express.Multer.File) {
        return this.prisma.$transaction(async (tx) => {
            if (!file) throw new BadRequestException("No file uploaded");

            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) {
                throw new ForbiddenException("Insufficient permission to upload attachment");
            }

            const workspace = await tx.workspace.findUnique({
                where: { id: workspaceId },
                select: { usedStorage: true, writeQuota: true },
            });
            if (!workspace) throw new NotFoundException("Workspace not found.");
            if (workspace.writeQuota !== null && workspace.usedStorage + BigInt(file.size) > BigInt(workspace.writeQuota)) {
                throw new ForbiddenException("Workspace storage quota exceeded.");
            }

            const document = await tx.document.findFirst({
                where: { id: documentId, workspaceId, deletedAt: null },
                select: { id: true, currentVersion: true, status: true, workspace: { select: { organisationId: true, ownerId: true } } },
            });
            if (!document) throw new NotFoundException("Document not found");
            if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be updated");

            const folder = StoragePathHelper.documentAttachments(
                workspaceId, documentId,
                {
                    organisationId: document.workspace.organisationId,
                    userId: document.workspace.ownerId,
                },
            );
            const uploadedFile = await this.storage.upload(file, folder);
            const attachment = await tx.documentAttachment.create({
                data: {
                    documentId,
                    workspaceMemberId,
                    fileKey: uploadedFile.fileKey,
                    storageProvider: uploadedFile.storageProvider,
                    fileName: file.originalname,
                    fileType: file.mimetype,
                    fileSize: file.size,
                }
            });

            await tx.workspace.update({
                where: { id: workspaceId },
                data: { usedStorage: { increment: file.size } },
            });
            await this.documentActivity.log(tx, {
                workspaceId, documentId, workspaceMemberId, type: "ATTACHMENT_ADDED",
                metadata: { attachmentId: attachment.id, fileName: attachment.fileName, fileKey: attachment.fileKey }
            });

            return attachment;
        });
    }

    async getAttachments(workspaceId: string, documentId: string, page: number = 1, limit: number = 20) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, workspaceId, deletedAt: null },
            select: { id: true }
        });
        if (!document) throw new NotFoundException("Document not found");
        const skip = (page - 1) * limit;

        const [attachments, total] = await Promise.all([
            this.prisma.documentAttachment.findMany({
                where: { documentId, deletedAt: null },
                include: {
                    workspaceMember: {
                        select: {
                            id: true, role: true, user: {
                                select: { id: true, firstName: true, lastName: true, avatar: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            this.prisma.documentAttachment.count({ where: { documentId, deletedAt: null } }),
        ]);

        const items = await Promise.all(attachments.map(async (attachment) => ({
            ...attachment,
            url: await this.storage.getUrl(attachment.fileKey, attachment.storageProvider),
        })));

        return { attachments: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async deleteAttachment(workspaceId: string, workspaceMemberId: string, documentId: string, attachmentId: string) {
        const attachment = await this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);

            const document = await tx.document.findFirst({
                where: { id: documentId, workspaceId, deletedAt: null },
                select: { id: true, status: true }
            });
            if (!document) throw new NotFoundException("Document not found");
            if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be updated");

            const attachment = await tx.documentAttachment.findFirst({
                where: { id: attachmentId, documentId, deletedAt: null }
            });
            if (!attachment) throw new NotFoundException("Attachment not found");

            if (member.role !== "OWNER" && attachment.workspaceMemberId !== workspaceMemberId) {
                throw new ForbiddenException("You can only delete your own attachment");
            }

            await tx.documentAttachment.update({
                where: { id: attachment.id },
                data: { deletedAt: new Date() },
            });

            await this.documentActivity.log(tx, {
                workspaceId, documentId, workspaceMemberId, type: "ATTACHMENT_REMOVED", metadata: { attachmentId: attachment.id, fileName: attachment.fileName },
            });
            return attachment;
        });

        try {
            await this.storage.delete(attachment.fileKey, attachment.storageProvider);
        } catch (error) {
            this.logger.error(
                `Failed to delete attachment file "${attachment.fileKey}" (Attachment: ${attachment.id}, Document: ${documentId})`,
                error instanceof Error ? error.stack : undefined,
                DocumentAttachmentService.name,
            );
        }

        await this.prisma.workspace.update({
            where: { id: workspaceId },
            data: { usedStorage: { decrement: attachment.fileSize ?? 0, } },
        });
        return {
            message: "Attachment deleted successfully.",
        };
    }
}
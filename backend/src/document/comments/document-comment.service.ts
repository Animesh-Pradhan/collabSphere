import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateDocumentCommentDto } from "./dto/create-document-comment.dto";
import { DocumentActivityService } from "../document-activity.service";


@Injectable()
export class DocumentCommentService {
    constructor(private readonly prisma: PrismaService, private readonly documentActivity: DocumentActivityService) { }

    async createComment(workspaceId: string, workspaceMemberId: string, documentId: string, commentData: CreateDocumentCommentDto) {
        return this.prisma.$transaction(async (tx) => {
            const member = await tx.workspaceMember.findFirst({
                where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
                select: { role: true }
            })
            if (!member) throw new ForbiddenException("You are not an active member of this workspace");
            if (!["OWNER", "EDITOR", "COMMENTER"].includes(member.role)) {
                throw new ForbiddenException("Insufficient permission to comment");
            }

            const document = await tx.document.findFirst({
                where: { id: documentId, workspaceId, deletedAt: null },
                select: { id: true, currentVersion: true, status: true }
            });
            if (!document) throw new NotFoundException("Document not found");
            if (document.status === "ARCHIVED") {
                throw new ConflictException("Archived document cannot be updated");
            }

            const version = await tx.documentVersion.findFirst({
                where: { documentId, version: document.currentVersion },
                select: { id: true }
            });
            if (!version) throw new NotFoundException("Version not found");

            if (commentData.parentId) {
                const parent = await tx.documentComment.findFirst({
                    where: { id: commentData.parentId, documentVersionId: version.id, parentId: null, deletedAt: null }
                });
                if (!parent) throw new NotFoundException("Invalid parent comment");

                if (parent.resolvedAt) {
                    await tx.documentComment.update({
                        where: { id: parent.id },
                        data: { resolvedAt: null }
                    });
                }
            }

            const newComment = await tx.documentComment.create({
                data: {
                    documentId,
                    documentVersionId: version.id,
                    workspaceMemberId: workspaceMemberId,
                    comment: commentData.comment,
                    blockId: commentData.blockId,
                    parentId: commentData.parentId ?? null
                }
            });
            await this.documentActivity.log(tx, {
                workspaceId, documentId, workspaceMemberId, type: "COMMENT_CREATED", documentVersionId: version.id, commentId: newComment.id,
                metadata: { isReply: !!commentData.parentId, blockId: commentData.blockId ?? null }
            })
            return newComment;
        });
    }

    async resolveComment(workspaceId: string, workspaceMemberId: string, documentId: string, commentId: string) {
        return this.prisma.$transaction(async (tx) => {
            const member = await tx.workspaceMember.findFirst({
                where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
                select: { role: true }
            })
            if (!member) throw new ForbiddenException("You are not an active member of this workspace");
            if (!["OWNER", "EDITOR"].includes(member.role)) {
                throw new ForbiddenException("Insufficient permission to comment");
            }

            const document = await tx.document.findFirst({
                where: { id: documentId, workspaceId, deletedAt: null },
                select: { id: true, currentVersion: true, status: true }
            });
            if (!document) throw new NotFoundException("Document not found");
            if (document.status === "ARCHIVED") {
                throw new ConflictException("Archived document cannot be updated");
            }

            const version = await tx.documentVersion.findFirst({
                where: { documentId, version: document.currentVersion },
                select: { id: true }
            });
            if (!version) throw new NotFoundException("Version not found");

            const comment = await tx.documentComment.findFirst({
                where: { id: commentId, documentVersionId: version.id, parentId: null, deletedAt: null }
            });
            if (!comment) throw new NotFoundException("Root comment not found");
            if (comment.resolvedAt) return comment;

            const update = await tx.documentComment.update({
                where: { id: commentId },
                data: { resolvedAt: new Date() }
            });
            await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "COMMENT_RESOLVED", documentVersionId: version.id, commentId: update.id });
            return update;
        });
    }

    async deleteComment(workspaceId: string, workspaceMemberId: string, documentId: string, commentId: string) {
        return this.prisma.$transaction(async (tx) => {
            const member = await tx.workspaceMember.findFirst({
                where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
                select: { role: true }
            })
            if (!member) throw new ForbiddenException("You are not an active member of this workspace");
            if (member.role === "VIEWER") {
                throw new ForbiddenException("Insufficient permission to delete comment");
            }

            const document = await tx.document.findFirst({
                where: { id: documentId, workspaceId, deletedAt: null },
                select: { id: true, currentVersion: true, status: true }
            });
            if (!document) throw new NotFoundException("Document not found");

            const version = await tx.documentVersion.findFirst({
                where: { documentId, version: document.currentVersion },
                select: { id: true }
            });
            if (!version) throw new NotFoundException("Version not found");

            const comment = await tx.documentComment.findFirst({
                where: { id: commentId, documentVersionId: version.id, deletedAt: null },
                select: { id: true, parentId: true, resolvedAt: true, workspaceMemberId: true }
            });
            if (!comment) throw new NotFoundException("Comment not found");

            if (member.role === "OWNER") {
                const deletedComment = await tx.documentComment.update({
                    where: { id: commentId },
                    data: { deletedAt: new Date() }
                });
                await this.documentActivity.log(tx, { workspaceId, workspaceMemberId, documentId, documentVersionId: version.id, type: "COMMENT_DELETED", commentId: deletedComment.id, metadata: { wasRoot: deletedComment.parentId === null } })
                return deletedComment;
            } else if (member.role === "EDITOR") {
                if (comment.workspaceMemberId === workspaceMemberId || comment.parentId !== null) {
                    const deletedComment = await tx.documentComment.update({
                        where: { id: commentId },
                        data: { deletedAt: new Date() }
                    })
                    await this.documentActivity.log(tx, { workspaceId, workspaceMemberId, documentId, documentVersionId: version.id, type: "COMMENT_DELETED", commentId: deletedComment.id, metadata: { wasRoot: deletedComment.parentId === null } })
                    return deletedComment;
                } else {
                    throw new ForbiddenException("Editor cannot delete root comment of others");
                }
            } else if (member.role === "COMMENTER") {
                if (comment.workspaceMemberId !== workspaceMemberId) throw new ForbiddenException("Cannot delete others' comments");
                if (comment.parentId === null && comment.resolvedAt) throw new ConflictException("Cannot delete resolved thread");

                const deletedComment = await tx.documentComment.update({
                    where: { id: commentId },
                    data: { deletedAt: new Date() }
                });
                await this.documentActivity.log(tx, { workspaceId, workspaceMemberId, documentId, documentVersionId: version.id, type: "COMMENT_DELETED", commentId: deletedComment.id, metadata: { wasRoot: deletedComment.parentId === null } })
                return deletedComment;
            }
        });
    }

    async getComments(documentId: string, workspaceId: string) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, workspaceId, deletedAt: null },
            select: { currentVersion: true }
        });
        if (!document) throw new NotFoundException("Document not found");

        const version = await this.prisma.documentVersion.findFirst({
            where: { documentId, version: document.currentVersion },
            select: { id: true }
        });
        if (!version) return [];

        return this.prisma.documentComment.findMany({
            where: { documentId: documentId, documentVersionId: version.id, parentId: null, deletedAt: null },
            include: {
                workspaceMember: {
                    select: {
                        id: true, role: true, user: {
                            select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                        }
                    }
                },

                replies: {
                    where: { deletedAt: null },
                    include: {
                        workspaceMember: {
                            select: {
                                id: true, role: true, user: {
                                    select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "asc" }
        });
    }

}
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) { }

  async create(workspaceId: string, workspaceMemberId: string, createDocumentDto: CreateDocumentDto) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to create document");

      const document = await tx.document.create({
        data: {
          workspaceId,
          title: createDocumentDto.title,
          description: createDocumentDto.description,
          metadata: createDocumentDto.metadata,
          createdBy: workspaceMemberId,
          currentVersion: 1
        }
      });

      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: 1,
          content: createDocumentDto.content,
          createdBy: workspaceMemberId,
        }
      });

      return document;
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.document.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(workspaceId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      include: {
        documentVersions: {
          where: { version: { equals: undefined } }
        }
      }
    });

    if (!document) throw new NotFoundException("Document not found.");

    return document;
  }

  async update(workspaceId: string, workspaceMemberId: string, documentId: string, updateDocumentDto: UpdateDocumentDto) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to update document");

      const document = await this.prisma.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null }
      });

      if (!document) throw new NotFoundException("Document not found.");

      if (document.lockedBy && document.lockedBy !== workspaceMemberId) {
        throw new ConflictException("Document is locked by another member");
      }
      if (document.status === "ARCHIVED") {
        throw new ConflictException("Archived document cannot be updated");
      }

      const nextVersion = document.currentVersion + 1;

      await tx.documentVersion.create({
        data: {
          documentId,
          version: nextVersion,
          content: updateDocumentDto.content,
          createdBy: workspaceMemberId
        }
      })

      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: {
          title: updateDocumentDto.title || document.title,
          description: updateDocumentDto.description || document.description,
          currentVersion: nextVersion,
          updatedBy: workspaceMemberId
        }
      })

      return updatedDocument;
    });
  }

  async remove(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to remove document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");

      const deleted = await tx.document.update({
        where: { id: documentId },
        data: { deletedAt: new Date(), updatedBy: workspaceMemberId }
      })

      return deleted;
    });
  }

  async lock(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to create document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");

      if (document.status === "ARCHIVED") {
        throw new ConflictException("Archived document cannot be locked");
      }

      if (document.lockedBy && document.lockedBy !== workspaceMemberId) {
        throw new ConflictException("Document is already locked by another member");
      }

      return await tx.document.update({
        where: { id: documentId },
        data: {
          lockedBy: workspaceMemberId,
          lockedAt: new Date(),
        },
      });

    })
  }

  async unlock(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");

      if (document.lockedBy !== workspaceMemberId && member.role !== "OWNER") {
        throw new ForbiddenException("You cannot unlock this document");
      }

      return await tx.document.update({
        where: { id: documentId },
        data: {
          lockedBy: null,
          lockedAt: null,
        },
      });
    })
  }

  async publish(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true }
      })

      if (!member) throw new ForbiddenException("You are not an active member of this workspace");
      if (member.role !== "OWNER") throw new ForbiddenException("Insufficient permission to publish document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be published");
      if (document.status === "PUBLISHED") throw new ConflictException("Document already published");

      return tx.document.update({
        where: { id: documentId },
        data: { status: "PUBLISHED", publishedAt: new Date(), updatedBy: workspaceMemberId }
      })
    });
  }

  async archive(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true },
      });

      if (!member) throw new ForbiddenException("You are not an active member");
      if (member.role !== "OWNER") throw new ForbiddenException("Only owner can archive document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status === "ARCHIVED") throw new ConflictException("Document already archived");

      return await tx.document.update({
        where: { id: documentId },
        data: { status: "ARCHIVED", updatedBy: workspaceMemberId },
      });
    });
  }

  async restore(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.workspaceMember.findFirst({
        where: { id: workspaceMemberId, workspaceId, status: "ACTIVE" },
        select: { role: true },
      });

      if (!member) throw new ForbiddenException("You are not an active member");
      if (member.role !== "OWNER") throw new ForbiddenException("Only owner can archive document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status !== "ARCHIVED") throw new ConflictException("Only archived documents can be restored");

      return await tx.document.update({
        where: { id: documentId },
        data: { status: "DRAFT", updatedBy: workspaceMemberId },
      });
    });
  }
}

import { Prisma } from 'generated/prisma/client';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentActivityService } from './document-activity.service';
import { validateWorkspaceMember } from 'src/common/validators/workspace-member.validator';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService, private readonly documentActivity: DocumentActivityService) { }

  async create(workspaceId: string, workspaceMemberId: string, createDocumentDto: CreateDocumentDto) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
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
      await this.documentActivity.log(tx, { workspaceId, workspaceMemberId, documentId: document.id, type: "DOCUMENT_CREATED", documentVersionId: undefined, metadata: { version: 1, title: document.title } })
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
    });

    if (!document) throw new NotFoundException("Document not found.");

    const version = await this.prisma.documentVersion.findFirst({
      where: { documentId, version: document.currentVersion }
    });

    return { ...document, content: version?.content };
  }

  async update(workspaceId: string, workspaceMemberId: string, documentId: string, updateDocumentDto: UpdateDocumentDto) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
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

      const newVersion = await tx.documentVersion.create({
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
      await this.documentActivity.log(tx, {
        workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", documentVersionId: newVersion.id,
        metadata: { version: nextVersion, titleChanged: updateDocumentDto.title !== undefined, descriptionChanged: updateDocumentDto.description !== undefined }
      });
      return updatedDocument;
    });
  }

  async remove(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
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
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
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

      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          lockedBy: workspaceMemberId,
          lockedAt: new Date(),
        },
      });
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", metadata: { action: "LOCKED" } });
      return updated;
    })
  }

  async unlock(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");

      if (document.lockedBy !== workspaceMemberId && member.role !== "OWNER") {
        throw new ForbiddenException("You cannot unlock this document");
      }

      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          lockedBy: null,
          lockedAt: null,
        },
      });
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", metadata: { action: "UNLOCKED" } });
      return updated;
    })
  }

  async publish(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (member.role !== "OWNER") throw new ForbiddenException("Insufficient permission to publish document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be published");
      if (document.status === "PUBLISHED") throw new ConflictException("Document already published");

      const updated = await tx.document.update({
        where: { id: documentId },
        data: { status: "PUBLISHED", publishedAt: new Date(), updatedBy: workspaceMemberId }
      })
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_PUBLISHED" });
      return updated;
    });
  }

  async archive(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (member.role !== "OWNER") throw new ForbiddenException("Only owner can archive document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status === "ARCHIVED") throw new ConflictException("Document already archived");

      const updated = await tx.document.update({
        where: { id: documentId },
        data: { status: "ARCHIVED", updatedBy: workspaceMemberId },
      });
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_ARCHIVED" });
      return updated;
    });
  }

  async restore(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (member.role !== "OWNER") throw new ForbiddenException("Only owner can archive document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status !== "ARCHIVED") throw new ConflictException("Only archived documents can be restored");

      const updated = await tx.document.update({
        where: { id: documentId },
        data: { status: "DRAFT", updatedBy: workspaceMemberId },
      });
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", metadata: { action: "RESTORED" } });
      return updated;
    });
  }

  async getVersions(workspaceId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      select: { id: true }
    })

    if (!document) throw new NotFoundException("Document not found");

    return this.prisma.documentVersion.findMany({
      where: { documentId: documentId },
      select: { version: true, createdAt: true, createdBy: true, id: true },
      orderBy: { version: 'desc' }
    })
  }

  async getVersionByNumber(workspaceId: string, documentId: string, version: number) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      select: { id: true }
    })
    if (!document) throw new NotFoundException("Document not found");

    const versionData = await this.prisma.documentVersion.findFirst({
      where: { documentId: documentId, version }
    })
    if (!versionData) throw new NotFoundException("Document version not found");
    return versionData;
  }

  async rollbackToVersion(workspaceId: string, workspaceMemberId: string, documentId: string, versionNumber: number) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to rollback document");

      const document = await tx.document.findFirst({ where: { id: documentId, workspaceId, deletedAt: null } });
      if (!document) throw new NotFoundException("Document not found");
      if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be rollback");
      if (document.lockedBy && document.lockedBy !== workspaceMemberId) throw new ConflictException("Document is already locked by another member");

      const targetVersion = await tx.documentVersion.findFirst({
        where: { documentId, version: versionNumber },
      });
      if (!targetVersion) throw new NotFoundException("Target version not found");
      if (versionNumber === document.currentVersion) throw new ConflictException("Cannot rollback to the current version");
      if (versionNumber > document.currentVersion) throw new ConflictException("Invalid version number");

      const nextVersion = document.currentVersion + 1;
      const newVersion = await tx.documentVersion.create({
        data: { documentId, version: nextVersion, content: targetVersion.content as Prisma.InputJsonValue, createdBy: workspaceMemberId }
      })

      const updated = tx.document.update({
        where: { id: documentId },
        data: { currentVersion: nextVersion, updatedBy: workspaceMemberId },
      });
      await this.documentActivity.log(tx, {
        workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_ROLLED_BACK", documentVersionId: newVersion.id,
        metadata: { fromVersion: document.currentVersion, toVersion: versionNumber, newVersion: nextVersion }
      });
      return updated;
    })
  }
}

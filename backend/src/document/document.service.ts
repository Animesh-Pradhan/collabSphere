import z from 'zod';
import { Prisma } from 'generated/prisma/client';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DocumentActivityService } from './document-activity.service';
import { validateWorkspaceMember } from 'src/common/validators/workspace-member.validator';
import { FindAllDocumentsQueryDto } from './dto/helper.dto';
import { buildDateRangeCondition, buildSearchCondition, buildSortCondition, executePaginatedQuery } from 'src/utils/query.helper';
import { documentContentSchema } from 'src/common/schemas/document-content.schema';
import { DocumentContent } from './types';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService, private readonly documentActivity: DocumentActivityService) { }

  async create(workspaceId: string, workspaceMemberId: string, createDocumentDto: CreateDocumentDto) {
    const result = documentContentSchema.safeParse(createDocumentDto.content);
    if (!result.success) throw new BadRequestException(z.flattenError(result.error));

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
          content: createDocumentDto.content as unknown as Prisma.InputJsonValue,
          createdBy: workspaceMemberId,
        }
      });
      await this.documentActivity.log(tx, { workspaceId, workspaceMemberId, documentId: document.id, type: "DOCUMENT_CREATED", documentVersionId: undefined, metadata: { version: 1, title: document.title } })
      return document;
    });
  }

  async findAll(workspaceId: string, workspaceMemberId: string, query: FindAllDocumentsQueryDto) {
    let orderBy: any = {};
    const sortOrder = query.order || "desc";

    const DOCUMENT_SORT_FIELDS = new Set(["title", "status", "currentVersion", "createdAt", "updatedAt", "publishedAt"]);
    const MEMBER_SORT_FIELDS = new Set(["firstName", "lastName"]);
    if (DOCUMENT_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, DOCUMENT_SORT_FIELDS, "updatedAt");
    } else {
      const creatorSort = buildSortCondition(query.sortBy, sortOrder, MEMBER_SORT_FIELDS, "firstName");
      orderBy = { createdMember: { user: creatorSort } };
    }

    const where: Prisma.DocumentWhereInput = {
      workspaceId,
      deletedAt: null,

      AND: [
        ...(query.favorite ? [{ documentFavorites: { some: { workspaceMemberId } } }] : []),
        ...(query.status ? [{ status: query.status }] : []),
        ...(query.locked !== undefined ? [query.locked ? { lockedBy: { not: null } } : { lockedBy: null }] : []),
        ...(query.search ? [{
          OR: [
            buildSearchCondition(query.search, ["title", "description"]),
            {
              createdMember: { user: buildSearchCondition(query.search, ["firstName", "lastName", "email"]) },
            },
          ],
        }] : []),
        ...(query.fromDate || query.toDate ? [buildDateRangeCondition(query.fromDate, query.toDate, "createdAt")] : []),
      ],
    };

    return executePaginatedQuery({
      model: this.prisma.document,
      prismaQuery: {
        where,
        include: {
          createdMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
              },
            },
          },

          updatedMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },

          lockedMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },

          documentFavorites: {
            where: { workspaceMemberId },
            select: { id: true },
          },

          _count: { select: { documentComments: true, documentVersions: true } },
        },
        orderBy,
      },

      page: query.page,
      limit: query.limit,
      all: query.all,
    });
  }

  async findRecent(workspaceId: string, workspaceMemberId: string, query: FindAllDocumentsQueryDto) {
    const recentActivities = await this.prisma.documentActivity.findMany({
      where: { workspaceId, workspaceMemberId },
      distinct: ["documentId"],
      orderBy: [{ documentId: "asc" }, { createdAt: "desc" }],
      select: { documentId: true },
    });

    const documentIds = recentActivities.map((a) => a.documentId);
    if (!documentIds.length) {
      return { data: [], meta: { total: 0, page: query.page, limit: query.limit, totalPages: 0 } };
    }

    let orderBy: any = {};
    const sortOrder = query.order || "desc";

    const DOCUMENT_SORT_FIELDS = new Set(["title", "status", "currentVersion", "createdAt", "updatedAt", "publishedAt"]);
    const MEMBER_SORT_FIELDS = new Set(["firstName", "lastName"]);
    if (DOCUMENT_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, DOCUMENT_SORT_FIELDS, "updatedAt");
    } else {
      const creatorSort = buildSortCondition(query.sortBy, sortOrder, MEMBER_SORT_FIELDS, "firstName");
      orderBy = { createdMember: { user: creatorSort } };
    }

    const where: Prisma.DocumentWhereInput = {
      id: { in: documentIds },
      workspaceId,
      deletedAt: null,

      AND: [
        ...(query.favorite ? [{ documentFavorites: { some: { workspaceMemberId } } }] : []),
        ...(query.status ? [{ status: query.status }] : []),
        ...(query.locked !== undefined ? [query.locked ? { lockedBy: { not: null } } : { lockedBy: null }] : []),
        ...(query.search ? [{
          OR: [
            buildSearchCondition(query.search, ["title", "description"]),
            {
              createdMember: { user: buildSearchCondition(query.search, ["firstName", "lastName", "email"]) },
            },
          ],
        }] : []),
        ...(query.fromDate || query.toDate ? [buildDateRangeCondition(query.fromDate, query.toDate, "createdAt")] : []),
      ],
    };

    return executePaginatedQuery({
      model: this.prisma.document,
      prismaQuery: {
        where,
        include: {
          createdMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
              },
            },
          },

          updatedMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },

          lockedMember: {
            select: {
              id: true, role: true, user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },

          documentFavorites: {
            where: { workspaceMemberId },
            select: { id: true },
          },

          _count: { select: { documentComments: true, documentVersions: true } },
        },
        orderBy,
      },

      page: query.page,
      limit: query.limit,
      all: query.all,
    });
  }

  async findOne(workspaceId: string, workspaceMemberId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      include: { documentFavorites: { where: { workspaceMemberId }, select: { id: true } } }
    });
    if (!document) throw new NotFoundException("Document not found.");

    const version = await this.prisma.documentVersion.findFirst({
      where: { documentId, version: document.currentVersion }
    });

    const { documentFavorites, ...rest } = document;
    return {
      ...rest,
      content: document.draftContent ?? version?.content,
      hasDraft: document.draftContent !== null,
      isFavorite: documentFavorites.length > 0,
    };
  }

  async exportHtml(workspaceId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      select: { id: true },
    });
    if (!document) throw new NotFoundException("Document not found");
    throw new NotImplementedException("HTML export will be available after editor integration.");
  }

  async exportMarkdown(workspaceId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      select: { id: true },
    });
    if (!document) throw new NotFoundException("Document not found");
    throw new NotImplementedException("Markdown export will be available after editor integration.");
  }

  async update(workspaceId: string, workspaceMemberId: string, documentId: string, updateDocumentDto: UpdateDocumentDto) {
    const result = documentContentSchema.safeParse(updateDocumentDto.content);
    if (!result.success) throw new BadRequestException(z.flattenError(result.error));

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

      const updateData: Prisma.DocumentUncheckedUpdateInput = { updatedBy: workspaceMemberId };
      if (updateDocumentDto.title !== undefined) updateData.title = updateDocumentDto.title;
      if (updateDocumentDto.description !== undefined) updateData.description = updateDocumentDto.description;

      if (updateDocumentDto.content) {
        const nextVersion = document.currentVersion + 1;
        const newVersion = await tx.documentVersion.create({
          data: {
            documentId,
            version: nextVersion,
            content: updateDocumentDto.content,
            createdBy: workspaceMemberId
          }
        })
        updateData.currentVersion = nextVersion;
        updateData.draftContent = Prisma.JsonNull;
        updateData.draftUpdatedAt = null;

        await this.documentActivity.log(tx, {
          workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", documentVersionId: newVersion.id,
          metadata: { version: nextVersion, titleChanged: updateDocumentDto.title !== undefined, descriptionChanged: updateDocumentDto.description !== undefined }
        });
      }

      const updatedDocument = await tx.document.update({
        where: { id: documentId },
        data: updateData
      });

      return updatedDocument;
    });
  }

  async autosave(workspaceId: string, workspaceMemberId: string, documentId: string, content: DocumentContent) {
    const result = documentContentSchema.safeParse(content);
    if (!result.success) throw new BadRequestException(z.flattenError(result.error));

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, workspaceId, deletedAt: null },
      select: { id: true, status: true, lockedBy: true }
    });
    if (!document) throw new NotFoundException("Document not found");
    if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be edited");
    if (document.lockedBy && document.lockedBy !== workspaceMemberId) {
      throw new ConflictException("Document is locked by another member");
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: { draftContent: content as unknown as Prisma.InputJsonValue, draftUpdatedAt: new Date() },
      select: { id: true, draftUpdatedAt: true }
    });
  }

  async createVersion(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to save version");

      const document = await tx.document.findFirst({ where: { id: documentId, workspaceId, deletedAt: null } });
      if (!document) throw new NotFoundException("Document not found.");
      if (document.status === "ARCHIVED") throw new ConflictException("Archived document cannot be updated");
      if (document.lockedBy && document.lockedBy !== workspaceMemberId) throw new ConflictException("Document is locked by another member");

      if (document.draftContent === null || document.draftContent === null) {
        throw new ConflictException("No draft changes to save");
      }

      const nextVersion = document.currentVersion + 1;
      const newVersion = await tx.documentVersion.create({
        data: {
          documentId,
          version: nextVersion,
          content: document.draftContent as Prisma.InputJsonValue,
          createdBy: workspaceMemberId
        }
      });

      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          currentVersion: nextVersion,
          updatedBy: workspaceMemberId,
          draftContent: Prisma.JsonNull,
          draftUpdatedAt: null
        }
      });

      await this.documentActivity.log(tx, {
        workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UPDATED", documentVersionId: newVersion.id,
        metadata: { version: nextVersion, manualSave: true }
      });

      return updated;
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
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_LOCKED", metadata: { action: "LOCKED" } });
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
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_UNLOCKED", metadata: { action: "UNLOCKED" } });
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
      if (member.role !== "OWNER") throw new ForbiddenException("Only owner can restore document");

      const document = await tx.document.findFirst({
        where: { id: documentId, workspaceId, deletedAt: null },
      });

      if (!document) throw new NotFoundException("Document not found");
      if (document.status !== "ARCHIVED") throw new ConflictException("Only archived documents can be restored");

      const updated = await tx.document.update({
        where: { id: documentId },
        data: { status: "DRAFT", updatedBy: workspaceMemberId },
      });
      await this.documentActivity.log(tx, { workspaceId, documentId, workspaceMemberId, type: "DOCUMENT_RESTORED", metadata: { action: "RESTORED" } });
      return updated;
    });
  }

  async duplicate(workspaceId: string, workspaceMemberId: string, documentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
      if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to create document");

      const document = await tx.document.findFirst({ where: { id: documentId, workspaceId, deletedAt: null } });
      if (!document) throw new NotFoundException("Document not found");

      const latestVersion = await tx.documentVersion.findUnique({
        where: { documentId_version: { documentId, version: document.currentVersion } },
      });
      if (!latestVersion) throw new NotFoundException("Document version not found.");


      const duplicatedDocument = await tx.document.create({
        data: {
          workspaceId,
          title: `${document.title} (Copy)`,
          description: document.description,
          status: "DRAFT",
          metadata: document.metadata ?? Prisma.JsonNull,
          aiContext: document.aiContext ?? Prisma.JsonNull,
          currentVersion: 1,
          createdBy: workspaceMemberId,
        },
      });

      const duplicatedVersion = await tx.documentVersion.create({
        data: {
          documentId: duplicatedDocument.id,
          version: 1,
          content: latestVersion.content ?? Prisma.JsonNull,
          createdBy: workspaceMemberId,
        },
      });

      await this.documentActivity.log(tx, {
        workspaceId, documentId: duplicatedDocument.id, workspaceMemberId, type: "DOCUMENT_CREATED",
        documentVersionId: duplicatedVersion.id,
        metadata: { duplicatedFrom: document.id },
      });

      return duplicatedDocument;
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

      const updated = await tx.document.update({
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

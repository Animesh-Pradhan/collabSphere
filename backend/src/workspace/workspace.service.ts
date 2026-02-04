import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceRole, WorkspaceType } from 'generated/prisma/enums';
import slugify from 'slugify';
import { AddWorkspaceMemberDto } from './dto/workspace-member.dto';

export enum WorkspaceMemberSource {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createWorkspaceDto: CreateWorkspaceDto, organisationId: string | null, ownerId: string, workspaceType: WorkspaceType) {
    if (organisationId && createWorkspaceDto.isDefault) {
      const existingDefault = await this.prisma.workspace.findFirst({
        where: { organisationId, isDefault: true, deletedAt: null },
      });
      if (existingDefault) {
        throw new BadRequestException('Default workspace already exists for this organisation');
      }
    }
    const baseSlug = slugify(createWorkspaceDto.name, { lower: true, strict: true, trim: true });
    let slug = baseSlug;
    let counter = 1;
    while (organisationId && (await this.prisma.workspace.findFirst({ where: { organisationId, slug } }))) {
      slug = `${baseSlug}-${counter++}`;
    }


    return this.prisma.workspace.create({
      data: {
        organisationId: organisationId ?? null,
        ownerId,
        type: workspaceType,
        slug,
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        isDefault: createWorkspaceDto.isDefault || false,
        workspaceMembers: {
          create: { userId: ownerId, role: 'OWNER' }
        }
      }
    });
  }

  async getMyWorkspaces(userId: string, organisationId: string | null) {
    return this.prisma.workspace.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: userId },
          organisationId ? { organisationId } : undefined
        ].filter(Boolean) as object[]
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findOne(workspaceId: string, userId: string, organisationId: string | null) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null }
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    const hasAccess = workspace.ownerId === userId || (organisationId && workspace.organisationId === organisationId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this workspace');
    }
    return workspace;
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, ownerId: string) {
    const workspace = await this.prisma.workspace.findFirst({ where: { id, deletedAt: null } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    if (workspace.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can update this workspace');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: { ...updateWorkspaceDto }
    })
  }

  async delete(id: string, ownerId: string) {
    const workspace = await this.prisma.workspace.findFirst({ where: { id, deletedAt: null } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    if (workspace.ownerId !== ownerId) {
      throw new ForbiddenException('Only the owner can delete this workspace');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived', }
    })
  }

  async addWorkspaceMember(userId: string, organisationId: string, addMemberDto: AddWorkspaceMemberDto) {
    if (!addMemberDto.userIds || addMemberDto.userIds.length === 0) throw new BadRequestException('UserIds must be provided');

    const workspace = await this.prisma.workspace.findFirst({
      where: { id: addMemberDto.workspaceId, deletedAt: null },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    const validUsers = await this.prisma.user.findMany({
      where: {
        id: { in: addMemberDto.userIds },
        membership: { some: { organisationId } }
      },
      select: { id: true }
    });
    if (validUsers.length === 0) throw new BadRequestException("No Valid users found from your Organisations.");

    const validUserIds = validUsers.map(u => u.id);

    const existingMembers = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: addMemberDto.workspaceId,
        userId: { in: validUserIds },
        removedAt: null,
      },
      select: { userId: true },
    });

    const existingIds = new Set(existingMembers.map(u => u.userId))
    const newMembers = validUserIds.filter(id => !existingIds.has(id)).map(id => ({ workspaceId: addMemberDto.workspaceId, userId: id, invitedBy: userId }));

    if (newMembers.length === 0) throw new BadRequestException('All users are already workspace members');
    return this.prisma.workspaceMember.createMany({ data: newMembers })
  }

  async addExternalWorkspaceMember(userId: string, organisationId: string, addMemberDto: AddWorkspaceMemberDto) {
    if (!addMemberDto.emails || addMemberDto.emails.length === 0) throw new BadRequestException('Emails must be provided');

    const workspace = await this.prisma.workspace.findFirst({
      where: { id: addMemberDto.workspaceId, deletedAt: null },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.ownerId !== userId) throw new ForbiddenException('Only workspace owner can invite external members');



    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: addMemberDto.emails } },
      select: { id: true, email: true }
    });
    const registeredEmail = new Set(existingUsers.map(u => u.email));
    const unRegisteredEmail = addMemberDto.emails.filter(email => !registeredEmail.has(email));

    const existingExternalMembers = existingUsers.length ? await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: addMemberDto.workspaceId,
        userId: { in: existingUsers.map(u => u.id) },
        removedAt: null,
      },
      select: { userId: true },
    }) : [];
    const existingUserIds = new Set(existingExternalMembers.map(m => m.userId));

    const orgMembers = existingUsers.length ? await this.prisma.organisationMember.findMany({
      where: { userId: { in: existingUsers.map(i => i.id) }, organisationId },
      select: { userId: true }
    }) : [];
    const internalUserIds = new Set(orgMembers.map(m => m.userId));

    const membersToCreate: any[] = [];

    for (const user of existingUsers) {
      if (!internalUserIds.has(user.id) && !existingUserIds.has(user.id)) {
        membersToCreate.push({
          workspaceId: addMemberDto.workspaceId, userId: user.id, status: "PENDING", invitedBy: userId, invitedAt: new Date(), source: 'external'
        })
      }
    }

    const existingEmailInvites = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId: addMemberDto.workspaceId,
        externalId: { in: unRegisteredEmail },
        removedAt: null,
      },
      select: { externalId: true },
    });
    const existingEmails = new Set(existingEmailInvites.map(i => i.externalId));

    for (const email of unRegisteredEmail) {
      if (!existingEmails.has(email)) {
        membersToCreate.push({
          workspaceId: addMemberDto.workspaceId, externalId: email, status: "PENDING", invitedBy: userId, invitedAt: new Date(), source: 'external'
        })
      }
    }
    if (membersToCreate.length === 0) throw new BadRequestException('No valid external users to invite');

    return this.prisma.workspaceMember.createMany({ data: membersToCreate, skipDuplicates: true });
  }

  async getWorkspaceMembers(workspaceId: string, viewerUserId: string, viewerRole: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === viewerUserId;
    const isSuperAdmin = viewerRole === 'SUPER_ADMIN';

    const memberWhere: any = { workspaceId, removedAt: null };
    if (!isOwner && !isSuperAdmin) {
      memberWhere.status = 'ACTIVE';
    }


    const members = await this.prisma.workspaceMember.findMany({
      where: memberWhere,
      select: {
        id: true, role: true, status: true, source: true, invitedAt: true, joinedAt: true, lastActiveAt: true, externalId: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true, mobileNo: true, username: true } },
      },
      orderBy: { createdAt: 'asc' }
    });
    return members;
  }

  async removeWorkspaceMember(workspaceId: string, ownerId: string, memberId: string) {
    if (memberId === ownerId) throw new BadRequestException('You cannot remove yourself');

    const checkOwnership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: ownerId, removedAt: null }
    })
    if (!checkOwnership || !['EDITOR', 'OWNER'].includes(checkOwnership.role)) throw new ForbiddenException('Only workspace owner or editor can remove members');

    const checkTargetMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: memberId, removedAt: null },
      select: { id: true, role: true, userId: true },
    })
    if (!checkTargetMember) throw new NotFoundException('Workspace member not found');
    if (checkTargetMember.role === 'OWNER') throw new BadRequestException('Owner cannot be removed');
    if (checkTargetMember.userId === ownerId) throw new BadRequestException('You cannot remove yourself');


    await this.prisma.workspaceMember.update({
      where: { id: checkTargetMember.id },
      data: { removedAt: new Date(), status: 'REMOVED' },
    });

    return { success: true };
  }

  async updateWorkspaceMemberRole(workspaceId: string, ownerId: string, memberId: string, newRole: WorkspaceRole) {
    const checkOwnership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: ownerId, removedAt: null }
    })
    if (!checkOwnership || !['EDITOR', 'OWNER'].includes(checkOwnership.role)) throw new ForbiddenException('Only workspace owner or editor can remove members');

    const checkTargetMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: memberId, removedAt: null },
      select: { id: true, role: true, userId: true },
    })
    if (!checkTargetMember) throw new NotFoundException('Workspace member not found');

    if (checkTargetMember.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: { workspaceId, role: 'OWNER', removedAt: null },
      });
      if (ownerCount <= 1) throw new BadRequestException('At least one OWNER must exist in workspace');
    }

    return this.prisma.workspaceMember.update({
      where: { id: checkTargetMember.id },
      data: { role: newRole },
    });
  }

  async leaveWorkspace(workspaceId: string, memberId: string) {
    const checkMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: memberId, removedAt: null },
      select: { id: true, role: true },
    })
    if (!checkMember) throw new NotFoundException('Not a member of this workspace');

    if (checkMember.role === 'OWNER') {
      const ownerCount = await this.prisma.workspaceMember.count({
        where: { workspaceId, role: 'OWNER', removedAt: null },
      });
      if (ownerCount <= 1) throw new BadRequestException('Add another OWNER before leaving workspace');
    }

    return this.prisma.workspaceMember.update({
      where: { id: checkMember.id },
      data: { removedAt: new Date(), status: 'LEFT' },
    });
  }
}

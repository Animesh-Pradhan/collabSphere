import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { WorkspaceMemberStatus, WorkspaceRole, WorkspaceType } from 'generated/prisma/enums';
import slugify from 'slugify';
import { AddWorkspaceMemberDto } from './dto/workspace-member.dto';
import { GetMyWorkspacesQueryDto, GetWorkspaceMembersQueryDto } from './dto/helper.dto';
import { buildDateRangeCondition, buildSearchCondition, buildSortCondition, executePaginatedQuery } from 'src/utils/query.helper';

export enum WorkspaceMemberSource {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

type WorkspaceRaw = {
  id: string;
  organisationId: string | null;
  ownerId: string;
  type: 'PERSONAL' | 'ORGANISATION';
  name: string;
  slug: string | null;
  description: string | null;
  isDefault: boolean;
  status: 'active' | 'archived' | 'locked';
  eventStreamKey: string | null;
  aiEnabled: boolean;
  aiContext: any;
  writeQuota: number | null;
  readQuota: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  archivedAt: Date | null;

  organisation: { id: string; name: string } | null;

  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
  };

  workspaceMembers: {
    id: string;
    role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REMOVED' | 'LEFT';
    joinedAt: Date;
    lastActiveAt: Date | null;
  }[];

  _count: {
    workspaceMembers: number;
    tasks: number;
    documents: number;
  };
};

type WorkspaceResponse = Omit<WorkspaceRaw, 'workspaceMembers' | '_count'> & {
  membership: WorkspaceRaw['workspaceMembers'][number] | null;
  counts: {
    members: number;
    tasks: number;
    documents: number;
  };
};

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

  private mapWorkspaceMembership<T extends WorkspaceRaw>(data: T[]): WorkspaceResponse[] {
    return data.map((workspace) => {
      const { _count, workspaceMembers, ...rest } = workspace;
      return {
        ...rest,
        membership: workspaceMembers[0] ?? null,
        counts: {
          members: _count.workspaceMembers,
          tasks: _count.tasks,
          documents: _count.documents,
        },
      };
    });
  }

  async getOrganisationWorkspaces(userId: string, organisationId: string, query: GetMyWorkspacesQueryDto) {
    const membership = await this.prisma.organisationMember.findFirst({
      where: { organisationId, userId, removedAt: null, status: "ACTIVE" },
      select: { id: true }
    });

    if (!membership) throw new ForbiddenException('Not part of organisation');

    let orderBy: any = {};
    const sortOrder = query.order || 'desc';

    const WORKSPACE_SORT_FIELDS = new Set(['name', 'status', 'type', 'createdAt', 'updatedAt']);
    const OWNER_SORT_FIELDS = new Set(['firstName', 'lastName']);

    if (WORKSPACE_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, WORKSPACE_SORT_FIELDS, 'createdAt');
    } else {
      const ownerSort = buildSortCondition(query.sortBy, sortOrder, OWNER_SORT_FIELDS, 'firstName');
      orderBy = { owner: ownerSort };
    }

    const where: any = {
      organisationId: organisationId,
      deletedAt: null,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...buildDateRangeCondition(query.fromDate, query.toDate, 'createdAt'),
      ...(query.search && {
        OR: [
          buildSearchCondition(query.search, ['name', 'description']),
          { owner: buildSearchCondition(query.search, ['firstName', 'lastName']) }
        ]
      })
    };

    const result = await executePaginatedQuery({
      model: this.prisma.workspace,
      prismaQuery: {
        where,
        include: {
          organisation: { select: { id: true, name: true } },
          owner: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          workspaceMembers: {
            where: { userId, removedAt: null },
            select: { id: true, role: true, status: true, joinedAt: true, lastActiveAt: true }
          },
          _count: { select: { workspaceMembers: true, tasks: true, documents: true } }
        },
        orderBy
      },
      page: query.page,
      limit: query.limit
    });

    return {
      ...result,
      data: this.mapWorkspaceMembership(result.data as WorkspaceRaw[])
    }
  }

  async getMyWorkspaces(userId: string, organisationId: string | null, query: GetMyWorkspacesQueryDto) {
    let orderBy: any = {};
    const sortOrder = query.order || 'desc';

    const WORKSPACE_SORT_FIELDS = new Set(['name', 'status', 'type', 'createdAt', 'updatedAt']);
    const OWNER_SORT_FIELDS = new Set(['firstName', 'lastName']);

    if (WORKSPACE_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, WORKSPACE_SORT_FIELDS, 'createdAt');
    } else {
      const ownerSort = buildSortCondition(query.sortBy, sortOrder, OWNER_SORT_FIELDS, 'firstName');
      orderBy = { owner: ownerSort };
    }

    const where: any = {
      deletedAt: null,
      AND: [
        {
          OR: [
            { ownerId: userId },
            { workspaceMembers: { some: { userId, removedAt: null } } }
          ]
        },
        ...(organisationId ? [{ organisationId }] : [{ organisationId: null }]),
        ...(query.type ? [query.type === 'PERSONAL' ? { organisationId: null } : { organisationId: { not: null } }] : []),
        ...(query.status ? [{ status: query.status }] : []),
        ...(query.search ? [{
          OR: [
            buildSearchCondition(query.search, ['name', 'description']),
            { owner: buildSearchCondition(query.search, ['firstName', 'lastName']) }
          ]
        }] : []),
        ...(query.fromDate || query.toDate ? [buildDateRangeCondition(query.fromDate, query.toDate, 'createdAt')] : [])
      ]
    };

    const result = await executePaginatedQuery({
      model: this.prisma.workspace,
      prismaQuery: {
        where,
        include: {
          organisation: { select: { id: true, name: true } },
          owner: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          workspaceMembers: {
            where: { userId, removedAt: null },
            select: { id: true, role: true, status: true, joinedAt: true, lastActiveAt: true }
          },
          _count: { select: { workspaceMembers: true, tasks: true, documents: true } }
        },
        orderBy
      },
      page: query.page,
      limit: query.limit
    });

    return {
      ...result,
      data: this.mapWorkspaceMembership(result.data as WorkspaceRaw[])
    };
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

  async getWorkspaceMembers(workspaceId: string, viewerUserId: string, viewerRole: string, query: GetWorkspaceMembersQueryDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true }
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const isOwner = workspace.ownerId === viewerUserId;
    const isSuperAdmin = viewerRole === 'SUPER_ADMIN';

    let orderBy: any = {};
    const sortOrder = query.order || "desc";

    const MEMBER_SORT_FIELDS = new Set(["role", "status", "source", "joinedAt", "lastActiveAt", "createdAt"]);
    const USER_SORT_FIELDS = new Set(["firstName", "lastName", "email", "username"]);

    if (MEMBER_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, MEMBER_SORT_FIELDS, "joinedAt");
    } else {
      const userSort = buildSortCondition(query.sortBy, sortOrder, USER_SORT_FIELDS, "firstName");
      orderBy = { user: userSort };
    }

    const where: any = {
      workspaceId,
      removedAt: null,
      ...(query.role && { role: query.role }),
      ...(query.source && { source: query.source }),
      ...buildDateRangeCondition(query.fromDate, query.toDate, "joinedAt"),
      ...(query.search && { user: buildSearchCondition(query.search, ["firstName", "lastName", "email", "username"]) })
    };

    if (!isOwner && !isSuperAdmin) {
      where.status = WorkspaceMemberStatus.ACTIVE;
    } else if (query.status) {
      where.status = query.status;
    }


    return executePaginatedQuery({
      model: this.prisma.workspaceMember,
      prismaQuery: {
        where,
        select: {
          id: true, role: true, status: true, source: true, invitedAt: true, joinedAt: true, lastActiveAt: true, externalId: true,
          user: {
            select: {
              id: true, email: true, firstName: true, lastName: true, avatar: true, mobileNo: true, username: true,
            },
          },
        },
        orderBy,
      },
      page: query.page,
      limit: query.limit,
    });
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

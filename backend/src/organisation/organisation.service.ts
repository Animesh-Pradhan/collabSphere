import * as crypto from 'crypto';

import { BadRequestException, ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { Role as PlatformRole } from "src/common/roles/roles.enum";
import { UploadService } from 'src/common/upload/upload.service';
import { GetOrgInvitationsQueryDto, InviteOrganisationMemberDto, UpdateOrgMemberDto } from './dto/other-helpert.dto';
import { MailService } from 'src/mail/mail.service';
import { AuthService, GatePayload } from 'src/auth/auth.service';
import { buildDateRangeCondition, buildSearchCondition, buildSortCondition, executePaginatedQuery } from 'src/utils/query.helper';

@Injectable()
export class OrganisationService {
  constructor(private readonly prisma: PrismaService, private readonly uploadService: UploadService, private readonly mailService: MailService, private readonly authService: AuthService) { }

  async create(userId: string, createOrganisationDto: CreateOrganisationDto, file?: Express.Multer.File) {
    const existing = await this.prisma.organisation.findUnique({ where: { slug: createOrganisationDto.slug } });
    if (existing) {
      throw new ConflictException('Organisation with this slug alreadt exists');
    }

    const logo = this.uploadService.resolveFilePath("ORGANISATION_LOGO", file);


    return this.prisma.organisation.create({
      data: {
        name: createOrganisationDto.name,
        slug: createOrganisationDto.slug,
        address: createOrganisationDto.address,
        country: createOrganisationDto.country,
        logo,
        members: {
          create: { userId, role: Role.OWNER }
        }
      },
      include: { members: true }
    })
  }

  findAll() {
    return this.prisma.organisation.findMany();
  }

  findAllById(userId: string) {
    return this.prisma.organisation.findMany({
      where: {
        members: { some: { userId } }
      },
      include: {
        members: {
          where: { userId },
          select: { role: true, lastActiveAt: true, status: true }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.organisation.findFirst({
      where: { id },
      include: {
        members: true
      }
    });
  }

  async update(id: string, userId: string, updateOrganisationDto: UpdateOrganisationDto, file?: Express.Multer.File) {
    const member = await this.prisma.organisationMember.findFirst({
      where: {
        organisationId: id,
        userId,
        status: 'ACTIVE',
        role: { in: ["OWNER", "MANAGER", "ADMIN"] }
      }
    })
    if (!member) {
      throw new ForbiddenException("You are not allowed to update this organisation")
    }

    const logo = this.uploadService.resolveUpdateFilePath("ORGANISATION_LOGO", file);
    return this.prisma.organisation.update({
      where: { id },
      data: { ...updateOrganisationDto, ...(logo !== undefined && { logo }) }
    })
  }

  async deleteOne(userId: string, userRole: string, organisationId: string) {
    const member = await this.prisma.organisationMember.findFirst({
      where: { organisationId, userId, status: 'ACTIVE', role: { in: ["ADMIN", "OWNER"] } }
    })

    if (userRole !== PlatformRole.SUPER_ADMIN as string && !member) {
      throw new ForbiddenException("You are not authorized to delete this organisation")
    }

    return this.prisma.organisation.delete({ where: { id: organisationId } });
  }

  async inviteMember(userId: string, organisationId: string, dto: InviteOrganisationMemberDto) {
    const inviter = await this.prisma.organisationMember.findFirst({
      where: {
        organisationId,
        userId,
        status: 'ACTIVE',
        role: { in: ["ADMIN", "MANAGER", "OWNER"] }
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        organisation: { select: { name: true } }
      }
    });
    if (!inviter) {
      throw new ForbiddenException('You are not allowed to invite members in this organisation');
    }

    const existingMember = await this.prisma.organisationMember.findFirst({ where: { organisationId, user: { email: dto.email } } });
    if (existingMember) {
      throw new ConflictException('User is already a member of this organisation');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const invite = await this.prisma.organisationInvite.create({
      data: {
        organisationId,
        email: dto.email,
        tokenHash,
        role: dto.role ?? Role.MEMBER,
        invitedBy: userId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    })
    const inviteLink = `${process.env.FRONTEND_URL}/auth/invite?token=${rawToken}`;

    const inviterName = inviter.user?.firstName || inviter.user?.lastName ? `${inviter.user?.firstName ?? ''} ${inviter.user?.lastName ?? ''}`.trim() : inviter.user?.email ?? 'A team member';
    const organisationName = inviter.organisation.name;
    try {
      await this.mailService.sendOrganisationInviteEmail(invite.email, {
        inviteLink: inviteLink,
        expiry: '48 hours',
        inviterName: inviterName,
        organisationName: organisationName,
      });
    } catch (err) {
      await this.prisma.organisationInvite.delete({ where: { id: invite.id } });
      throw err;
    }
  }

  async resendInvitation(userId: string, organisationId: string, inviteId: string) {
    const inviter = await this.prisma.organisationMember.findFirst({
      where: { organisationId, userId, status: 'ACTIVE', role: { in: ["ADMIN", "MANAGER", "OWNER"] } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        organisation: { select: { name: true } }
      }
    });
    if (!inviter) throw new ForbiddenException('You are not allowed to resend invites');

    const invite = await this.prisma.organisationInvite.findFirst({
      where: { id: inviteId, organisationId, status: 'PENDING' }
    });
    if (!invite) throw new NotFoundException('Invite not found or already used');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.organisationInvite.update({
      where: { id: invite.id },
      data: { tokenHash, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) }
    });

    const inviteLink = `${process.env.FRONTEND_URL}/auth/invite?token=${rawToken}`;

    const inviterName = inviter.user?.firstName || inviter.user?.lastName ? `${inviter.user?.firstName ?? ''} ${inviter.user?.lastName ?? ''}`.trim() : inviter.user?.email ?? 'A team member';
    const organisationName = inviter.organisation.name;

    await this.mailService.sendOrganisationInviteEmail(invite.email, {
      inviteLink: inviteLink,
      expiry: '48 hours',
      inviterName: inviterName,
      organisationName: organisationName
    });

    return invite;
  }

  async cancelInvite(userId: string, organisationId: string, inviteId: string) {
    const inviter = await this.prisma.organisationMember.findFirst({
      where: { organisationId, userId, status: 'ACTIVE', role: { in: ["ADMIN", "OWNER", "MANAGER"] } }
    });
    if (!inviter) throw new ForbiddenException('You are not allowed to cancel invites');

    const invite = await this.prisma.organisationInvite.findFirst({
      where: { id: inviteId, organisationId, status: 'PENDING' }
    });
    if (!invite) throw new NotFoundException('Invite not found or already processed');

    await this.prisma.organisationInvite.update({
      where: { id: invite.id },
      data: { status: 'REVOKED' }
    });

    return invite;
  }

  async previewInvite(token: string) {
    if (!token) {
      throw new BadRequestException('Invite token is required');
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const inviteData = await this.prisma.organisationInvite.findFirst({
      where: { tokenHash: tokenHash, status: "PENDING" },
      include: {
        organisation: { select: { name: true } }
      }
    })
    if (!inviteData) {
      throw new NotFoundException("Invalid or Expired Invite")
    }

    if (inviteData.expiresAt < new Date()) {
      await this.prisma.organisationInvite.update({
        where: { id: inviteData.id },
        data: { status: "EXPIRED" }
      })

      throw new GoneException("Invite has Expired")
    }

    return {
      email: inviteData.email,
      role: inviteData.role,
      organisationName: inviteData.organisation.name,
      expiresAt: inviteData.expiresAt
    }
  }

  async acceptInvite(userId: string, token: string, currentGateToken: string) {
    if (!token) {
      throw new BadRequestException('Invite token is required');
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const inviteData = await this.prisma.organisationInvite.findFirst({
      where: { tokenHash: tokenHash, status: "PENDING" },
      include: {
        organisation: { select: { name: true } }
      }
    })
    if (!inviteData) {
      throw new NotFoundException("Invalid or Expired Invite")
    }

    if (inviteData.expiresAt < new Date()) {
      await this.prisma.organisationInvite.update({
        where: { id: inviteData.id },
        data: { status: "EXPIRED" }
      })

      throw new GoneException("Invite has Expired")
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user || user.email.toLowerCase() !== inviteData.email.toLowerCase()) {
      throw new ForbiddenException('This invite does not belong to you');
    }

    await this.prisma.$transaction(async (tx) => {
      const existingMember = await tx.organisationMember.findFirst({
        where: { userId, organisationId: inviteData.organisationId },
        select: { id: true, removedAt: true },
      });

      if (existingMember) {
        await tx.organisationMember.update({
          where: { id: existingMember.id },
          data: { role: inviteData.role, status: "ACTIVE", removedAt: null, invitedBy: inviteData.invitedBy, invitedAt: inviteData.invitedAt },
        });
      } else {
        await tx.organisationMember.create({
          data: {
            userId,
            organisationId: inviteData.organisationId,
            role: inviteData.role,
            invitedBy: inviteData.invitedBy,
            invitedAt: inviteData.invitedAt,
          }
        })
      }

      await tx.organisationInvite.update({
        where: { id: inviteData.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() }
      })

      await tx.user.update({ where: { id: userId }, data: { lastActiveOrganisationId: inviteData.organisationId } });
    })

    const context = await this.authService.resolveContext(userId);
    const payload: GatePayload = {
      sub: userId,
      email: user.email,
      role: 'USER',
      ctx: {
        mode: context.mode as "PERSONAL" | "ORG",
        orgId: context.organisation?.id ?? null,
        orgRole: context.organisation?.role ?? null,
      },
    };

    const newGateToken = await this.authService.signGateToken(payload);
    await this.prisma.userSession.updateMany({
      where: { userId, gateToken: currentGateToken },
      data: { gateToken: newGateToken },
    });


    return {
      user: { id: user.id, email: user.email },
      gateToken: newGateToken,
      context: {
        mode: context.mode,
        organisation: context.organisation ? { id: context.organisation.id, role: context.organisation.role, } : null,
      },
    };
  }

  async findAllInvitations(userId: string, orgId: string, query: GetOrgInvitationsQueryDto) {
    const membership = await this.prisma.organisationMember.findFirst({
      where: { organisationId: orgId, userId, removedAt: null, status: "ACTIVE" },
      select: { id: true, role: true }
    });
    if (!membership) throw new ForbiddenException('Not part of this organisation');
    if (!['OWNER', 'ADMIN', 'MANAGER'].includes(membership.role)) throw new ForbiddenException('Insufficient permissions');

    let orderBy: any = {};
    const sortOrder = query.order || 'desc';

    const INVITATION_SORT_FIELDS = new Set(['email', 'status', 'expiresAt', 'role', "invitedAt", "acceptedAt"]);
    const ORG_SORT_FIELDS = new Set(['name']);
    const USER_SORT_FIELDS = new Set(['firstName', 'lastName']);

    if (INVITATION_SORT_FIELDS.has(query.sortBy)) {
      orderBy = buildSortCondition(query.sortBy, sortOrder, INVITATION_SORT_FIELDS, 'invitedAt');
    } else if (ORG_SORT_FIELDS.has(query.sortBy)) {
      const orgSort = buildSortCondition(query.sortBy, sortOrder, ORG_SORT_FIELDS, 'name');
      orderBy = { organisation: orgSort };
    } else {
      const userSort = buildSortCondition(query.sortBy, sortOrder, USER_SORT_FIELDS, 'firstName');
      orderBy = { invitedUser: userSort };
    }

    const where: any = {
      organisationId: orgId,
      ...(query.status && { status: query.status }),
      ...buildDateRangeCondition(query.fromDate, query.toDate, 'invitedAt'),
      ...(query.search && {
        OR: [
          buildSearchCondition(query.search, ['email']),
          { organisation: buildSearchCondition(query.search, ['name']) },
          { invitedUser: buildSearchCondition(query.search, ['firstName', 'lastName']) }
        ]
      })
    };

    return executePaginatedQuery({
      model: this.prisma.organisationInvite,
      prismaQuery: {
        where,
        include: {
          organisation: { select: { id: true, name: true } },
          invitedUser: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } }
        },
        orderBy
      },
      page: query.page,
      limit: query.limit
    });
  }

  async updateOrgMember(orgId: string, userId: string, memberId: string, payload: UpdateOrgMemberDto) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.organisationMember.findFirst({
        where: { organisationId: orgId, userId, removedAt: null, status: "ACTIVE" },
        select: { id: true, role: true },
      });
      if (!membership) throw new ForbiddenException("Not part of this organisation");
      if (!["OWNER", "ADMIN", "MANAGER"].includes(membership.role)) throw new ForbiddenException("Insufficient permissions");

      const target = await tx.organisationMember.findFirst({
        where: { id: memberId, organisationId: orgId, removedAt: null },
        select: { id: true, role: true },
      });
      if (!target) throw new NotFoundException("Member not found");
      if (target.role === "OWNER") throw new ForbiddenException("Cannot modify owner");
      if (membership.role === "MANAGER" && target.role === "ADMIN") throw new ForbiddenException("Managers cannot modify admins");

      const updated = await tx.organisationMember.update({
        where: { id: memberId },
        data: {
          ...(payload.role && { role: payload.role }),
          ...(payload.status && { status: payload.status }),
        },
      });

      return updated;
    });
  }

  async removeOrgMembers(orgId: string, userId: string, memberIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.organisationMember.findFirst({
        where: { organisationId: orgId, userId, removedAt: null, status: "ACTIVE" },
        select: { id: true, role: true },
      });
      if (!membership) throw new ForbiddenException("Not part of this organisation");
      if (!["OWNER", "ADMIN", "MANAGER"].includes(membership.role)) throw new ForbiddenException("Insufficient permissions");

      const targets = await tx.organisationMember.findMany({
        where: {
          id: { in: memberIds },
          organisationId: orgId,
          removedAt: null,
        },
        select: { id: true, role: true, userId: true },
      });
      if (!targets.length) throw new NotFoundException('No valid members found');

      for (const member of targets) {
        if (member.role === 'OWNER') throw new ForbiddenException('Cannot delete owner');
        if (member.userId === userId) throw new ForbiddenException('You cannot remove yourself');
      }

      const result = await tx.organisationMember.updateMany({
        where: { id: { in: targets.map((t) => t.id) } },
        data: { removedAt: new Date(), status: 'REMOVED' },
      });

      return { result, ids: targets.map((t) => t.id) }
    })
  }
}

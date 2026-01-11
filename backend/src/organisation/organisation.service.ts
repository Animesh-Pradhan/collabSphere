import * as crypto from 'crypto';

import { BadRequestException, ConflictException, ForbiddenException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';
import { Role as PlatformRole } from "src/common/roles/roles.enum";
import { UploadService } from 'src/common/upload/upload.service';
import { InviteOrganisationMemberDto } from './dto/other-helpert.dto';
import { MailService } from 'src/mail/mail.service';
import { AuthService, GatePayload } from 'src/auth/auth.service';

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
    const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${rawToken}`;

    const inviterName = inviter.user?.firstName || inviter.user?.lastName ? `${inviter.user?.firstName ?? ''} ${inviter.user?.lastName ?? ''}`.trim()
      : inviter.user?.email ?? 'A team member';
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
      await tx.organisationMember.create({
        data: {
          userId,
          organisationId: inviteData.organisationId,
          role: inviteData.role,
          invitedBy: inviteData.invitedBy,
          invitedAt: inviteData.invitedAt,
        }
      })

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
}

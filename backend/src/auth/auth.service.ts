import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';

export interface GatePayload {
    sub: string;
    email: string;
    role: string;
    ctx: {
        mode: 'PERSONAL' | 'ORG';
        orgId: string | null;
        orgRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST' | null;
    };
}

const DEVICE_ACTIVITY_WINDOW_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    async resolveContext(userId: string) {
        const memberships = await this.prisma.organisationMember.findMany({
            where: { userId, status: 'ACTIVE' },
            orderBy: { joinedAt: 'asc', },
            select: { organisationId: true, role: true },
        });

        if (memberships.length === 0) {
            return { mode: 'PERSONAL', organisation: null };
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { lastActiveOrganisationId: true },
        });

        const activeMembership = memberships.find(m => m.organisationId === user?.lastActiveOrganisationId) ?? memberships[0];
        if (user?.lastActiveOrganisationId !== activeMembership.organisationId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { lastActiveOrganisationId: activeMembership.organisationId },
            });
        }

        return { mode: 'ORG', organisation: { id: activeMembership.organisationId, role: activeMembership.role } };
    }

    async signGateToken(payload: GatePayload): Promise<string> {
        return await this.jwtService.signAsync(payload);
    }

    async verifyGateToken(token: string): Promise<GatePayload> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch (error) {
            Logger.error(error);
            throw new UnauthorizedException('Invalid gate token');
        }
    }

    generateVaultToken() {
        return randomBytes(48).toString('hex');
    }

    async createSession(gateToken: string, vaultToken: string, expiresAt: Date, userId: string, ipAddress?: string, userAgent?: string) {
        return this.prisma.userSession.create({
            data: { gateToken, vaultToken, expiresAt, ipAddress, userAgent: userAgent ?? null, userId: userId ?? null }
        })
    }

    async findSessionByGateToken(gateToken: string) {
        return this.prisma.userSession.findFirst({ where: { gateToken } })
    }

    async findSessionByVaultToken(vaultToken: string) {
        return this.prisma.userSession.findFirst({ where: { vaultToken } })
    }

    async deleteSessionByGateToken(gateToken: string) {
        return this.prisma.userSession.deleteMany({ where: { gateToken: gateToken } });
    }

    async deleteSessionByVaultToken(vaultToken: string) {
        return this.prisma.userSession.deleteMany({ where: { vaultToken: vaultToken } });
    }

    async refreshWithVaultToken(vaultToken: string) {
        const session = await this.findSessionByVaultToken(vaultToken);
        if (!session) throw new UnauthorizedException('Invalid session');
        if (new Date() > session.expiresAt) {
            await this.deleteSessionByVaultToken(vaultToken);
            throw new UnauthorizedException('Session expired');
        }

        const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const context = await this.resolveContext(user.id);
        const payload: GatePayload = {
            sub: user.id,
            email: user.email,
            role: "USER",
            ctx: {
                mode: context.mode,
                orgId: context.organisation?.id ?? null,
                orgRole: context.organisation?.role ?? null,
            },
        } as GatePayload;

        const newGateToken = await this.signGateToken(payload);
        const rotateVault = process.env.ROTATE_VAULT_ON_REFRESH === 'true';
        let newVaultToken;
        if (rotateVault) {
            newVaultToken = this.generateVaultToken();
            await this.prisma.userSession.update({
                where: { id: session.id },
                data: { gateToken: newGateToken, vaultToken: newVaultToken, expiresAt: session.expiresAt }
            })
        } else {
            newVaultToken = vaultToken;
        }
        await this.prisma.userSession.update({
            where: { id: session.id },
            data: { gateToken: newGateToken }
        })

        return { gateToken: newGateToken, vaultToken: newVaultToken, user, context };
    }

    async revokeAllSessions(userId: string) {
        return this.prisma.userSession.deleteMany({
            where: { userId }
        });
    }

    async touchSession(gateToken: string) {
        return this.prisma.userSession.update({
            where: { gateToken },
            data: {}
        });
    }

    async updateUserDeviceActivity(userId: string, userAgent?: string, ipAddress?: string) {
        if (!userAgent) return;
        const device = await this.prisma.userDevice.findFirst({ where: { userId, userAgent } });
        if (!device) return;

        const now = Date.now();
        const last = device.lastActive.getTime();

        if (now - last < DEVICE_ACTIVITY_WINDOW_MS) return;

        await this.prisma.userDevice.update({
            where: { id: device.id },
            data: { lastActive: new Date(), ipAddress }
        });
    }
}


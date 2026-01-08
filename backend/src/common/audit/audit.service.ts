import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type AuditPayload = {
    userId: string;
    organizationId?: string | null;
    action: string;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
};

@Injectable()
export class AuditService {
    constructor(private readonly prisma: PrismaService) { }

    async log(payload: AuditPayload) {
        await this.prisma.auditLog.create({
            data: {
                userId: payload.userId,
                organizationId: payload.organizationId,
                action: payload.action,
                description: payload.description,
                ipAddress: payload.ipAddress,
                userAgent: payload.userAgent,
            },
        });
    }
}

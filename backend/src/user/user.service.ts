import bcrypt from "bcrypt";
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateOtp, hashOtp, verifyOtp } from 'src/utils/helper';
import { AuditService } from "src/common/audit/audit.service";
import { AuthService } from "src/auth/auth.service";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private mailService: MailService, private auditService: AuditService, private authService: AuthService) { }
    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } })
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } })
    }

    async updateById(id: string, data: Partial<any>) {
        return this.prisma.user.update({ where: { id }, data })
    }

    async requestEmailChange(userId: string, newEmail: string, ip?: string, ua?: string) {
        const now = new Date();
        const otp = generateOtp();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

        const lastOtp = await this.prisma.emailOtp.findFirst({
            where: { userId, verifiedAt: null },
            orderBy: { createdAt: 'desc' },
        });

        if (lastOtp) {
            const diffSeconds = (now.getTime() - lastOtp.createdAt.getTime()) / 1000;
            if (diffSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
                throw new BadRequestException(`Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - diffSeconds)} seconds before requesting another OTP`);
            }
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.emailOtp.updateMany({
                where: { userId, verifiedAt: null },
                data: { verifiedAt: now },
            });
            await tx.emailOtp.create({
                data: { userId, email: newEmail, otpHash, expiresAt },
            });
        });
        await this.auditService.log({ userId, organizationId: "1", action: 'email_changed', description: `Email changed to ${newEmail}`, ipAddress: ip, userAgent: ua });

        try {
            await this.mailService.sendEmailOtp(newEmail, otp);
        } catch (err) {
            await this.prisma.emailOtp.deleteMany({
                where: { userId, email: newEmail, verifiedAt: null },
            });
            throw err;
        }
    }

    async verifyEmailOtp(userId: string, otp: string) {
        const record = await this.prisma.emailOtp.findFirst({
            where: { userId, verifiedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
        });
        if (!record) {
            throw new BadRequestException('OTP expired or not found');
        }

        if (record.attempts >= OTP_MAX_ATTEMPTS) {
            throw new BadRequestException('OTP attempts exceeded');
        }
        const isValid = verifyOtp(otp, record.otpHash);

        if (!isValid) {
            await this.prisma.emailOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
            throw new BadRequestException('Invalid OTP');
        }

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { email: record.email, isEmailVerified: true },
            }),
            this.prisma.emailOtp.update({
                where: { id: record.id },
                data: { verifiedAt: new Date() },
            }),
        ]);
    }

    async changePassword(userId: string, current: string, next: string, ip?: string, ua?: string) {
        const user = await this.findById(userId);
        if (!user?.password) {
            throw new BadRequestException('Password not set');
        }
        const isPasswordCorrect = bcrypt.compareSync(current, user.password)
        if (!isPasswordCorrect) {
            throw new BadRequestException('Invalid current password');
        }
        const salt = bcrypt.genSaltSync(15);
        const hashedPassword = await bcrypt.hash(next, salt);
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({ where: { id: userId }, data: { password: hashedPassword } });
            await this.authService.revokeAllSessions(userId);
        });
        await this.auditService.log({ userId, organizationId: "1", action: 'password_changed', description: 'Password changed and all sessions revoked', ipAddress: ip, userAgent: ua, });

        try {
            await this.mailService.sendPasswordChangedAlert(user.email);
        } catch (err) {
            Logger.warn('Password changed but email failed', err);
        }

        // await this.sessionService.revokeAllSessions(userId);
        // await this.audit.log(userId, 'password_changed', {});
    }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from "bcrypt";
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { AuditService } from 'src/common/audit/audit.service';


const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION_MINUTES = 30;

@Injectable()
export class AuthUserService {
    constructor(private prisma: PrismaService, private userService: UserService, private authService: AuthService, private auditService: AuditService) { }

    private async createSession(user: any, context: any, ip?: string, ua?: string) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: 'USER',
            ctx: {
                mode: context.mode,
                orgId: context.organisation?.id ?? null,
                orgRole: context.organisation?.role ?? null,
            },
        };

        const gateToken = await this.authService.signGateToken(payload);
        const vaultToken = this.authService.generateVaultToken();

        const vaultDays = Number(process.env.VAULT_TTL_DAYS) || 30;
        const expiresAt = new Date(Date.now() + vaultDays * 24 * 60 * 60 * 1000);

        await this.authService.createSession(gateToken, vaultToken, expiresAt, user.id as string, ip, ua);

        return { gateToken, vaultToken };
    }

    async create(dto: CreateUserDto) {
        const salt = bcrypt.genSaltSync(15);
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        return this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                mobileNo: dto.mobileNo,
                password: hashedPassword,
                username: dto.username
            }
        })
    }

    async login(dto: LoginUserDto, ip?: string, ua?: string) {
        const userDetails = await this.userService.findByEmail(dto.email);
        console.log(JSON.stringify(userDetails, null, 2));

        if (!userDetails) throw new UnauthorizedException('Invalid Credentials')
        if (!userDetails.password) throw new UnauthorizedException('Your Password is not set yet!')
        if (userDetails.lockedUntil && userDetails.lockedUntil > new Date()) {
            Logger.warn(`Login attempt on locked account`, `USER:${userDetails.id} IP:${ip}`);
            throw new UnauthorizedException('Account temporarily locked. Try again later.');
        }

        const isPasswordCorrect = bcrypt.compareSync(dto.password, userDetails.password);

        if (!isPasswordCorrect) {
            const failedAttempts = (userDetails.failedAttempts || 0) + 1;
            const updateData: Partial<any> = { failedAttempts };

            if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
                Logger.error(`Account locked due to failed login attempts`, `USER:${userDetails.id} IP:${ip}`);
            } else {
                Logger.error(`Invalid login attempt (${failedAttempts}/${MAX_FAILED_ATTEMPTS})`, `USER:${userDetails.id} IP:${ip}`);
            }

            await this.userService.updateById(userDetails.id, updateData);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (userDetails.failedAttempts > 0 || userDetails.lockedUntil) {
            await this.userService.updateById(userDetails.id, { failedAttempts: 0, lockedUntil: null });
            Logger.log(`Failed login attempts reset after successful login`, `USER:${userDetails.id}`);
        }

        const context = await this.authService.resolveContext(userDetails.id);
        const { gateToken, vaultToken } = await this.createSession(userDetails, context, ip, ua);
        await this.auditService.log({ userId: userDetails.id, organizationId: context.organisation?.id ?? null, action: 'login', description: 'User logged in successfully', ipAddress: ip, userAgent: ua, });

        Logger.log(`User logged in successfully`, `USER:${userDetails.id} IP:${ip}`);
        return { user: { id: userDetails.id, email: userDetails.email }, gateToken, vaultToken, context };
    }

    async registerAndLogin(dto: CreateUserDto, ip?: string, ua?: string) {
        const salt = bcrypt.genSaltSync(15);
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const user = await this.prisma.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                mobileNo: dto.mobileNo,
                password: hashedPassword,
                username: dto.username
            }
        })

        const { gateToken, vaultToken } = await this.createSession(user, ip, ua);

        await this.auditService.log({ userId: user.id, action: 'register', description: 'User registered and logged in', ipAddress: ip, userAgent: ua });
        return { user: { id: user.id, email: user.email }, gateToken, vaultToken };
    }
}

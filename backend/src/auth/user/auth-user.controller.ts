import type { Request } from 'express';
import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthUserService } from './auth-user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth.service';
import { SwitchOrganisationDto } from './dto/helper.dto';

@ApiTags('Auth - User')
@Controller('auth/user')
export class AuthUserController {
    constructor(private authUserService: AuthUserService, private authService: AuthService) { }

    @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account in the system.' })
    @Post('register')
    @Throttle({ auth: {} })
    async register(@Body() dto: CreateUserDto) {
        const out = await this.authUserService.create(dto);
        return { message: 'User registered successfully', data: { id: out.id, email: out.email } };
    }

    @ApiOperation({ summary: 'Register a new user and Login', description: 'Creates a new user account in the system.' })
    @Post('register-and-login')
    @Throttle({ auth: {} })
    async registerAndLogin(@Body() dto: CreateUserDto, @Req() req, @Res({ passthrough: true }) res) {
        const ip: string = req.ip;
        const ua: string = req.headers['user-agent'] || '';

        const { user, gateToken, vaultToken } = await this.authUserService.registerAndLogin(dto, ip, ua);
        res.cookie(process.env.VAULT_COOKIE_NAME || 'vaultToken', vaultToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: 'lax',
            maxAge: Number(process.env.VAULT_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000,
        });

        return {
            message: 'User registered successfully', data: {
                user: { id: user.id, email: user.email },
                gateToken: gateToken,
                context: null
            }
        };
    }

    @ApiOperation({ summary: 'Login user', description: 'Login user account in the system.' })
    @Post('login')
    @Throttle({ auth: {} })
    async login(@Body() dto: LoginUserDto, @Req() req, @Res({ passthrough: true }) res) {
        const ip: string = req.ip;
        const ua: string = req.headers['user-agent'] || '';
        const { user, gateToken, vaultToken, context } = await this.authUserService.login(dto, ip, ua);

        res.cookie(process.env.VAULT_COOKIE_NAME || 'vaultToken', vaultToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samesite: 'lax',
            maxAge: Number(process.env.VAULT_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000,
        });

        return {
            message: 'Login successful', data: {
                user: { id: user.id, email: user.email },
                gateToken: gateToken,
                context: context.organisation ? { mode: context.mode, organisation: context.organisation } : null
            }
        };
    }

    @ApiOperation({ summary: 'Refresh User Tokens', description: 'User gate token refreshes in the system.' })
    @Post('refresh')
    @Throttle({ auth: {} })
    async refresh(@Req() req, @Res({ passthrough: true }) res) {

        const vaultToken: string = req.cookies[process.env.VAULT_COOKIE_NAME || 'vaultToken'];
        if (!vaultToken) throw new UnauthorizedException('No vault token');

        const { context, gateToken, vaultToken: newVaultToken, user } = await this.authService.refreshWithVaultToken(vaultToken);

        if (newVaultToken && newVaultToken !== vaultToken) {
            res.cookie(process.env.VAULT_COOKIE_NAME || 'vaultToken', newVaultToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: Number(process.env.VAULT_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000,
            });
        }

        return {
            message: "Token Refreshed", data: {
                gateToken: gateToken,
                user: { id: user.id, email: user.email },
                context: context.organisation ? { mode: context.mode, organisation: context.organisation } : null
            }
        };
    }

    @ApiOperation({ summary: 'Logout User', description: 'Logout user from the system.' })
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res) {
        const cookieName = process.env.VAULT_COOKIE_NAME || 'vaultToken';
        const vaultToken: string = req.cookies[cookieName];

        if (!vaultToken) {
            return { message: 'Logged out' };
        }

        await this.authService.deleteSessionByVaultToken(vaultToken);

        res.clearCookie(cookieName, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return { message: 'Logged out' };
    }

    @ApiOperation({ summary: 'Switch Organisation', description: 'Switch organisation context for the logged in user.' })
    @Post('switch-organisation')
    async switchOrganisation(@Body() dto: SwitchOrganisationDto, @Req() req: Request) {
        const vaultToken: string = req.cookies[process.env.VAULT_COOKIE_NAME || 'vaultToken'];
        if (!vaultToken) throw new UnauthorizedException('No vault token');

        const result = await this.authService.switchWorkspace(vaultToken, dto.orgId);

        return {
            message: 'Organisation switched successfully',
            data: { gateToken: result.gateToken, context: result.context }
        };
    }
}

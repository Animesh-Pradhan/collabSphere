import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from '../common/roles/roles.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(private readonly authService: AuthService, private readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) { return true; }

        const activated = (await super.canActivate(context)) as boolean;
        if (!activated) return false;

        const req = context.switchToHttp().getRequest();

        const gateToken: string | undefined =
            req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.slice(7)
                : undefined;

        if (!gateToken) {
            throw new UnauthorizedException('Missing gate token');
        }

        const session = await this.authService.findSessionByGateToken(gateToken);
        if (!session) throw new UnauthorizedException('Session not found');

        if (session.expiresAt && new Date() > session.expiresAt) {
            await this.authService.deleteSessionByGateToken(gateToken);
            throw new UnauthorizedException('Session expired');
        }

        req.session = session;
        req.gateToken = gateToken;
        return true;
    }
}   

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
    constructor(private readonly authService: AuthService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();
        if (!req.user) return next.handle();
        if (req.gateToken) {
            await this.authService.touchSession(req.gateToken as string).catch(() => { });
        }

        return next.handle();
    }
}
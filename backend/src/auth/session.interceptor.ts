import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
    constructor(private readonly authService: AuthService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!req.user) return next.handle();
        if (req.gateToken) {
            await this.authService.updateUserDeviceActivity(req.user.sub as string, req.headers['user-agent'] as string, req.ip as string).catch(() => { });;
            await this.authService.touchSession(req.gateToken as string).catch(() => { });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return next.handle();
    }
}
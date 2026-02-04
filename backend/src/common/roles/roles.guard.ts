import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
        this.reflector = reflector;
    }

    canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user || !user.role) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!requiredRoles.includes(user.role as string)) {
            throw new ForbiddenException('Insufficient role privileges');
        }
        return true;
    }
}

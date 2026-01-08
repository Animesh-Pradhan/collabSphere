import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
        this.reflector = reflector;
    }

    canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const userRole = user.role || [];
        const rolesArray = Array.isArray(userRole) ? userRole : [userRole];

        for (let i = 0; i < requiredRoles.length; i++) {
            const r = requiredRoles[i];
            if (rolesArray.indexOf(r) !== -1) {
                return true;
            }
        }

        throw new ForbiddenException('Insufficient role privileges');
    }
}

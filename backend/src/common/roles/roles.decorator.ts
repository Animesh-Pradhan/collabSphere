import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

export function Public() {
    return SetMetadata(IS_PUBLIC_KEY, true);
}
export function Roles(...roles: string[]) {
    return SetMetadata(ROLES_KEY, roles);
}

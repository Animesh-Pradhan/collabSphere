import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/roles/roles.decorator';
import { Role } from 'src/common/roles/roles.enum';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { JwtGuard } from 'src/auth/jwt.guard';


@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
export class AuthAdminController {

    @Get('only-admin')
    @Roles(Role.USER)
    onlyAdmin() {
        return { message: 'hello admin' };
    }

    @Get('only-super')
    @Roles(Role.SUPER_ADMIN)
    onlySuper() {
        return { message: 'hello super admin' };
    }
}

import type { Request } from 'express';
import { BadRequestException, Body, Controller, Get, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Roles } from 'src/common/roles/roles.decorator';
import { Role } from 'src/common/roles/roles.enum';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto, GetOrgUsersQueryDto, RequestEmailChangeDto, VerifyEmailOtpDto } from './dto/user-helper';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.USER)
@Throttle({ auth: {} })

export class UserController {
    constructor(private userService: UserService) { }

    @ApiOperation({ summary: 'Get User Profile', description: 'Returns logged-in user profile using access token' })
    @Get('detail')
    async findById(@Req() req: any) {
        const user = await this.userService.findById(req.user.sub as string);
        return { message: "User data fetched Succesfully", data: plainToInstance(UserResponseDto, user) }
    }

    @ApiOperation({ summary: 'Update User Details', description: 'Returns logged-in user profile using access token' })
    @Put('detail')
    async updateDetails(@Req() req: any, @Body() dto: UpdateUserDto) {
        const user = await this.userService.updateById(req.user.sub as string, dto);
        return { message: "User data Updated Succesfully", data: plainToInstance(UserResponseDto, user) }
    }

    @ApiOperation({ summary: 'Email Update With OTP', description: 'Update email address of user with OTP verification' })
    @Post('email/change-request')
    async requestEmailChange(@Req() req: any, @Body() dto: RequestEmailChangeDto) {
        const ip: string = req.ip;
        const ua: string = req.headers['user-agent'] || '';
        await this.userService.requestEmailChange(req.user.sub as string, dto.email, ip, ua)
        return { message: 'OTP sent to new email' };
    }

    @ApiOperation({ summary: 'Verify Email OTP', description: 'Verify OTP and update user email' })
    @Post('email/verify')
    async verifyEmailOtp(@Req() req: any, @Body() dto: VerifyEmailOtpDto) {
        await this.userService.verifyEmailOtp(req.user.sub as string, dto.otp,);
        return { message: 'Email updated successfully' };
    }

    // @ApiOperation({ summary: 'Mobile Update With OTP', description: 'Update mobile no of user with OTP verification' })
    // @Post('mobile/change-request')
    // async requestMobileChange(@Req() req: any, @Body() dto: RequestMobileChangeDto) {
    //     await this.userService.requestEmailChange(req.user.sub as string, dto.mobileNo)
    //     return { message: 'OTP sent to new mobile' };
    // }

    @ApiOperation({ summary: 'Change account password', description: 'Update account password of user account.' })
    @Put('change-password')
    async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
        const ip: string = req.ip;
        const ua: string = req.headers['user-agent'] || '';
        await this.userService.changePassword(req.user.sub as string, dto.currentPassword, dto.newPassword, ip, ua);
        return { message: 'Password changed successfully' };
    }


    @Roles(Role.SUPER_ADMIN, Role.USER)
    @ApiOperation({ summary: 'Get All Organisation User', description: 'Returns all users inside a organisation.' })
    @Get('/org-users')
    async findUsersByOrg(@Req() req: Request, @Query() query: GetOrgUsersQueryDto) {
        const organisationId = req.user?.ctx.orgId;
        const userId = req.user?.sub;

        if (!organisationId) {
            throw new BadRequestException('Organization context required | (Valid for Organisation user only)');
        }

        const data = await this.userService.findUsersByOrg(organisationId, userId, query);

        return {
            message: "User data fetched Succesfully", data: {
                members: plainToInstance(UserResponseDto, data.data),
                meta: data.meta
            }
        }
    }


}

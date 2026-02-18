import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, Length, MaxLength } from "class-validator";
import { MemberStatus, Role } from "generated/prisma/enums";
import { BaseQueryDto } from "src/common/dto/base-query.dto";

export class RequestEmailChangeDto {
    @ApiProperty({ example: "dr.illuminati.06@gmail.com", description: 'User Email' })
    @IsString()
    @MaxLength(50)
    email: string;
}

export class RequestMobileChangeDto {
    @ApiProperty({ example: "4578662254", description: 'User Mobile No' })
    @IsString()
    @MaxLength(20)
    mobileNo: string;
}

export class ChangePasswordDto {
    @ApiProperty({ example: "", description: 'Current Password' })
    currentPassword: string;

    @ApiProperty({ example: "", description: 'New Password' })
    newPassword: string;
}

export class VerifyEmailOtpDto {
    @ApiProperty({ example: "", description: 'OTP' })
    @IsString()
    @Length(4, 8)
    otp: string;
}


export class GetOrgUsersQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ description: 'Filter by organisation role', enum: Role, example: Role.ADMIN })
    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @ApiPropertyOptional({ description: 'Filter by user status', enum: MemberStatus, example: MemberStatus.ACTIVE })
    @IsOptional()
    @IsEnum(MemberStatus)
    status?: MemberStatus;
}


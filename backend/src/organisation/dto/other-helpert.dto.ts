import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MemberStatus, Role } from "generated/prisma/enums";
import { BaseQueryDto } from "src/common/dto/base-query.dto";

export class InviteOrganisationMemberDto {
    @ApiProperty({ example: "dr.illuminati.06@gmail.com", description: 'User email address' })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({ example: "MEMBER", description: 'User role' })
    @IsString()
    role?: Role;
}

export class AcceptInviteDto {
    @ApiProperty({
        description: 'Invitation token received in email',
        example: 'a1b2c3d4e5f6',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}

export enum InvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export class GetOrgInvitationsQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({
        description: 'Filter by invitation status',
        enum: InvitationStatus,
        example: InvitationStatus.PENDING
    })
    @IsOptional()
    @IsEnum(InvitationStatus)
    status?: InvitationStatus;
}


const UpdatableRoles = Object.values(Role).filter((role) => role !== Role.OWNER);
export class UpdateOrgMemberDto {
    @ApiPropertyOptional({ enum: UpdatableRoles, description: 'Role of the organisation member', example: Role.MANAGER })
    @IsOptional()
    @IsEnum(UpdatableRoles, { message: 'Role must be ADMIN, MANAGER, GUEST or MEMBER' })
    role?: Role;

    @ApiPropertyOptional({ enum: MemberStatus, description: 'Status of the organisation member', example: MemberStatus.ACTIVE })
    @IsOptional()
    @IsEnum(MemberStatus, { message: 'Status must be ACTIVE SUSPENDED or REMOVED' })
    status?: MemberStatus;
}

export class BulkDeleteOrgMembersDto {
    @ApiProperty({ description: 'Array of organisation member IDs', example: ['uuid-1', 'uuid-2'], type: [String] })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    memberIds: string[];
}
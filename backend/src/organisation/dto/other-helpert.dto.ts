import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "generated/prisma/enums";
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
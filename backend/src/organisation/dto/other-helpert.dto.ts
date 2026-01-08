import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Role } from "generated/prisma/enums";

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

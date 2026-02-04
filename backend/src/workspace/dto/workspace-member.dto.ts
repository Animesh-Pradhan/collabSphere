import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { WorkspaceRole } from "generated/prisma/enums";

export class AddWorkspaceMemberDto {
    @ApiProperty({ example: "", description: "Workspace ID", required: true })
    @IsString()
    @IsNotEmpty()
    workspaceId: string;

    @ApiProperty({ example: ["", ""], description: "Array of User ID", required: true })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    userIds: string[];

    @ApiProperty({ description: 'Email addresses (external users)', example: ['user1@email.com', 'user2@email.com'] })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsEmail({}, { each: true })
    emails?: string[];
}

export class UpdateMemberRoleDto {
    @ApiProperty({ example: "EDITOR", description: "Workspace Member Role", required: true })
    @IsString()
    @IsNotEmpty()
    role: WorkspaceRole;
}
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
    @ApiProperty({ example: "Development Workspace", description: "Workspace name" })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: "Workspace for Development phase", description: "Workspace description" })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: false, description: "Workspace default setter" })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;

    @ApiProperty({ example: 100, description: "Workspace write quota" })
    @IsNumber()
    @IsOptional()
    writeQuota?: number;

    @ApiProperty({ example: 1000, description: "Workspace read quota" })
    @IsNumber()
    @IsOptional()
    readQuota?: number;

    @ApiProperty({ example: "active", description: "Workspace status" })
    @IsString()
    @IsOptional()
    status?: string;
}

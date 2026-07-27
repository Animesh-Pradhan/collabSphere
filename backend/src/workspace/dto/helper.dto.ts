import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsIn, IsOptional } from "class-validator";
import { WorkspaceMemberStatus, WorkspaceRole } from "generated/prisma/enums";
import { BaseQueryDto } from "src/common/dto/base-query.dto";
import { WorkspaceMemberSource } from "../workspace.service";

export class GetMyWorkspacesQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({ description: 'Filter by workspace type', enum: ['PERSONAL', 'ORG'], example: 'ORG' })
    @IsOptional()
    @IsIn(['PERSONAL', 'ORG'])
    type?: 'PERSONAL' | 'ORG';

    @ApiPropertyOptional({ description: 'Filter by workspace status', enum: ['active', 'archived', 'locked'], example: 'active' })
    @IsOptional()
    @IsIn(['active', 'archived', 'locked'])
    status?: string;
}

export class GetWorkspaceMembersQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ description: "Filter by workspace member role", enum: WorkspaceRole, example: WorkspaceRole.OWNER })
    @IsOptional()
    @IsEnum(WorkspaceRole)
    role?: WorkspaceRole;

    @ApiPropertyOptional({ description: "Filter by workspace member status", enum: WorkspaceMemberStatus, example: WorkspaceMemberStatus.ACTIVE })
    @IsOptional()
    @IsEnum(WorkspaceMemberStatus)
    status?: WorkspaceMemberStatus;

    @ApiPropertyOptional({ description: "Filter by member source", enum: WorkspaceMemberSource, example: WorkspaceMemberSource.INTERNAL })
    @IsOptional()
    @IsEnum(WorkspaceMemberSource)
    source?: WorkspaceMemberSource;
}
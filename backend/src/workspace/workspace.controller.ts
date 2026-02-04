import type { Request } from 'express';
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ForbiddenException, Query, Patch } from '@nestjs/common';
import { WorkspaceMemberSource, WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/roles/roles.decorator';
import { Role } from 'src/common/roles/roles.enum';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { AddWorkspaceMemberDto, UpdateMemberRoleDto } from './dto/workspace-member.dto';
import { WorkspaceMemberGuard } from 'src/common/roles/workspace-member.guard';

@ApiTags("Workspace")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.USER)
@Throttle({ medium: {} })
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) { }

  @ApiOperation({ summary: "Create Workspace", description: "Create a new workspace" })
  @Post()
  async create(@Req() req: Request, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    if (req.user?.ctx.mode === "ORG") {
      if (!['OWNER', 'ADMIN'].includes(req.user.ctx.orgRole as string)) {
        throw new ForbiddenException('Only org owners or admins can create workspaces');
      }
    }
    const organisationId = req.user?.ctx.orgId;
    const ownerId = req.user?.sub;
    const workspaceType = req.user?.ctx.mode === "ORG" ? "ORGANISATION" : "PERSONAL";

    const data = await this.workspaceService.create(createWorkspaceDto, organisationId ?? null, ownerId, workspaceType);
    return { message: "A Worksspace added succesfully.", data }
  }

  @ApiOperation({ summary: "Get All Workspaces", description: "Get all workspaces by organisation or personal" })
  @Get()
  async getMyWorkspaces(@Req() req: Request) {
    const userId = req.user?.sub;
    const organisationId = req.user?.ctx.mode === "ORG" ? req.user?.ctx.orgId : null;

    const data = await this.workspaceService.getMyWorkspaces(userId, organisationId);
    return { message: "All workspaces retrieved successfully.", data }
  }

  @ApiOperation({ summary: 'Get Workspace', description: 'Get workspace by id (if user has access)' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request,) {
    const userId = req.user?.sub;
    const organisationId = req.user?.ctx.mode === "ORG" ? req.user?.ctx.orgId : null;

    const data = await this.workspaceService.findOne(id, userId, organisationId);
    return { message: "Workspace details retrieved successfully.", data };
  }

  @ApiOperation({ summary: "Update Workspaces", description: "Update workspaces - owner can update workspace." })
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: Request, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    const userId = req.user?.sub;
    const data = await this.workspaceService.update(id, updateWorkspaceDto, userId);
    return { message: "Workspace updated successfully.", data };
  }

  @ApiOperation({ summary: "Delete Workspace", description: "Delete workspaces - owner can delete workspace." })
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.sub;
    const data = await this.workspaceService.delete(id, userId);
    return { message: "Workspace deleted successfully.", data };
  }

  @ApiOperation({ summary: "Add Workspace Members", description: "Add Multiple members in the workspace." })
  @ApiQuery({ name: 'source', enum: ['internal', 'external'], required: true, description: 'Member source (default: internal)' })
  @Post("add-member")
  async addMember(@Req() req: Request, @Query("source") source: WorkspaceMemberSource = WorkspaceMemberSource.INTERNAL, @Body() addMemberDto: AddWorkspaceMemberDto) {
    const userId = req.user?.sub;
    const organisationId = req.user?.ctx.orgId;

    let data;
    if (source === WorkspaceMemberSource.EXTERNAL) {
      data = await this.workspaceService.addExternalWorkspaceMember(userId, organisationId as string, addMemberDto);
    } else {
      data = await this.workspaceService.addWorkspaceMember(userId, organisationId as string, addMemberDto);
    }
    console.log(data);

    return { message: "Workspace members added", data }
  }

  @UseGuards(WorkspaceMemberGuard)
  @Roles(Role.SUPER_ADMIN, Role.USER)
  @ApiOperation({ summary: "Get All Workspace Members", description: "Get All Workspace Members Including external members." })
  @Get(":id/members")
  async getWorkspaceMembers(@Param("id") workspaceId: string, @Req() req: Request) {
    const userId = req.user.sub;
    const role = req.user.role;

    const data = await this.workspaceService.getWorkspaceMembers(workspaceId, userId, role);
    return { message: 'Workspace Members fetched successfully', data }
  }

  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: "Remove / Revoke Member", description: "Remove / Revoke Member from the workspace." })
  @Delete(":id/remove-member/:memberId")
  async revokeMember(@Param("id") workspaceId: string, @Param("memberId") memberId: string, @Req() req: Request) {
    const userId = req.user.sub;

    const data = await this.workspaceService.removeWorkspaceMember(workspaceId, userId, memberId);
    return { message: "User Removed from the workspace successfully.", data }
  }

  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: "Update Workspace member role" })
  @Patch(":id/update-member-role/:memberId")
  async updateMemberRole(@Param("id") workspaceId: string, @Param("memberId") memberId: string, @Req() req: Request, @Body() updateMemberRoleDto: UpdateMemberRoleDto) {
    const userId = req.user.sub;
    const data = await this.workspaceService.updateWorkspaceMemberRole(workspaceId, userId, memberId, updateMemberRoleDto.role);
    return { message: "Workspace member role updated successfully.", data }
  }

  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: "Leave Workspace", description: "Leave a workspace you are a member of." })
  @Delete(":id/leave-workspace")
  async leaveWorksapce(@Param("id") workspaceId: string, @Req() req: Request) {
    const userId = req.user.sub;
    const data = await this.workspaceService.leaveWorkspace(workspaceId, userId);
    return { message: "Workspace left successfully.", data }
  }
}


///TODO
// 1 - In Members Add API - email should go for external to register and join and for internal normal welcome email.
// 2 - List Pending inivitations in the members list with status pending.

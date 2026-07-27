import type { Request } from "express";
import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/jwt.guard";
import { RolesGuard } from "src/common/roles/roles.guard";
import { WorkspaceMemberGuard } from "src/common/roles/workspace-member.guard";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "src/common/roles/roles.decorator";
import { Role } from "src/common/roles/roles.enum";
import { TaskAssigneeService } from "./assignee.service";
import { AddTaskAssigneesDto } from "./dto/add-assignee.sto";



@ApiTags("Tasks - (Workspace)")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller('workspace/:workspaceId/tasks/:taskId/assignees')

export class TaskAssigneeController {
    constructor(private readonly taskAssigneeService: TaskAssigneeService) { }

    @ApiOperation({ summary: "Add assignees to the Task" })
    @Post()
    async create(
        @Param('workspaceId') workspaceId: string,
        @Param('taskId') taskId: string,
        @Req() req: Request,
        @Body() dto: AddTaskAssigneesDto
    ) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskAssigneeService.addAssignees(workspaceId, workspaceMemberId!, taskId, dto);
        return { message: "Assignees added successfully.", data };
    }

    @ApiOperation({ summary: "Remove Assignee from the Task" })
    @Delete(':workspaceMemberId')
    async remove(
        @Param('workspaceId') workspaceId: string,
        @Param('taskId') taskId: string,
        @Param('workspaceMemberId') assigneeId: string,
        @Req() req: Request
    ) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskAssigneeService.removeAssignee(workspaceId, workspaceMemberId!, taskId, assigneeId);
        return { message: "Assignee removed successfully.", data };
    }

    @ApiOperation({ summary: "Get All Task Assignees" })
    @Get()
    async findAll(@Param("workspaceId") workspaceId: string, @Param('taskId') taskId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskAssigneeService.findAllAssginee(workspaceId, workspaceMemberId!, taskId);
        return { message: "Assignees fetched successfully.", data };
    }
}
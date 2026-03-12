import type { Request } from "express";
import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { TaskService } from "./task.service";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/jwt.guard";
import { RolesGuard } from "src/common/roles/roles.guard";
import { WorkspaceMemberGuard } from "src/common/roles/workspace-member.guard";
import { Throttle } from "@nestjs/throttler";
import { Roles } from "src/common/roles/roles.decorator";
import { Role } from "src/common/roles/roles.enum";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@ApiTags("Tasks - (Workspace)")
@UseGuards(JwtGuard, RolesGuard, WorkspaceMemberGuard)
@Roles(Role.USER)
@Throttle({ long: {} })
@Controller('workspace/:workspaceId/tasks')

export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @ApiOperation({ summary: "Create Task" })
    @Post()
    async create(@Param('workspaceId') workspaceId: string, @Req() req: Request, @Body() dto: CreateTaskDto) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.createTask(workspaceId, workspaceMemberId!, dto);
        return { message: "Task created successfully.", data };
    }

    @ApiOperation({ summary: "Get All Tasks in Workspace" })
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @Get()
    async findAll(@Param("workspaceId") workspaceId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.findAll(workspaceId, workspaceMemberId!);
        return { message: "Tasks fetched successfully.", data };
    }

    @ApiOperation({ summary: "Get Single Task" })
    @Get(':taskId')
    async findOne(@Param('workspaceId') workspaceId: string, @Param('taskId') taskId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.findOne(workspaceId, workspaceMemberId!, taskId);
        return { message: "Task fetched successfully.", data };
    }

    @ApiOperation({ summary: "Update Task" })
    @Patch(':taskId')
    async update(
        @Param('workspaceId') workspaceId: string,
        @Param('taskId') taskId: string,
        @Req() req: Request,
        @Body() dto: UpdateTaskDto
    ) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.update(workspaceId, workspaceMemberId!, taskId, dto);
        return { message: "Task updated successfully.", data };
    }

    @ApiOperation({ summary: "Delete Task" })
    @Delete(':taskId')
    async remove(@Param('workspaceId') workspaceId: string, @Param('taskId') taskId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.remove(workspaceId, workspaceMemberId!, taskId);
        return { message: "Task deleted successfully.", data };
    }


    @ApiOperation({ summary: 'Get tasks assigned to current user across workspaces' })
    @ApiQuery({ name: "page", required: false })
    @ApiQuery({ name: "limit", required: false })
    @Get('/tasks/my')
    async getMyTasks(@Param("workspaceId") workspaceId: string, @Req() req: Request) {
        const workspaceMemberId = req.workspaceMember?.id;
        const data = await this.taskService.findMyTasks(workspaceId, workspaceMemberId!);
        return { message: "Tasks fetched successfully.", data };
    }
}

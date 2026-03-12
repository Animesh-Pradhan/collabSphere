import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { validateWorkspaceMember } from "src/common/validators/workspace-member.validator";
import { validateTask } from "src/common/validators/task.validator";
import { UpdateTaskDto } from "./dto/update-task.dto";


@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }
    async createTask(workspaceId: string, workspaceMemberId: string, createTaskDto: CreateTaskDto) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to create a task");

            const task = await tx.task.create({
                data: { workspaceId, createdBy: workspaceMemberId, ...createTaskDto }
            });

            return task;
        })
    }

    async findAll(workspaceId: string, workspaceMemberId: string) {
        return this.prisma.$transaction(async (tx) => {

            await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);

            const tasks = await tx.task.findMany({
                where: { workspaceId, deletedAt: null },
                orderBy: { createdAt: "desc" }
            });

            return tasks;
        });
    }

    async findOne(workspaceId: string, workspaceMemberId: string, taskId: string) {
        return this.prisma.$transaction(async (tx) => {
            await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            const task = await validateTask(tx, workspaceId, taskId);
            return task;
        });
    }

    async update(workspaceId: string, workspaceMemberId: string, taskId: string, updateTaskDto: UpdateTaskDto) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to update task");

            await validateTask(tx, workspaceId, taskId);

            const task = await tx.task.update({
                where: { id: taskId },
                data: updateTaskDto
            });

            return task;
        });
    }

    async remove(workspaceId: string, workspaceMemberId: string, taskId: string) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to delete task");

            await validateTask(tx, workspaceId, taskId);

            const task = await tx.task.update({
                where: { id: taskId },
                data: { deletedAt: new Date() }
            });

            return task;
        });
    }

    async findMyTasks(workspaceId: string, workspaceMemberId: string) {
        return this.prisma.$transaction(async (tx) => {

            await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);

            const tasks = await tx.task.findMany({
                where: {
                    workspaceId,
                    deletedAt: null,
                    OR: [
                        { ownerId: workspaceMemberId },
                        { taskAssignees: { some: { workspaceMemberId } } }
                    ],
                },
                include: {
                    creator: {
                        select: { id: true, user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
                    },
                    owner: {
                        select: { id: true, user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
                    },

                    taskAssignees: {
                        select: {
                            workspaceMemberId: true,
                            workspaceMember: { select: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            });

            return tasks;
        });
    }
}
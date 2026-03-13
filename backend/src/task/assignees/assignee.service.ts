import { PrismaService } from "src/prisma/prisma.service";
import { AddTaskAssigneesDto } from "./dto/add-assignee.sto";
import { validateWorkspaceMember } from "src/common/validators/workspace-member.validator";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { validateTask } from "src/common/validators/task.validator";


export class TaskAssigneeService {
    constructor(private readonly prisma: PrismaService) { }

    async addAssignees(workspaceId: string, workspaceMemberId: string, taskId: string, dto: AddTaskAssigneesDto) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to add assignee in a task");

            await validateTask(tx, workspaceId, taskId);

            const validMembers = await tx.workspaceMember.findMany({
                where: { id: { in: dto.workspaceMemberIds }, workspaceId, status: 'ACTIVE', removedAt: null },
                select: { id: true }
            });
            if (validMembers.length !== dto.workspaceMemberIds.length) throw new BadRequestException("Some members are not part of this workspace or are not active.");

            await tx.taskAssignee.createMany({
                data: dto.workspaceMemberIds.map((id) => ({
                    taskId,
                    workspaceMemberId: id,
                    assignedBy: workspaceMemberId,
                })),
                skipDuplicates: true
            });

            const assignees = await tx.taskAssignee.findMany({
                where: { taskId },
                select: {
                    workspaceMemberId: true,
                    workspaceMember: {
                        select: {
                            id: true, role: true, user: {
                                select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                            }
                        }
                    }
                }
            })

            return assignees
        })
    }

    async removeAssignee(workspaceId: string, workspaceMemberId: string, taskId: string, assigneeId: string) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to modify task assignees");

            await validateTask(tx, workspaceId, taskId);

            return tx.taskAssignee.delete({
                where: { taskId_workspaceMemberId: { taskId, workspaceMemberId: assigneeId } }
            })
        })
    }

    async findAllAssginee(workspaceId: string, workspaceMemberId: string, taskId: string) {
        return this.prisma.$transaction(async (tx) => {
            const member = await validateWorkspaceMember(tx, workspaceId, workspaceMemberId);
            if (!["VIEWER", "EDITOR", "OWNER"].includes(member.role)) throw new ForbiddenException("Insufficient permission to view task assignees");
            await validateTask(tx, workspaceId, taskId);

            const assignees = await tx.taskAssignee.findMany({
                where: { taskId },
                select: {
                    workspaceMemberId: true,
                    workspaceMember: {
                        select: {
                            id: true, role: true, user: {
                                select: { id: true, firstName: true, lastName: true, email: true, avatar: true }
                            }
                        }
                    }
                }
            });

            return assignees;
        });
    }
}
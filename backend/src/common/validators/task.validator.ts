import { NotFoundException } from "@nestjs/common";
import { Prisma } from "generated/prisma/client";

export async function validateTask(tx: Prisma.TransactionClient, workspaceId: string, taskId: string) {
    const task = await tx.task.findFirst({ where: { id: taskId, workspaceId, deletedAt: null } });
    if (!task) throw new NotFoundException("Task not found");

    return task;
}
/*
  Warnings:

  - A unique constraint covering the columns `[organisationId,isDefault]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WorkspaceMember" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organisationId_isDefault_key" ON "Workspace"("organisationId", "isDefault");

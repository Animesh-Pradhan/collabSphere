/*
  Warnings:

  - You are about to drop the column `invitedAt` on the `OrganisationMember` table. All the data in the column will be lost.
  - You are about to drop the column `invitedBy` on the `OrganisationMember` table. All the data in the column will be lost.
  - The `status` column on the `OrganisationMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'GUEST';

-- AlterTable
ALTER TABLE "OrganisationMember" DROP COLUMN "invitedAt",
DROP COLUMN "invitedBy",
DROP COLUMN "status",
ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "OrganisationInvite" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "tokenHash" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "OrganisationInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganisationInvite_organisationId_idx" ON "OrganisationInvite"("organisationId");

-- CreateIndex
CREATE INDEX "OrganisationInvite_email_idx" ON "OrganisationInvite"("email");

-- CreateIndex
CREATE INDEX "OrganisationInvite_status_idx" ON "OrganisationInvite"("status");

-- CreateIndex
CREATE INDEX "OrganisationMember_status_idx" ON "OrganisationMember"("status");

-- AddForeignKey
ALTER TABLE "OrganisationInvite" ADD CONSTRAINT "OrganisationInvite_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

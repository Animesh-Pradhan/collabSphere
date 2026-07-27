-- AlterTable
ALTER TABLE "Organisation" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActiveOrganisationId" TEXT;

-- CreateIndex
CREATE INDEX "OrganisationInvite_tokenHash_status_idx" ON "OrganisationInvite"("tokenHash", "status");

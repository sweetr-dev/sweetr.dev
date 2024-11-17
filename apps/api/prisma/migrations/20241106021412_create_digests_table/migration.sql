-- CreateEnum
CREATE TYPE "DigestType" AS ENUM ('TEAM_METRICS', 'TEAM_WIP');
CREATE TYPE "DayOfTheWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "Digest" (
    "id" SERIAL NOT NULL,
    "type" "DigestType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "channel" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "dayOfTheWeek" "DayOfTheWeek"[] NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "teamId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "Digest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Digest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Digest_teamId_type_key" ON "Digest"("teamId", "type");
CREATE INDEX "Digest_workspaceId_idx" ON "Digest"("workspaceId");
CREATE INDEX "Digest_teamId_idx" ON "Digest"("teamId");

-- RLS
ALTER TABLE "Digest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Digest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Digest" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Digest" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

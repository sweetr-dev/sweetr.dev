/*
  Warnings:

  - Made the column `gitProfileId` on table `TeamMember` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('CODE_REVIEW_SUBMITTED', 'PULL_REQUEST_MERGED', 'PULL_REQUEST_CREATED');

-- AlterTable
ALTER TABLE "TeamMember" ALTER COLUMN "gitProfileId" SET NOT NULL;

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" SERIAL NOT NULL,
    "type" "ActivityEventType" NOT NULL,
    "metadata" JSONB NOT NULL,
    "eventId" TEXT,
    "eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gitProfileId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "pullRequestId" INTEGER,
    "repositoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityEvent_workspaceId_eventId_key" ON "ActivityEvent"("workspaceId", "eventId");

-- CreateIndex
CREATE INDEX "ActivityEvent_workspaceId_idx" ON "ActivityEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "ActivityEvent_gitProfileId_idx" ON "ActivityEvent"("gitProfileId");

-- CreateIndex
CREATE INDEX "ActivityEvent_pullRequestId_idx" ON "ActivityEvent"("pullRequestId");

-- CreateIndex
CREATE INDEX "ActivityEvent_repositoryId_idx" ON "ActivityEvent"("repositoryId");

-- RLS
ALTER TABLE "ActivityEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "ActivityEvent" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "ActivityEvent" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

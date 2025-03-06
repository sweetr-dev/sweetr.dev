-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SLOW_REVIEW', 'SLOW_MERGE', 'MERGED_WITHOUT_APPROVAL', 'HOT_PR', 'UNRELEASED_CHANGES');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "type" "AlertType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "channel" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "teamId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_workspaceId_idx" ON "Alert"("workspaceId");

-- CreateIndex
CREATE INDEX "Alert_teamId_idx" ON "Alert"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_teamId_type_key" ON "Alert"("teamId", "type");

-- RLS
ALTER TABLE "Alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Alert" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Alert" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

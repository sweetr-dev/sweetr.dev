-- CreateEnum
CREATE TYPE "IntegrationApp" AS ENUM ('SLACK');

-- CreateTable
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "app" "IntegrationApp" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_workspaceId_app_idx" ON "Integration"("workspaceId", "app");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_app_key" ON "Integration"("workspaceId", "app");

-- RLS
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Integration" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Integration" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

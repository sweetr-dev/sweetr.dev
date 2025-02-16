-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" SERIAL NOT NULL,
    "alertId" INTEGER NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertEvent_workspaceId_idx" ON "AlertEvent"("workspaceId");

-- CreateIndex
CREATE INDEX "AlertEvent_pullRequestId_idx" ON "AlertEvent"("pullRequestId");

-- CreateIndex
CREATE INDEX "AlertEvent_alertId_idx" ON "AlertEvent"("alertId");

-- RLS
ALTER TABLE "AlertEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AlertEvent" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "AlertEvent" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "AlertEvent" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

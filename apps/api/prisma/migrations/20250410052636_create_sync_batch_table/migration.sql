-- CreateTable
CREATE TABLE "SyncBatch" (
    "id" SERIAL NOT NULL,
    "sinceDaysAgo" INT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "SyncBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyncBatch_workspaceId_idx" ON "SyncBatch"("workspaceId");

-- RLS
ALTER TABLE "SyncBatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SyncBatch" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "SyncBatch" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "SyncBatch" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- CreateTable
CREATE TABLE "WorkspaceMembershipRepository" (
    "id" SERIAL NOT NULL,
    "workspaceMembershipId" INTEGER NOT NULL,
    "repositoryId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMembershipRepository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembershipRepository_workspaceMembershipId_repositoryId_key" ON "WorkspaceMembershipRepository"("workspaceMembershipId" ASC, "repositoryId" ASC);

-- CreateIndex
CREATE INDEX "WorkspaceMembershipRepository_workspaceId_idx" ON "WorkspaceMembershipRepository"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "WorkspaceMembershipRepository_repositoryId_idx" ON "WorkspaceMembershipRepository"("repositoryId" ASC);

-- AddForeignKey
ALTER TABLE "WorkspaceMembershipRepository" ADD CONSTRAINT "WorkspaceMembershipRepository_workspaceMembershipId_fkey" FOREIGN KEY ("workspaceMembershipId") REFERENCES "WorkspaceMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembershipRepository" ADD CONSTRAINT "WorkspaceMembershipRepository_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembershipRepository" ADD CONSTRAINT "WorkspaceMembershipRepository_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row level security (workspace-scoped)
ALTER TABLE "WorkspaceMembershipRepository" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "WorkspaceMembershipRepository" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "WorkspaceMembershipRepository" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

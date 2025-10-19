-- CreateTable
CREATE TABLE "Environment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isProduction" BOOLEAN NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "repositoryId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "deploymentSettings" JSONB NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "description" TEXT,
    "environmentId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "deployedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER,
    "leaderId" INTEGER,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "causeDeploymentId" INTEGER NOT NULL,
    "fixDeploymentId" INTEGER,
    "postmortemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployedPullRequest" (
    "id" SERIAL NOT NULL,
    "deploymentId" INTEGER NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeployedPullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Environment_workspaceId_idx" ON "Environment"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Environment_workspaceId_name_key" ON "Environment"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Application_workspaceId_name_key" ON "Application"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "Application_workspaceId_idx" ON "Application"("workspaceId");

-- CreateIndex
CREATE INDEX "Application_repositoryId_idx" ON "Application"("repositoryId");

-- CreateIndex
CREATE INDEX "Application_teamId_idx" ON "Application"("teamId");

-- CreateIndex
CREATE INDEX "Deployment_workspaceId_idx" ON "Deployment"("workspaceId");

-- CreateIndex
CREATE INDEX "Deployment_applicationId_idx" ON "Deployment"("applicationId");

-- CreateIndex
CREATE INDEX "Deployment_environmentId_idx" ON "Deployment"("environmentId");

-- CreateIndex
CREATE INDEX "Deployment_authorId_idx" ON "Deployment"("authorId");

-- CreateIndex
CREATE INDEX "Deployment_workspaceId_deployedAt_idx" ON "Deployment"("workspaceId", "deployedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_workspaceId_environmentId_applicationId_version__key" ON "Deployment"("workspaceId", "environmentId", "applicationId", "version", "deployedAt");

-- CreateIndex
CREATE INDEX "Incident_workspaceId_idx" ON "Incident"("workspaceId");

-- CreateIndex
CREATE INDEX "Incident_causeDeploymentId_idx" ON "Incident"("causeDeploymentId");

-- CreateIndex
CREATE INDEX "Incident_fixDeploymentId_idx" ON "Incident"("fixDeploymentId");

-- CreateIndex
CREATE INDEX "Incident_teamId_idx" ON "Incident"("teamId");

-- CreateIndex
CREATE INDEX "Incident_leaderId_idx" ON "Incident"("leaderId");

-- CreateIndex
CREATE INDEX "Incident_workspaceId_detectedAt_idx" ON "Incident"("workspaceId", "detectedAt");

-- CreateIndex
CREATE INDEX "DeployedPullRequest_deploymentId_idx" ON "DeployedPullRequest"("deploymentId");

-- CreateIndex
CREATE INDEX "DeployedPullRequest_pullRequestId_idx" ON "DeployedPullRequest"("pullRequestId");

-- CreateIndex
CREATE INDEX "DeployedPullRequest_workspaceId_idx" ON "DeployedPullRequest"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedPullRequest_deploymentId_pullRequestId_key" ON "DeployedPullRequest"("deploymentId", "pullRequestId");


-- RLS Environment
ALTER TABLE "Environment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Environment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Environment" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Environment" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- RLS Application
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Application" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Application" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- RLS Deployment
ALTER TABLE "Deployment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deployment" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Deployment" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Deployment" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- RLS Incident
ALTER TABLE "Incident" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Incident" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Incident" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Incident" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- RLS DeployedPullRequest
ALTER TABLE "DeployedPullRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeployedPullRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "DeployedPullRequest" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "DeployedPullRequest" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
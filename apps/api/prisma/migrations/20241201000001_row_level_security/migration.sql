-- Workspace
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Workspace" USING ("id" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Workspace" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Installation
ALTER TABLE "Installation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Installation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Installation" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Installation" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- WorkspaceMembership
ALTER TABLE "WorkspaceMembership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceMembership" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "WorkspaceMembership" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "WorkspaceMembership" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Repository
ALTER TABLE "Repository" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Repository" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Repository" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Repository" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Pull Request
ALTER TABLE "PullRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PullRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "PullRequest" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "PullRequest" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Pull Request Tracking
ALTER TABLE "PullRequestTracking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PullRequestTracking" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "PullRequestTracking" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "PullRequestTracking" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Code Review
ALTER TABLE "CodeReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CodeReview" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "CodeReview" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "CodeReview" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Team
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Team" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Team" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Team" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- TeamMember
ALTER TABLE "TeamMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TeamMember" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "TeamMember" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "TeamMember" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');


-- Integration
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Integration" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Integration" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Subscription
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Subscription" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Subscription" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Digest
ALTER TABLE "Digest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Digest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Digest" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Digest" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

-- Automation
ALTER TABLE "Automation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Automation" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "Automation" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "Automation" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

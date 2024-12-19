-- CreateTable
CREATE TABLE "CodeReviewRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "pullRequestId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeReviewRequest_workspaceId_idx" ON "CodeReviewRequest"("workspaceId");

-- CreateIndex
CREATE INDEX "CodeReviewRequest_reviewerId_idx" ON "CodeReviewRequest"("reviewerId");

-- CreateIndex
CREATE INDEX "CodeReviewRequest_pullRequestId_idx" ON "CodeReviewRequest"("pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeReviewRequest_pullRequestId_reviewerId_key" ON "CodeReviewRequest"("pullRequestId", "reviewerId");

-- RLS
ALTER TABLE "CodeReviewRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CodeReviewRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON "CodeReviewRequest" USING ("workspaceId" = current_setting('app.current_workspace_id', TRUE)::int);
CREATE POLICY bypass_rls_policy ON "CodeReviewRequest" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');

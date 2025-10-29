-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "mergeCommitSha" TEXT;

-- AlterTable
ALTER TABLE "PullRequestTracking" ADD COLUMN     "firstDeployedAt" TIMESTAMP(3),
ADD COLUMN     "timeToDeploy" BIGINT;

-- CreateEnum
CREATE TYPE "DeploymentChangeType" AS ENUM ('FORWARD', 'ROLLBACK', 'BASELINE', 'DIVERGED', 'NO_CHANGE');

-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "changeType" "DeploymentChangeType";

-- Rename the table
ALTER TABLE "DeployedPullRequest" RENAME TO "DeploymentPullRequest";

-- Rename primary key constraint
ALTER INDEX "DeployedPullRequest_pkey" RENAME TO "DeploymentPullRequest_pkey";

-- Rename unique constraint
ALTER INDEX "DeployedPullRequest_deploymentId_pullRequestId_key" RENAME TO "DeploymentPullRequest_deploymentId_pullRequestId_key";

-- Rename regular indexes
ALTER INDEX "DeployedPullRequest_deploymentId_idx" RENAME TO "DeploymentPullRequest_deploymentId_idx";
ALTER INDEX "DeployedPullRequest_pullRequestId_idx" RENAME TO "DeploymentPullRequest_pullRequestId_idx";
ALTER INDEX "DeployedPullRequest_workspaceId_idx" RENAME TO "DeploymentPullRequest_workspaceId_idx";

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "mergeCommitSha" TEXT;

-- AlterTable
ALTER TABLE "PullRequestTracking" ADD COLUMN     "firstDeployedAt" TIMESTAMP(3),
ADD COLUMN     "timeToDeploy" BIGINT;

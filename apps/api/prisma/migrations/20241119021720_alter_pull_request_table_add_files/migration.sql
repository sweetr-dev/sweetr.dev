-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "files" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "PullRequestTracking" ADD COLUMN     "linesTracked" INTEGER NOT NULL DEFAULT 0;

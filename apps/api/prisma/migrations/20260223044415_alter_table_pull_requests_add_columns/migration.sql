-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "labels" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "sourceBranch" TEXT NOT NULL DEFAULT '';

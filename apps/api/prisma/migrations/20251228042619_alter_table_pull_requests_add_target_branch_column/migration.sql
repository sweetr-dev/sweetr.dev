-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "targetBranch" TEXT NOT NULL DEFAULT 'main';

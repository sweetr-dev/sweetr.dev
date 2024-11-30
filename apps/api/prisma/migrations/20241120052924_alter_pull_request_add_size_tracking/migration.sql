/*
  Warnings:

  - You are about to drop the column `linesTracked` on the `PullRequestTracking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PullRequestTracking" DROP COLUMN "linesTracked",
ADD COLUMN     "changedFilesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "linesAddedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "linesDeletedCount" INTEGER NOT NULL DEFAULT 0;

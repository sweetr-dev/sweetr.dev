/*
  Warnings:

  - You are about to drop the column `available` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `benefits` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `docsUrl` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Automation` table. All the data in the column will be lost.
  - You are about to drop the `AutomationSetting` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workspaceId,type]` on the table `Automation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enabled` to the `Automation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settings` to the `Automation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Automation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Automation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('PR_TITLE_CHECK', 'PR_SIZE_LABELER');

-- DropIndex
DROP INDEX "Automation_slug_key";

-- AlterTable
ALTER TABLE "Automation" DROP COLUMN "available",
DROP COLUMN "benefits",
DROP COLUMN "color",
DROP COLUMN "demoUrl",
DROP COLUMN "description",
DROP COLUMN "docsUrl",
DROP COLUMN "icon",
DROP COLUMN "shortDescription",
DROP COLUMN "slug",
DROP COLUMN "title",
ADD COLUMN     "enabled" BOOLEAN NOT NULL,
ADD COLUMN     "settings" JSONB NOT NULL,
ADD COLUMN     "type" "AutomationType" NOT NULL,
ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AutomationSetting";

-- CreateIndex
CREATE INDEX "Automation_workspaceId_type_idx" ON "Automation"("workspaceId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Automation_workspaceId_type_key" ON "Automation"("workspaceId", "type");

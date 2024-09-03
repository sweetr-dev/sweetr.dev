-- CreateEnum
CREATE TYPE "IntegrationApp" AS ENUM ('SLACK');

-- CreateTable
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "app" "IntegrationApp" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Integration_workspaceId_app_idx" ON "Integration"("workspaceId", "app");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_app_key" ON "Integration"("workspaceId", "app");

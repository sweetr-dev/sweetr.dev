-- CreateEnum
CREATE TYPE "GitProvider" AS ENUM ('GITHUB');

-- CreateEnum
CREATE TYPE "InstallationTargetType" AS ENUM ('ORGANIZATION', 'USER');

-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "PullRequestSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE');

-- CreateEnum
CREATE TYPE "CodeReviewState" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'COMMENTED');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('DESIGNER', 'ENGINEER', 'LEADER', 'MANAGER', 'PRODUCT', 'QA');

-- CreateEnum
CREATE TYPE "IntegrationApp" AS ENUM ('SLACK');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('PR_TITLE_CHECK', 'PR_SIZE_LABELER');

-- CreateEnum
CREATE TYPE "DigestType" AS ENUM ('TEAM_METRICS', 'TEAM_WIP');

-- CreateEnum
CREATE TYPE "DayOfTheWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "GitProfile" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "gitUserId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "gitOrganizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "trialEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER,
    "gitProfileId" INTEGER,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "object" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" SERIAL NOT NULL,
    "gitInstallationId" TEXT NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "InstallationTargetType" NOT NULL,
    "repositorySelection" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "events" JSONB NOT NULL,
    "suspendedAt" TIMESTAMP(3),
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" SERIAL NOT NULL,
    "gitProfileId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "gitRepositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL,
    "isFork" BOOLEAN NOT NULL,
    "isMirror" BOOLEAN NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "starCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "gitPullRequestId" TEXT NOT NULL,
    "gitUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "files" JSONB NOT NULL DEFAULT '[]',
    "commentCount" INTEGER NOT NULL,
    "changedFilesCount" INTEGER NOT NULL,
    "linesAddedCount" INTEGER NOT NULL,
    "linesDeletedCount" INTEGER NOT NULL,
    "state" "PullRequestState" NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "repositoryId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequestTracking" (
    "id" SERIAL NOT NULL,
    "changedFilesCount" INTEGER NOT NULL DEFAULT 0,
    "linesAddedCount" INTEGER NOT NULL DEFAULT 0,
    "linesDeletedCount" INTEGER NOT NULL DEFAULT 0,
    "size" "PullRequestSize" NOT NULL,
    "firstCommitAt" TIMESTAMP(3),
    "firstDraftedAt" TIMESTAMP(3),
    "firstReadyAt" TIMESTAMP(3),
    "firstReviewerRequestedAt" TIMESTAMP(3),
    "firstReviewAt" TIMESTAMP(3),
    "firstApprovalAt" TIMESTAMP(3),
    "timeToCode" BIGINT,
    "timeToFirstReview" BIGINT,
    "timeToFirstApproval" BIGINT,
    "timeToMerge" BIGINT,
    "cycleTime" BIGINT,
    "pullRequestId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PullRequestTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeReview" (
    "id" SERIAL NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "state" "CodeReviewState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "startColor" TEXT NOT NULL,
    "endColor" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gitProfileId" INTEGER,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Digest" (
    "id" SERIAL NOT NULL,
    "type" "DigestType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "channel" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "dayOfTheWeek" "DayOfTheWeek"[],
    "timeOfDay" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "teamId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Digest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" SERIAL NOT NULL,
    "type" "AutomationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "settings" JSONB NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "GitProfile_userId_idx" ON "GitProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitProfile_gitProvider_gitUserId_key" ON "GitProfile"("gitProvider", "gitUserId");

-- CreateIndex
CREATE UNIQUE INDEX "GitProfile_gitProvider_userId_key" ON "GitProfile"("gitProvider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_gitProvider_gitOrganizationId_key" ON "Organization"("gitProvider", "gitOrganizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_gitProfileId_key" ON "Workspace"("gitProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organizationId_key" ON "Workspace"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_key" ON "Subscription"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_gitInstallationId_key" ON "Installation"("gitInstallationId");

-- CreateIndex
CREATE UNIQUE INDEX "Installation_workspaceId_key" ON "Installation"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_idx" ON "WorkspaceMembership"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_gitProfileId_workspaceId_key" ON "WorkspaceMembership"("gitProfileId", "workspaceId");

-- CreateIndex
CREATE INDEX "Repository_workspaceId_idx" ON "Repository"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_gitProvider_gitRepositoryId_key" ON "Repository"("gitProvider", "gitRepositoryId");

-- CreateIndex
CREATE INDEX "PullRequest_workspaceId_idx" ON "PullRequest"("workspaceId");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");

-- CreateIndex
CREATE INDEX "PullRequest_authorId_idx" ON "PullRequest"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_gitProvider_gitPullRequestId_key" ON "PullRequest"("gitProvider", "gitPullRequestId");

-- CreateIndex
CREATE INDEX "PullRequestTracking_workspaceId_idx" ON "PullRequestTracking"("workspaceId");

-- CreateIndex
CREATE INDEX "PullRequestTracking_pullRequestId_idx" ON "PullRequestTracking"("pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequestTracking_pullRequestId_key" ON "PullRequestTracking"("pullRequestId");

-- CreateIndex
CREATE INDEX "CodeReview_workspaceId_idx" ON "CodeReview"("workspaceId");

-- CreateIndex
CREATE INDEX "CodeReview_authorId_idx" ON "CodeReview"("authorId");

-- CreateIndex
CREATE INDEX "CodeReview_pullRequestId_idx" ON "CodeReview"("pullRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeReview_pullRequestId_authorId_key" ON "CodeReview"("pullRequestId", "authorId");

-- CreateIndex
CREATE INDEX "Team_workspaceId_idx" ON "Team"("workspaceId");

-- CreateIndex
CREATE INDEX "TeamMember_workspaceId_idx" ON "TeamMember"("workspaceId");

-- CreateIndex
CREATE INDEX "TeamMember_gitProfileId_idx" ON "TeamMember"("gitProfileId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "Digest_workspaceId_idx" ON "Digest"("workspaceId");

-- CreateIndex
CREATE INDEX "Digest_teamId_idx" ON "Digest"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Digest_teamId_type_key" ON "Digest"("teamId", "type");

-- CreateIndex
CREATE INDEX "Automation_workspaceId_type_idx" ON "Automation"("workspaceId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Automation_workspaceId_type_key" ON "Automation"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "Integration_workspaceId_app_idx" ON "Integration"("workspaceId", "app");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_app_key" ON "Integration"("workspaceId", "app");


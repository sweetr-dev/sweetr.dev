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

-- CreateTable
CREATE TABLE "GitProfile" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "gitUserId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "userId" INTEGER,

    CONSTRAINT "GitProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,

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

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "demoUrl" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "benefits" JSONB NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "docsUrl" TEXT,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "organizationId" INTEGER,
    "gitProfileId" INTEGER,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" SERIAL NOT NULL,
    "gitProfileId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "role" TEXT,

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
    "workspaceId" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "teamId" INTEGER NOT NULL,
    "gitProfileId" INTEGER,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationSetting" (
    "id" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "settings" JSONB NOT NULL,
    "automationId" INTEGER NOT NULL,
    "workspaceId" INTEGER,
    "repositoryId" INTEGER,
    "teamId" INTEGER,

    CONSTRAINT "AutomationSetting_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Automation_slug_key" ON "Automation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_gitProfileId_key" ON "Workspace"("gitProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organizationId_key" ON "Workspace"("organizationId");

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
CREATE INDEX "AutomationSetting_workspaceId_idx" ON "AutomationSetting"("workspaceId");

-- CreateIndex
CREATE INDEX "AutomationSetting_automationId_idx" ON "AutomationSetting"("automationId");

-- CreateIndex
CREATE INDEX "AutomationSetting_repositoryId_idx" ON "AutomationSetting"("repositoryId");

-- CreateIndex
CREATE INDEX "AutomationSetting_teamId_idx" ON "AutomationSetting"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSetting_automationId_workspaceId_key" ON "AutomationSetting"("automationId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSetting_automationId_repositoryId_key" ON "AutomationSetting"("automationId", "repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationSetting_automationId_teamId_key" ON "AutomationSetting"("automationId", "teamId");


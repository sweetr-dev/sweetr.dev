-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('CODE_REVIEW_SUBMITTED', 'PULL_REQUEST_MERGED', 'PULL_REQUEST_CREATED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('SLOW_REVIEW', 'SLOW_MERGE', 'MERGED_WITHOUT_APPROVAL', 'HOT_PR', 'UNRELEASED_CHANGES');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('PR_TITLE_CHECK', 'PR_SIZE_LABELER');

-- CreateEnum
CREATE TYPE "CodeReviewState" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'COMMENTED');

-- CreateEnum
CREATE TYPE "DayOfTheWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "DeploymentChangeType" AS ENUM ('FORWARD', 'ROLLBACK', 'BASELINE', 'DIVERGED', 'NO_CHANGE');

-- CreateEnum
CREATE TYPE "DigestType" AS ENUM ('TEAM_METRICS', 'TEAM_WIP');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "GitProvider" AS ENUM ('GITHUB');

-- CreateEnum
CREATE TYPE "InstallationTargetType" AS ENUM ('ORGANIZATION', 'USER');

-- CreateEnum
CREATE TYPE "IntegrationApp" AS ENUM ('SLACK');

-- CreateEnum
CREATE TYPE "PullRequestSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE');

-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('DESIGNER', 'ENGINEER', 'LEADER', 'MANAGER', 'PRODUCT', 'QA');

-- CreateTable
CREATE TABLE "ActivityEvent" (
    "id" SERIAL NOT NULL,
    "type" "ActivityEventType" NOT NULL,
    "metadata" JSONB NOT NULL,
    "eventId" TEXT,
    "eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gitProfileId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "pullRequestId" INTEGER,
    "repositoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "type" "AlertType" NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "channel" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "teamId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" SERIAL NOT NULL,
    "alertId" INTEGER NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "repositoryId" INTEGER NOT NULL,
    "teamId" INTEGER,
    "deploymentSettings" JSONB NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "CodeReviewRequest" (
    "id" SERIAL NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "reviewerId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CodeReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "environmentId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "deployedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "commitHash" TEXT NOT NULL,
    "changeType" "DeploymentChangeType",

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentPullRequest" (
    "id" SERIAL NOT NULL,
    "deploymentId" INTEGER NOT NULL,
    "pullRequestId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeploymentPullRequest_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Environment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isProduction" BOOLEAN NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER,
    "leaderId" INTEGER,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "causeDeploymentId" INTEGER NOT NULL,
    "fixDeploymentId" INTEGER,
    "postmortemUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "app" "IntegrationApp" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
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
    "mergeCommitSha" TEXT,
    "targetBranch" TEXT NOT NULL DEFAULT 'main',

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
    "firstDeployedAt" TIMESTAMP(3),
    "timeToDeploy" BIGINT,

    CONSTRAINT "PullRequestTracking_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "SyncBatch" (
    "id" SERIAL NOT NULL,
    "sinceDaysAgo" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "SyncBatch_pkey" PRIMARY KEY ("id")
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
    "gitProfileId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "gitProvider" "GitProvider" NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "trialEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER,
    "gitProfileId" INTEGER,
    "featureAdoption" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "ActivityEvent_gitProfileId_idx" ON "ActivityEvent"("gitProfileId" ASC);

-- CreateIndex
CREATE INDEX "ActivityEvent_pullRequestId_idx" ON "ActivityEvent"("pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "ActivityEvent_repositoryId_idx" ON "ActivityEvent"("repositoryId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ActivityEvent_workspaceId_eventId_key" ON "ActivityEvent"("workspaceId" ASC, "eventId" ASC);

-- CreateIndex
CREATE INDEX "ActivityEvent_workspaceId_idx" ON "ActivityEvent"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Alert_teamId_idx" ON "Alert"("teamId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_teamId_type_key" ON "Alert"("teamId" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "Alert_workspaceId_idx" ON "Alert"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "AlertEvent_alertId_idx" ON "AlertEvent"("alertId" ASC);

-- CreateIndex
CREATE INDEX "AlertEvent_pullRequestId_idx" ON "AlertEvent"("pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "AlertEvent_workspaceId_idx" ON "AlertEvent"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "ApiKey_creatorId_idx" ON "ApiKey"("creatorId" ASC);

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key" ASC);

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_idx" ON "ApiKey"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Application_repositoryId_idx" ON "Application"("repositoryId" ASC);

-- CreateIndex
CREATE INDEX "Application_teamId_idx" ON "Application"("teamId" ASC);

-- CreateIndex
CREATE INDEX "Application_workspaceId_idx" ON "Application"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Application_workspaceId_name_key" ON "Application"("workspaceId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "Automation_workspaceId_type_idx" ON "Automation"("workspaceId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Automation_workspaceId_type_key" ON "Automation"("workspaceId" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "CodeReview_authorId_idx" ON "CodeReview"("authorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CodeReview_pullRequestId_authorId_key" ON "CodeReview"("pullRequestId" ASC, "authorId" ASC);

-- CreateIndex
CREATE INDEX "CodeReview_pullRequestId_idx" ON "CodeReview"("pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "CodeReview_workspaceId_idx" ON "CodeReview"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "CodeReviewRequest_pullRequestId_idx" ON "CodeReviewRequest"("pullRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CodeReviewRequest_pullRequestId_reviewerId_key" ON "CodeReviewRequest"("pullRequestId" ASC, "reviewerId" ASC);

-- CreateIndex
CREATE INDEX "CodeReviewRequest_reviewerId_idx" ON "CodeReviewRequest"("reviewerId" ASC);

-- CreateIndex
CREATE INDEX "CodeReviewRequest_workspaceId_idx" ON "CodeReviewRequest"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Deployment_applicationId_idx" ON "Deployment"("applicationId" ASC);

-- CreateIndex
CREATE INDEX "Deployment_authorId_idx" ON "Deployment"("authorId" ASC);

-- CreateIndex
CREATE INDEX "Deployment_environmentId_idx" ON "Deployment"("environmentId" ASC);

-- CreateIndex
CREATE INDEX "Deployment_workspaceId_deployedAt_idx" ON "Deployment"("workspaceId" ASC, "deployedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Deployment_workspaceId_environmentId_applicationId_version__key" ON "Deployment"("workspaceId" ASC, "environmentId" ASC, "applicationId" ASC, "version" ASC, "deployedAt" ASC);

-- CreateIndex
CREATE INDEX "Deployment_workspaceId_idx" ON "Deployment"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "DeploymentPullRequest_deploymentId_idx" ON "DeploymentPullRequest"("deploymentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DeploymentPullRequest_deploymentId_pullRequestId_key" ON "DeploymentPullRequest"("deploymentId" ASC, "pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "DeploymentPullRequest_pullRequestId_idx" ON "DeploymentPullRequest"("pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "DeploymentPullRequest_workspaceId_idx" ON "DeploymentPullRequest"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Digest_teamId_idx" ON "Digest"("teamId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Digest_teamId_type_key" ON "Digest"("teamId" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "Digest_workspaceId_idx" ON "Digest"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Environment_workspaceId_idx" ON "Environment"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Environment_workspaceId_name_key" ON "Environment"("workspaceId" ASC, "name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "GitProfile_gitProvider_gitUserId_key" ON "GitProfile"("gitProvider" ASC, "gitUserId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "GitProfile_gitProvider_userId_key" ON "GitProfile"("gitProvider" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "GitProfile_userId_idx" ON "GitProfile"("userId" ASC);

-- CreateIndex
CREATE INDEX "Incident_causeDeploymentId_idx" ON "Incident"("causeDeploymentId" ASC);

-- CreateIndex
CREATE INDEX "Incident_fixDeploymentId_idx" ON "Incident"("fixDeploymentId" ASC);

-- CreateIndex
CREATE INDEX "Incident_leaderId_idx" ON "Incident"("leaderId" ASC);

-- CreateIndex
CREATE INDEX "Incident_teamId_idx" ON "Incident"("teamId" ASC);

-- CreateIndex
CREATE INDEX "Incident_workspaceId_detectedAt_idx" ON "Incident"("workspaceId" ASC, "detectedAt" ASC);

-- CreateIndex
CREATE INDEX "Incident_workspaceId_idx" ON "Incident"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Installation_gitInstallationId_key" ON "Installation"("gitInstallationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Installation_workspaceId_key" ON "Installation"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Integration_workspaceId_app_idx" ON "Integration"("workspaceId" ASC, "app" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspaceId_app_key" ON "Integration"("workspaceId" ASC, "app" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_gitProvider_gitOrganizationId_key" ON "Organization"("gitProvider" ASC, "gitOrganizationId" ASC);

-- CreateIndex
CREATE INDEX "PullRequest_authorId_idx" ON "PullRequest"("authorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_gitProvider_gitPullRequestId_key" ON "PullRequest"("gitProvider" ASC, "gitPullRequestId" ASC);

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId" ASC);

-- CreateIndex
CREATE INDEX "PullRequest_workspaceId_idx" ON "PullRequest"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "PullRequestTracking_pullRequestId_idx" ON "PullRequestTracking"("pullRequestId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PullRequestTracking_pullRequestId_key" ON "PullRequestTracking"("pullRequestId" ASC);

-- CreateIndex
CREATE INDEX "PullRequestTracking_workspaceId_idx" ON "PullRequestTracking"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_gitProvider_gitRepositoryId_key" ON "Repository"("gitProvider" ASC, "gitRepositoryId" ASC);

-- CreateIndex
CREATE INDEX "Repository_workspaceId_idx" ON "Repository"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspaceId_key" ON "Subscription"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "SyncBatch_workspaceId_idx" ON "SyncBatch"("workspaceId" ASC);

-- CreateIndex
CREATE INDEX "Team_workspaceId_idx" ON "Team"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Team_workspaceId_name_key" ON "Team"("workspaceId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "TeamMember_gitProfileId_idx" ON "TeamMember"("gitProfileId" ASC);

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId" ASC);

-- CreateIndex
CREATE INDEX "TeamMember_workspaceId_idx" ON "TeamMember"("workspaceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_gitProfileId_key" ON "Workspace"("gitProfileId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_organizationId_key" ON "Workspace"("organizationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_gitProfileId_workspaceId_key" ON "WorkspaceMembership"("gitProfileId" ASC, "workspaceId" ASC);

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_idx" ON "WorkspaceMembership"("workspaceId" ASC);


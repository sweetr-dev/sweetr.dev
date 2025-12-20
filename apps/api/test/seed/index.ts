import { PrismaClient, GitProvider, PullRequestState } from "@prisma/client";

/**
 * Seed helpers: low-level, single-row insert functions.
 * All helpers require workspaceId for multi-tenant isolation.
 * All timestamps are explicit UTC for determinism.
 */

export interface SeedWorkspace {
  workspaceId: number;
  prisma: PrismaClient;
}

export interface SeedRepository {
  repositoryId: number;
  workspaceId: number;
}

export interface SeedApplication {
  applicationId: number;
  repositoryId: number;
  workspaceId: number;
}

export interface SeedEnvironment {
  environmentId: number;
  workspaceId: number;
}

export interface SeedGitProfile {
  gitProfileId: number;
}

/**
 * Creates a GitProfile for a workspace.
 */
export async function seedGitProfile(
  ctx: SeedWorkspace,
  options: {
    handle?: string;
    name?: string;
  } = {}
): Promise<SeedGitProfile> {
  const gitProfile = await ctx.prisma.gitProfile.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: `user-${Date.now()}-${Math.random()}`,
      handle: options.handle ?? "test-user",
      name: options.name ?? "Test User",
    },
  });

  return { gitProfileId: gitProfile.id };
}

/**
 * Creates a Repository for a workspace.
 */
export async function seedRepository(
  ctx: SeedWorkspace,
  options: {
    name?: string;
    fullName?: string;
  } = {}
): Promise<SeedRepository> {
  const repository = await ctx.prisma.repository.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitRepositoryId: `repo-${Date.now()}-${Math.random()}`,
      name: options.name ?? "test-repo",
      fullName: options.fullName ?? "test-org/test-repo",
      isPrivate: false,
      isFork: false,
      isMirror: false,
      starCount: 0,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      workspaceId: ctx.workspaceId,
    },
  });

  return {
    repositoryId: repository.id,
    workspaceId: ctx.workspaceId,
  };
}

/**
 * Creates an Application for a workspace.
 */
export async function seedApplication(
  ctx: SeedWorkspace,
  repositoryId: number,
  options: {
    name?: string;
  } = {}
): Promise<SeedApplication> {
  const application = await ctx.prisma.application.create({
    data: {
      name: options.name ?? "test-app",
      repositoryId,
      deploymentSettings: {},
      workspaceId: ctx.workspaceId,
    },
  });

  return {
    applicationId: application.id,
    repositoryId,
    workspaceId: ctx.workspaceId,
  };
}

/**
 * Creates an Environment for a workspace.
 */
export async function seedEnvironment(
  ctx: SeedWorkspace,
  options: {
    name?: string;
    isProduction?: boolean;
  } = {}
): Promise<SeedEnvironment> {
  const environment = await ctx.prisma.environment.create({
    data: {
      name: options.name ?? "production",
      isProduction: options.isProduction ?? true,
      workspaceId: ctx.workspaceId,
    },
  });

  return {
    environmentId: environment.id,
    workspaceId: ctx.workspaceId,
  };
}

/**
 * Creates a PullRequest for a workspace.
 */
export async function seedPullRequest(
  ctx: SeedWorkspace,
  repositoryId: number,
  authorId: number,
  options: {
    number?: string;
    title?: string;
    state?: PullRequestState;
    mergedAt?: Date;
    createdAt?: Date;
  } = {}
): Promise<{ pullRequestId: number }> {
  const pr = await ctx.prisma.pullRequest.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitPullRequestId: `pr-${Date.now()}-${Math.random()}`,
      gitUrl: `https://github.com/test/repo/pull/${options.number ?? "1"}`,
      title: options.title ?? "Test PR",
      number: options.number ?? "1",
      files: [],
      commentCount: 0,
      changedFilesCount: 0,
      linesAddedCount: 0,
      linesDeletedCount: 0,
      state: options.state ?? PullRequestState.MERGED,
      mergedAt: options.mergedAt,
      createdAt: options.createdAt ?? new Date("2024-01-01T00:00:00Z"),
      updatedAt: options.createdAt ?? new Date("2024-01-01T00:00:00Z"),
      repositoryId,
      authorId,
      workspaceId: ctx.workspaceId,
    },
  });

  return { pullRequestId: pr.id };
}

/**
 * Creates a Deployment for a workspace.
 */
export async function seedDeployment(
  ctx: SeedWorkspace,
  applicationId: number,
  environmentId: number,
  options: {
    version?: string;
    commitHash?: string;
    deployedAt: Date;
    authorId?: number;
  }
): Promise<{ deploymentId: number }> {
  const deployment = await ctx.prisma.deployment.create({
    data: {
      applicationId,
      environmentId,
      version: options.version ?? "1.0.0",
      commitHash: options.commitHash ?? `commit-${Date.now()}`,
      deployedAt: options.deployedAt,
      authorId: options.authorId,
      workspaceId: ctx.workspaceId,
    },
  });

  return { deploymentId: deployment.id };
}

/**
 * Links a PullRequest to a Deployment.
 */
export async function seedDeploymentPullRequest(
  ctx: SeedWorkspace,
  deploymentId: number,
  pullRequestId: number
): Promise<void> {
  await ctx.prisma.deploymentPullRequest.create({
    data: {
      deploymentId,
      pullRequestId,
      workspaceId: ctx.workspaceId,
    },
  });
}

/**
 * Creates an Incident for a workspace.
 */
export async function seedIncident(
  ctx: SeedWorkspace,
  causeDeploymentId: number,
  options: {
    detectedAt: Date;
    resolvedAt?: Date;
    fixDeploymentId?: number;
  }
): Promise<{ incidentId: number }> {
  const incident = await ctx.prisma.incident.create({
    data: {
      causeDeploymentId,
      fixDeploymentId: options.fixDeploymentId,
      detectedAt: options.detectedAt,
      resolvedAt: options.resolvedAt,
      workspaceId: ctx.workspaceId,
    },
  });

  return { incidentId: incident.id };
}




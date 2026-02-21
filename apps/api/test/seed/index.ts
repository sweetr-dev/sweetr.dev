import { GitProvider, PullRequestState, TeamMemberRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { getPrisma } from "../../src/prisma";

/**
 * Seed helpers: low-level, single-row insert functions.
 * All helpers require workspaceId for multi-tenant isolation.
 * All timestamps are explicit UTC for determinism.
 */

export interface SeedWorkspace {
  workspaceId: number;
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

export interface SeedTeam {
  teamId: number;
  workspaceId: number;
}

/**
 * Creates a GitProfile for a workspace.
 */
export async function seedGitProfile(
  ctx: SeedWorkspace,
  input: {
    handle?: string;
    name?: string;
  } = {}
): Promise<SeedGitProfile> {
  const gitProfile = await getPrisma(ctx.workspaceId).gitProfile.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitUserId: `user-${Date.now()}-${randomUUID()}`,
      handle: input.handle ?? "test-user",
      name: input.name ?? "Test User",
    },
  });

  return { gitProfileId: gitProfile.id };
}

/**
 * Creates a Repository for a workspace.
 */
export async function seedRepository(
  ctx: SeedWorkspace,
  input: {
    name?: string;
    fullName?: string;
  } = {}
): Promise<SeedRepository> {
  const repository = await getPrisma(ctx.workspaceId).repository.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitRepositoryId: `repo-${Date.now()}-${randomUUID()}`,
      name: input.name ?? "test-repo",
      fullName: input.fullName ?? "test-org/test-repo",
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
 * Creates a Team for a workspace.
 */
export async function seedTeam(
  ctx: SeedWorkspace,
  input: {
    name?: string;
    description?: string;
    icon?: string;
    startColor?: string;
    endColor?: string;
  } = {}
): Promise<SeedTeam> {
  const team = await getPrisma(ctx.workspaceId).team.create({
    data: {
      name:
        input.name ??
        `team-${Date.now()}-${randomUUID().toString().substring(7)}`,
      description: input.description,
      icon: input.icon ?? "🚀",
      startColor: input.startColor ?? "#000000",
      endColor: input.endColor ?? "#000000",
      workspaceId: ctx.workspaceId,
    },
  });

  return {
    teamId: team.id,
    workspaceId: ctx.workspaceId,
  };
}

/**
 * Creates a TeamMember linking a GitProfile to a Team.
 */
export async function seedTeamMember(
  ctx: SeedWorkspace,
  teamId: number,
  gitProfileId: number,
  input: {
    role?: TeamMemberRole;
  } = {}
): Promise<{ teamMemberId: number }> {
  const teamMember = await getPrisma(ctx.workspaceId).teamMember.create({
    data: {
      teamId,
      gitProfileId,
      role: input.role ?? TeamMemberRole.ENGINEER,
      workspaceId: ctx.workspaceId,
    },
  });

  return { teamMemberId: teamMember.id };
}

/**
 * Creates an Application for a workspace.
 */
export async function seedApplication(
  ctx: SeedWorkspace,
  repositoryId: number,
  input: {
    name?: string;
    teamId?: number;
  } = {}
): Promise<SeedApplication> {
  const application = await getPrisma(ctx.workspaceId).application.create({
    data: {
      name: input.name ?? "test-app",
      repositoryId,
      teamId: input.teamId,
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
  input: {
    name?: string;
    isProduction?: boolean;
  } = {}
): Promise<SeedEnvironment> {
  const environment = await getPrisma(ctx.workspaceId).environment.create({
    data: {
      name:
        input.name ??
        `env-${Date.now()}-${randomUUID().toString().substring(7)}`,
      isProduction: input.isProduction ?? true,
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
  input: {
    number?: string;
    title?: string;
    state?: PullRequestState;
    mergedAt?: Date;
    createdAt?: Date;
  } = {}
): Promise<{ pullRequestId: number }> {
  const pr = await getPrisma(ctx.workspaceId).pullRequest.create({
    data: {
      gitProvider: GitProvider.GITHUB,
      gitPullRequestId: `pr-${Date.now()}-${randomUUID()}`,
      gitUrl: `https://github.com/test/repo/pull/${input.number ?? "1"}`,
      title: input.title ?? "Test PR",
      number: input.number ?? "1",
      files: [],
      commentCount: 0,
      changedFilesCount: 0,
      linesAddedCount: 0,
      linesDeletedCount: 0,
      state: input.state ?? PullRequestState.MERGED,
      mergedAt: input.mergedAt,
      createdAt: input.createdAt ?? new Date("2024-01-01T00:00:00Z"),
      updatedAt: input.createdAt ?? new Date("2024-01-01T00:00:00Z"),
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
  input: {
    version?: string;
    commitHash?: string;
    deployedAt: Date;
    authorId?: number;
  }
): Promise<{ deploymentId: number }> {
  const deployment = await getPrisma(ctx.workspaceId).deployment.create({
    data: {
      applicationId,
      environmentId,
      version: input.version ?? "1.0.0",
      commitHash: input.commitHash ?? `commit-${Date.now()}`,
      deployedAt: input.deployedAt,
      authorId: input.authorId,
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
  await getPrisma(ctx.workspaceId).deploymentPullRequest.create({
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
  input: {
    detectedAt: Date;
    resolvedAt?: Date;
    fixDeploymentId?: number;
  }
): Promise<{ incidentId: number }> {
  const incident = await getPrisma(ctx.workspaceId).incident.create({
    data: {
      causeDeploymentId,
      fixDeploymentId: input.fixDeploymentId,
      detectedAt: input.detectedAt,
      resolvedAt: input.resolvedAt,
      workspaceId: ctx.workspaceId,
    },
  });

  return { incidentId: incident.id };
}

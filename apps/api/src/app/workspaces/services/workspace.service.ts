import {
  GitProfile,
  Installation,
  Organization,
  Workspace,
} from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { redisConnection } from "../../../bull-mq/redis-connection";
import { UnknownException } from "../../errors/exceptions/unknown.exception";
import { captureException } from "../../../lib/sentry";

type WorkspaceWithUserOrOrganization = Workspace & {
  gitProfile: GitProfile | null;
  organization: Organization | null;
};

export const findWorkspaceByIdOrThrow = (workspaceId: number) => {
  // https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prisma-clients-dataloader
  return getPrisma(workspaceId).workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: {
      memberships: true,
      organization: true,
      installation: true,
      gitProfile: true,
    },
  });
};

export const findWorkspaceByGitInstallationId = (gitInstallationId: string) => {
  return getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId,
      },
    },
    include: {
      repositories: true,
      organization: true,
      installation: true,
      memberships: true,
      gitProfile: true,
    },
  });
};

export const findUserWorkspaces = async (gitProfileId: number) => {
  return getBypassRlsPrisma().workspace.findMany({
    where: {
      memberships: {
        some: {
          gitProfileId,
        },
      },
    },
    include: {
      organization: true,
      installation: true,
      gitProfile: true,
    },
  });
};

export const findWorkspaceUsers = (workspaceId: number) => {
  return getPrisma(workspaceId).gitProfile.findMany({
    where: {
      workspaceMemberships: {
        some: {
          workspaceId,
        },
      },
      NOT: {
        userId: null,
      },
    },
    include: {
      user: true,
    },
  });
};

export const getWorkspaceName = (
  workspace: WorkspaceWithUserOrOrganization
): string => {
  if (workspace.gitProfile) {
    const firstName = workspace.gitProfile.name?.split(" ").at(0);
    const firstPiece = firstName ? `${firstName}'s` : "Your";

    return `${firstPiece} workspace`;
  }

  if (workspace.organization) {
    return workspace.organization.name;
  }

  throw new Error("Could not generate workspace name");
};

export const getWorkspaceHandle = (
  workspace: WorkspaceWithUserOrOrganization
): string => {
  if (workspace.organization) {
    return workspace.organization.handle;
  }

  if (workspace.gitProfile) {
    return workspace.gitProfile.handle;
  }

  return "";
};

export const getWorkspaceAvatar = (
  workspace: WorkspaceWithUserOrOrganization
): string | null => {
  if (workspace.organization) {
    return workspace.organization.avatar;
  }

  return null;
};

export const getWorkspaceUninstallGitUrl = (
  workspace: WorkspaceWithUserOrOrganization & {
    installation: Installation | null;
  }
): string => {
  if (workspace.organization) {
    return `https://github.com/organizations/${workspace.organization.handle}/settings/installations/${workspace.installation?.gitInstallationId}`;
  }

  return `https://github.com/settings/installations/${workspace.installation?.gitInstallationId}`;
};

export const setInitialSyncProgress = async (workspaceId: number) => {
  const key = `workspace:${workspaceId}:sync`;
  const sevenDaysInSeconds = 60 * 60 * 24 * 7;

  await redisConnection
    .multi()
    .hset(key, { waiting: 0, done: 0 })
    .expire(key, sevenDaysInSeconds)
    .exec();
};

export const incrementInitialSyncProgress = async (
  workspaceId: number,
  field: "waiting" | "done",
  amount: number
) => {
  const key = `workspace:${workspaceId}:sync`;

  await redisConnection.hincrby(key, field, amount);
};

export const getInitialSyncProgress = async (workspaceId: number) => {
  try {
    const progress = await redisConnection.hgetall(
      `workspace:${workspaceId}:sync`
    );

    if (!progress || !("waiting" in progress)) return 100;

    const done = Number(progress.done);
    const waiting = Number(progress.waiting);

    // Avoid division by zero
    if (waiting === 0) return 100;

    return Math.min(Math.round((done * 100) / waiting), 100);
  } catch (error) {
    captureException(
      new UnknownException("Redis: Could not get workspace sync progress.", {
        originalError: error,
        severity: "warning",
      })
    );

    return 100;
  }
};

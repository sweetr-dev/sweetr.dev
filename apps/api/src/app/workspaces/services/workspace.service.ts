import {
  GitProfile,
  Installation,
  Organization,
  Prisma,
  Workspace,
} from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";

type WorkspaceWithUserOrOrganization = Workspace & {
  gitProfile: GitProfile | null;
  organization: Organization | null;
};

export const findWorkspaceById = (workspaceId: number) => {
  // https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prisma-clients-dataloader
  return getPrisma(workspaceId).workspace.findUnique({
    where: { id: workspaceId },
    include: {
      memberships: true,
      organization: true,
      installation: true,
      gitProfile: true,
      subscription: true,
    },
  });
};

export const findWorkspaceByGitInstallationId = (
  gitInstallationId: string,
  include: Partial<Prisma.WorkspaceInclude> = {}
) => {
  return getBypassRlsPrisma().workspace.findFirst({
    where: {
      installation: {
        gitInstallationId,
      },
    },
    include: {
      organization: true,
      installation: true,
      gitProfile: true,
      ...include,
    },
  });
};

export const findWorkspaceByGitInstallationIdOrThrow = async (
  gitInstallationId: string,
  include: Partial<Prisma.WorkspaceInclude> = {}
) => {
  const workspace = await findWorkspaceByGitInstallationId(
    gitInstallationId,
    include
  );

  if (!workspace) {
    throw new ResourceNotFoundException("Workspace not found");
  }

  return workspace;
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

import {
  GitProfile,
  Installation,
  Organization,
  Workspace,
} from "@prisma/client";
import { getBypassRlsPrisma, getPrisma } from "../../../prisma";

type WorkspaceWithUserOrOrganization = Workspace & {
  gitProfile: GitProfile | null;
  organization: Organization | null;
};

export const findWorkspaceByid = (workspaceId: number) => {
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

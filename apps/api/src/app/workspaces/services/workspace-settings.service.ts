import { Workspace } from "@prisma/client";
import { getPrisma } from "../../../prisma";
import { ResourceNotFoundException } from "../../errors/exceptions/resource-not-found.exception";
import { WorkspaceSettings } from "./workspace-settings.types";
import { findWorkspaceById } from "./workspace.service";
import { DeepNullish } from "../../../lib/type-helpers";
import { config } from "../../../config";

export const updateWorkspaceSettings = async (
  workspaceId: number,
  input: DeepNullish<WorkspaceSettings>
) => {
  const workspace = await findWorkspaceById(workspaceId);

  if (!workspace) {
    throw new ResourceNotFoundException("Workspace not found");
  }

  return getPrisma(workspaceId).workspace.update({
    where: { id: workspaceId },
    data: { settings: mergeSettings(getWorkspaceSettings(workspace), input) },
    include: {
      memberships: true,
      organization: true,
      installation: true,
      gitProfile: true,
      subscription: true,
    },
  });
};

export const getWorkspaceSettings = (
  workspace: Pick<Workspace, "settings">
) => {
  return mergeSettings(
    getDefaultSettings(),
    workspace.settings as WorkspaceSettings
  );
};

const getDefaultSettings = (): WorkspaceSettings => {
  return {
    pullRequest: {
      size: {
        tiny: 20,
        small: 100,
        medium: 250,
        large: 500,
        ignorePatterns: config.glob.ignorableFilesGlob,
      },
    },
  };
};

const mergeSettings = (
  existingSettings: WorkspaceSettings,
  newSettings: DeepNullish<WorkspaceSettings>
): WorkspaceSettings => {
  return {
    pullRequest: {
      size: {
        tiny:
          newSettings.pullRequest?.size?.tiny ||
          existingSettings.pullRequest?.size?.tiny,
        small:
          newSettings.pullRequest?.size?.small ||
          existingSettings.pullRequest?.size?.small,
        medium:
          newSettings.pullRequest?.size?.medium ||
          existingSettings.pullRequest?.size?.medium,
        large:
          newSettings.pullRequest?.size?.large ||
          existingSettings.pullRequest?.size?.large,
        ignorePatterns:
          newSettings.pullRequest?.size?.ignorePatterns ||
          existingSettings.pullRequest?.size?.ignorePatterns,
      },
    },
  };
};

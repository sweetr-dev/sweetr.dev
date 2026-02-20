import {
  GitProfile,
  Installation,
  Organization,
  Workspace,
} from "@prisma/client";
import {
  Workspace as ApiWorkspace,
  WorkspaceFeatureAdoption,
} from "../../../../graphql-types";
import {
  getWorkspaceAvatar,
  getWorkspaceHandle,
  getWorkspaceName,
  getWorkspaceUninstallGitUrl,
} from "../../services/workspace.service";
import { getWorkspaceSettings } from "../../services/workspace-settings.service";

type WorkspaceWithRelations = Workspace & {
  gitProfile: GitProfile | null;
  organization: Organization | null;
  installation: Installation | null;
};

export const transformWorkspace = (
  workspace: WorkspaceWithRelations
): Pick<
  ApiWorkspace,
  | "id"
  | "name"
  | "handle"
  | "avatar"
  | "gitUninstallUrl"
  | "settings"
  | "featureAdoption"
> => {
  return {
    // Base properties
    id: workspace.id,
    name: getWorkspaceName(workspace),
    handle: getWorkspaceHandle(workspace),
    avatar: getWorkspaceAvatar(workspace),
    gitUninstallUrl: getWorkspaceUninstallGitUrl(workspace),
    settings: getWorkspaceSettings(workspace),
    featureAdoption: workspace.featureAdoption as WorkspaceFeatureAdoption,
  };
};

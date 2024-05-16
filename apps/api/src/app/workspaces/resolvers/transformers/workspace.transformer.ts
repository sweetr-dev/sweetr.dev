import {
  Workspace as DatabaseWorkspace,
  GitProfile,
  Installation,
  Organization,
} from "@prisma/client";
import { Workspace as ApiWorkspace } from "@sweetr/graphql-types/dist/api";
import {
  getWorkspaceAvatar,
  getWorkspaceHandle,
  getWorkspaceName,
  getWorkspaceUninstallGitUrl,
} from "../../services/workspace.service";

type WorkspaceWithRelations = DatabaseWorkspace & {
  gitProfile: GitProfile | null;
  organization: Organization | null;
  installation: Installation | null;
};

export const transformWorkspace = (
  workspace: WorkspaceWithRelations
): Pick<
  ApiWorkspace,
  "id" | "name" | "handle" | "avatar" | "gitUninstallUrl"
> => {
  return {
    // Base properties
    id: workspace.id,
    name: getWorkspaceName(workspace),
    handle: getWorkspaceHandle(workspace),
    avatar: getWorkspaceAvatar(workspace),
    gitUninstallUrl: getWorkspaceUninstallGitUrl(workspace),
  };
};
